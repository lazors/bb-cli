import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { stopPipeline } from "../../api/pipelines.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputAction } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

export const pipelineStopCommand = new Command("stop")
  .description("Stop a running pipeline")
  .argument("<repo>", "Repository slug")
  .argument("<pipeline-uuid>", "Pipeline UUID")
  .action(async (repo, pipelineUuid, _, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      await stopPipeline(client, workspace, repo, pipelineUuid);
      outputAction(`Stopped pipeline ${pipelineUuid} in ${workspace}/${repo}.`, globals.json);
    } catch (err) {
      handleApiError(err);
    }
  });
