import { BitbucketClient, type PaginationOptions } from "./client.js";
import type { Repository } from "../types/api.js";

export async function listRepositories(
  client: BitbucketClient,
  workspace: string,
  options?: PaginationOptions & { role?: string; sort?: string },
): Promise<{ values: Repository[]; size?: number }> {
  const params = new URLSearchParams();
  if (options?.role) params.set("role", options.role);
  if (options?.sort) params.set("sort", options.sort);

  const query = params.toString();
  const path = `/repositories/${workspace}${query ? `?${query}` : ""}`;
  return client.fetchAll<Repository>(path, options);
}

export async function getRepository(
  client: BitbucketClient,
  workspace: string,
  repoSlug: string,
): Promise<Repository> {
  return client.request<Repository>(
    `/repositories/${workspace}/${repoSlug}`,
  );
}
