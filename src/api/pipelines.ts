import { BitbucketClient, type PaginationOptions } from "./client.js";
import type { Pipeline, PipelineStep } from "../types/api.js";

export async function listPipelines(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  options?: PaginationOptions & { sort?: string },
): Promise<{ values: Pipeline[]; size?: number }> {
  const params = new URLSearchParams();
  if (options?.sort) params.set("sort", options.sort);

  const query = params.toString();
  const path = `/repositories/${workspace}/${repo}/pipelines/${query ? `?${query}` : ""}`;
  return client.fetchAll<Pipeline>(path, options);
}

export async function triggerPipeline(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  target: {
    branch: string;
    pipeline?: string;
    variables?: Array<{ key: string; value: string }>;
  },
): Promise<Pipeline> {
  const body: Record<string, unknown> = {
    target: {
      ref_type: "branch",
      type: "pipeline_ref_target",
      ref_name: target.branch,
    },
  };

  if (target.pipeline) {
    (body.target as Record<string, unknown>).selector = {
      type: "custom",
      pattern: target.pipeline,
    };
  }

  if (target.variables && target.variables.length > 0) {
    body.variables = target.variables.map((v) => ({
      key: v.key,
      value: v.value,
    }));
  }

  return client.request<Pipeline>(
    `/repositories/${workspace}/${repo}/pipelines/`,
    { method: "POST", body },
  );
}

export async function getPipeline(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  pipelineUuid: string,
): Promise<Pipeline> {
  return client.request<Pipeline>(
    `/repositories/${workspace}/${repo}/pipelines/${pipelineUuid}`,
  );
}

export async function stopPipeline(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  pipelineUuid: string,
): Promise<void> {
  await client.request(
    `/repositories/${workspace}/${repo}/pipelines/${pipelineUuid}/stopPipeline`,
    { method: "POST" },
  );
}

export async function listSteps(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  pipelineUuid: string,
  options?: PaginationOptions,
): Promise<{ values: PipelineStep[]; size?: number }> {
  const path = `/repositories/${workspace}/${repo}/pipelines/${pipelineUuid}/steps/`;
  return client.fetchAll<PipelineStep>(path, options);
}

export async function getStep(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  pipelineUuid: string,
  stepUuid: string,
): Promise<PipelineStep> {
  return client.request<PipelineStep>(
    `/repositories/${workspace}/${repo}/pipelines/${pipelineUuid}/steps/${stepUuid}`,
  );
}

export async function getStepLog(
  client: BitbucketClient,
  workspace: string,
  repo: string,
  pipelineUuid: string,
  stepUuid: string,
): Promise<string> {
  return client.requestText(
    `/repositories/${workspace}/${repo}/pipelines/${pipelineUuid}/steps/${stepUuid}/log`,
  );
}
