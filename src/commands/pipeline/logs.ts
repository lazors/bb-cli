import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { getStepLog } from "../../api/pipelines.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { handleApiError } from "../../utils/errors.js";

export const pipelineLogsCommand = new Command("logs")
  .description("Get logs for a specific pipeline step")
  .argument("<repo>", "Repository slug")
  .argument("<pipeline-uuid>", "Pipeline UUID")
  .argument("<step-uuid>", "Step UUID")
  .action(async (repo, pipelineUuid, stepUuid, _, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      const log = await getStepLog(client, workspace, repo, pipelineUuid, stepUuid);
      process.stdout.write(log);
    } catch (err) {
      handleApiError(err);
    }
  });
