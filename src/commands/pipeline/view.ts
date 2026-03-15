import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { getPipeline } from "../../api/pipelines.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputResult } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

export const pipelineViewCommand = new Command("view")
  .description("Get details for a specific pipeline run")
  .argument("<repo>", "Repository slug")
  .argument("<pipeline-uuid>", "Pipeline UUID")
  .action(async (repo, pipelineUuid, _, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      const pipeline = await getPipeline(client, workspace, repo, pipelineUuid);

      if (globals.json) {
        outputResult(pipeline, { json: true });
      } else {
        const duration = pipeline.completed_on && pipeline.created_on
          ? `${Math.round((new Date(pipeline.completed_on).getTime() - new Date(pipeline.created_on).getTime()) / 1000)}s`
          : "-";
        outputResult({
          "Build Number": pipeline.build_number,
          UUID: pipeline.uuid,
          State: pipeline.state.name,
          Result: pipeline.state.result?.name ?? "-",
          Branch: pipeline.target.ref_name,
          Creator: pipeline.creator?.display_name ?? "-",
          Created: pipeline.created_on,
          Completed: pipeline.completed_on ?? "-",
          Duration: duration,
        }, { json: false });
      }
    } catch (err) {
      handleApiError(err);
    }
  });
