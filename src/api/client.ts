import { resolveCredentials } from "../auth/credentials.js";
import { BitbucketApiError } from "../utils/errors.js";

const BASE_URL = "https://api.bitbucket.org/2.0";

export interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  rawResponse?: boolean;
}

export interface PaginationOptions {
  limit?: number;
  pageSize?: number;
}

export class BitbucketClient {
  private authHeader: string;
  private verbose: boolean;

  constructor(verbose = false) {
    const creds = resolveCredentials();
    this.authHeader = creds.authHeader;
    this.verbose = verbose;
  }

  async request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
    const method = options.method ?? "GET";

    const headers: Record<string, string> = {
      Authorization: this.authHeader,
      Accept: "application/json",
      ...options.headers,
    };

    if (options.body && !options.headers?.["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const start = Date.now();

    const response = await fetch(url, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (this.verbose) {
      const masked = this.authHeader.startsWith("Basic")
        ? "Authorization: Basic ****"
        : "Authorization: Bearer ****";
      const elapsed = Date.now() - start;
      process.stderr.write(
        `${method} ${url} → ${response.status} (${elapsed}ms) [${masked}]\n`,
      );
    }

    // Check rate limit warning
    if (response.headers.get("X-RateLimit-NearLimit") === "true") {
      process.stderr.write(
        "Warning: Approaching Bitbucket API rate limit.\n",
      );
    }

    if (!response.ok) {
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        body = { message: response.statusText };
      }

      // Special handling for 429 with Retry-After
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const retryMsg = retryAfter
          ? ` Retry after ${retryAfter} seconds.`
          : "";
        throw new BitbucketApiError(
          `Rate limit exceeded.${retryMsg}`,
          429,
          body,
        );
      }

      throw new BitbucketApiError(
        `API error: ${response.status} ${response.statusText}`,
        response.status,
        body,
      );
    }

    if (options.rawResponse) {
      return response as unknown as T;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  async requestText(path: string): Promise<string> {
    const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

    const start = Date.now();
    const response = await fetch(url, {
      headers: {
        Authorization: this.authHeader,
      },
    });

    if (this.verbose) {
      const masked = this.authHeader.startsWith("Basic")
        ? "Authorization: Basic ****"
        : "Authorization: Bearer ****";
      const elapsed = Date.now() - start;
      process.stderr.write(
        `GET ${url} → ${response.status} (${elapsed}ms) [${masked}]\n`,
      );
    }

    if (!response.ok) {
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        body = { message: response.statusText };
      }
      throw new BitbucketApiError(
        `API error: ${response.status} ${response.statusText}`,
        response.status,
        body,
      );
    }

    return response.text();
  }

  async fetchAll<T>(
    path: string,
    pagination?: PaginationOptions,
  ): Promise<{ values: T[]; size?: number }> {
    const pageSize = Math.min(pagination?.pageSize ?? 25, 100);
    const limit = pagination?.limit;

    const separator = path.includes("?") ? "&" : "?";
    let url = `${path}${separator}pagelen=${pageSize}`;
    const allValues: T[] = [];

    while (url) {
      const page = await this.request<{
        values: T[];
        next?: string;
        size?: number;
        page?: number;
        pagelen?: number;
      }>(url);

      allValues.push(...page.values);

      if (limit && allValues.length >= limit) {
        return { values: allValues.slice(0, limit), size: page.size };
      }

      url = page.next ?? "";
    }

    return { values: allValues, size: allValues.length };
  }
}
