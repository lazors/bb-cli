export class BitbucketApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "BitbucketApiError";
  }
}

function getScopeHint(path: string): string {
  if (path.includes("/pullrequests")) return "pullrequest:write";
  if (path.includes("/pipelines")) return "pipeline:write";
  if (path.includes("/repositories")) return "repository:write";
  return "";
}

export function handleApiError(error: unknown, path?: string): never {
  if (error instanceof BitbucketApiError) {
    const status = error.statusCode;

    if (status === 401) {
      outputError(
        "Authentication failed: invalid credentials. Run 'bb auth setup' to reconfigure credentials.",
        status,
      );
    }

    if (status === 403) {
      const scope = path ? getScopeHint(path) : "";
      const scopeMsg = scope
        ? ` Your App Password may be missing the '${scope}' scope.`
        : "";
      outputError(
        `Permission denied.${scopeMsg} Run 'bb auth setup' to reconfigure credentials.`,
        status,
      );
    }

    if (status === 404) {
      outputError("Resource not found. Verify the workspace, repository, and ID are correct.", status);
    }

    if (status === 409) {
      const bodyMsg = extractErrorMessage(error.body);
      outputError(bodyMsg || "Conflict: the operation could not be completed.", status);
    }

    if (status === 429) {
      const bodyMsg = extractErrorMessage(error.body);
      outputError(
        bodyMsg || "Rate limit exceeded. Wait and try again later.",
        status,
      );
    }

    if (status >= 500) {
      outputError(`Bitbucket server error (${status}). Try again later.`, status);
    }

    // Generic API error
    const bodyMsg = extractErrorMessage(error.body);
    outputError(bodyMsg || error.message, status);
  }

  if (error instanceof Error) {
    if (error.message.includes("fetch failed") || error.message.includes("ECONNREFUSED") || error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
      outputError(
        `Connection error: ${error.message}. Check your network connection and try again.`,
        0,
      );
    }
    outputError(error.message, 0);
  }

  outputError("An unexpected error occurred.", 0);
}

function extractErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (b.error && typeof b.error === "object") {
    const err = b.error as Record<string, unknown>;
    if (typeof err.message === "string") return err.message;
  }
  if (typeof b.message === "string") return b.message;
  return null;
}

export function outputError(message: string, statusCode?: number): never {
  const useJson = process.argv.includes("--json");
  if (useJson) {
    const errorObj = { error: { message, status: statusCode ?? 1 } };
    process.stderr.write(JSON.stringify(errorObj) + "\n");
  } else {
    process.stderr.write(`Error: ${message}\n`);
  }
  process.exit(1);
}
