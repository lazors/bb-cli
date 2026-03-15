import { BitbucketClient, type PaginationOptions } from "./client.js";
import type { Comment } from "../types/api.js";

const prCommentsPath = (workspace: string, repo: string, prId: number) =>
  `/repositories/${workspace}/${repo}/pullrequests/${prId}/comments`;

export async function listComments(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
  options?: PaginationOptions,
): Promise<{ values: Comment[]; size?: number }> {
  return client.fetchAll<Comment>(
    prCommentsPath(workspace, repo, prId),
    options,
  );
}

export async function createComment(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
  body: {
    content: { raw: string };
    inline?: { path: string; to: number };
    parent?: { id: number };
  },
): Promise<Comment> {
  return client.request<Comment>(prCommentsPath(workspace, repo, prId), {
    method: "POST",
    body,
  });
}

export async function updateComment(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
  commentId: number,
  body: { content: { raw: string } },
): Promise<Comment> {
  return client.request<Comment>(
    `${prCommentsPath(workspace, repo, prId)}/${commentId}`,
    { method: "PUT", body },
  );
}

export async function deleteComment(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
  commentId: number,
): Promise<void> {
  await client.request(
    `${prCommentsPath(workspace, repo, prId)}/${commentId}`,
    { method: "DELETE" },
  );
}

export async function resolveComment(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
  commentId: number,
): Promise<void> {
  await client.request(
    `${prCommentsPath(workspace, repo, prId)}/${commentId}/resolve`,
    { method: "PUT" },
  );
}

export async function reopenComment(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  prId: number,
  commentId: number,
): Promise<void> {
  await client.request(
    `${prCommentsPath(workspace, repo, prId)}/${commentId}/resolve`,
    { method: "DELETE" },
  );
}
