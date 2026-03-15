import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { triggerPipeline } from "../../api/pipelines.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputAction, outputResult } from "../../utils/output.js";
import { handleApiError, outputError } from "../../utils/errors.js";

export const pipelineRunCommand = new Command("run")
  .description("Trigger a new pipeline run")
  .argument("<repo>", "Repository slug")
  .requiredOption("--branch <branch>", "Target branch name")
  .option("--pipeline <name>", "Custom pipeline name")
  .option("--var <KEY=VALUE...>", "Variables as KEY=VALUE (repeatable)")
  .action(async (repo, options, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);

      // Parse variables
      let variables: Array<{ key: string; value: string }> | undefined;
      if (options.var) {
        variables = [];
        for (const v of options.var as string[]) {
          const eqIdx = v.indexOf("=");
          if (eqIdx === -1) {
            outputError(`Invalid variable format: '${v}'. Expected KEY=VALUE.`);
          }
          variables.push({
            key: v.slice(0, eqIdx),
            value: v.slice(eqIdx + 1),
          });
        }
      }

      const pipeline = await triggerPipeline(client, workspace, repo, {
        branch: options.branch,
        pipeline: options.pipeline,
        variables,
      });

      if (globals.json) {
        outputResult(pipeline, { json: true });
      } else {
        outputAction(
          `Triggered pipeline: UUID=${pipeline.uuid}, Build #${pipeline.build_number}`,
          false,
        );
      }
    } catch (err) {
      handleApiError(err);
    }
  });
