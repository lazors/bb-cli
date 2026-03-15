import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { getStep } from "../../api/pipelines.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputResult } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

export const pipelineStepCommand = new Command("step")
  .description("Get details for a specific pipeline step")
  .argument("<repo>", "Repository slug")
  .argument("<pipeline-uuid>", "Pipeline UUID")
  .argument("<step-uuid>", "Step UUID")
  .action(async (repo, pipelineUuid, stepUuid, _, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      const step = await getStep(client, workspace, repo, pipelineUuid, stepUuid);

      if (globals.json) {
        outputResult(step, { json: true });
      } else {
        outputResult({
          Name: step.name,
          UUID: step.uuid,
          State: step.state.name,
          Result: step.state.result?.name ?? "-",
          Started: step.started_on ?? "-",
          Completed: step.completed_on ?? "-",
          Duration: step.duration_in_seconds != null ? `${step.duration_in_seconds}s` : "-",
          "Log URL": step.links?.log_file?.href ?? "-",
        }, { json: false });
      }
    } catch (err) {
      handleApiError(err);
    }
  });
