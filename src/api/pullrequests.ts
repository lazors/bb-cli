import { BitbucketClient, type PaginationOptions } from "./client.js";
import type {
  PullRequest,
  Activity,
  DiffstatEntry,
  CommitEntry,
} from "../types/api.js";

export async function listPullRequests(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  options?: PaginationOptions & { state?: string },
): Promise<{ values: PullRequest[]; size?: number }> {
  const params = new URLSearchParams();
  if (options?.state) params.set("state", options.state.toUpperCase());

  const query = params.toString();
  const path = `/repositories/${workspace}/${repo}/pullrequests${query ? `?${query}` : ""}`;
  return client.fetchAll<PullRequest>(path, options);
}

export async function getPullRequest(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
): Promise<PullRequest> {
  return client.request<PullRequest>(
    `/repositories/${workspace}/${repo}/pullrequests/${prId}`,
  );
}

export async function createPullRequest(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  body: {
    title: string;
    source: { branch: { name: string } };
    destination?: { branch: { name: string } };
    description?: string;
    reviewers?: Array<{ username: string }>;
    close_source_branch?: boolean;
    draft?: boolean;
  },
): Promise<PullRequest> {
  return client.request<PullRequest>(
    `/repositories/${workspace}/${repo}/pullrequests`,
    { method: "POST", body },
  );
}

export async function updatePullRequest(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
  body: Record<string, unknown>,
): Promise<PullRequest> {
  return client.request<PullRequest>(
    `/repositories/${workspace}/${repo}/pullrequests/${prId}`,
    { method: "PUT", body },
  );
}

export async function approvePr(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
): Promise<void> {
  await client.request(
    `/repositories/${workspace}/${repo}/pullrequests/${prId}/approve`,
    { method: "POST" },
  );
}

export async function unapprovePr(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
): Promise<void> {
  await client.request(
    `/repositories/${workspace}/${repo}/pullrequests/${prId}/approve`,
    { method: "DELETE" },
  );
}

export async function requestChanges(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
): Promise<void> {
  await client.request(
    `/repositories/${workspace}/${repo}/pullrequests/${prId}/request-changes`,
    { method: "POST" },
  );
}

export async function unrequestChanges(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
): Promise<void> {
  await client.request(
    `/repositories/${workspace}/${repo}/pullrequests/${prId}/request-changes`,
    { method: "DELETE" },
  );
}

export async function declinePr(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
): Promise<PullRequest> {
  return client.request<PullRequest>(
    `/repositories/${workspace}/${repo}/pullrequests/${prId}/decline`,
    { method: "POST" },
  );
}

export async function mergePr(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
  options?: {
    merge_strategy?: string;
    message?: string;
    close_source_branch?: boolean;
  },
): Promise<unknown> {
  const body: Record<string, unknown> = {};
  if (options?.merge_strategy) body.merge_strategy = options.merge_strategy;
  if (options?.message) body.message = options.message;
  if (options?.close_source_branch !== undefined) {
    body.close_source_branch = options.close_source_branch;
  }

  return client.request(
    `/repositories/${workspace}/${repo}/pullrequests/${prId}/merge`,
    { method: "POST", body: Object.keys(body).length > 0 ? body : undefined },
  );
}

export async function getActivity(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
  options?: PaginationOptions,
): Promise<{ values: Activity[]; size?: number }> {
  const path = `/repositories/${workspace}/${repo}/pullrequests/${prId}/activity`;
  return client.fetchAll<Activity>(path, options);
}

export async function getDiff(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
): Promise<string> {
  return client.requestText(
    `/repositories/${workspace}/${repo}/pullrequests/${prId}/diff`,
  );
}

export async function getDiffstat(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
  options?: PaginationOptions,
): Promise<{ values: DiffstatEntry[]; size?: number }> {
  const path = `/repositories/${workspace}/${repo}/pullrequests/${prId}/diffstat`;
  return client.fetchAll<DiffstatEntry>(path, options);
}

export async function listCommits(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
  options?: PaginationOptions,
): Promise<{ values: CommitEntry[]; size?: number }> {
  const path = `/repositories/${workspace}/${repo}/pullrequests/${prId}/commits`;
  return client.fetchAll<CommitEntry>(path, options);
}
