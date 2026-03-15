import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { mergePr } from "../../api/pullrequests.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputAction } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";
import type { MergeTask } from "../../types/api.js";

export const prMergeCommand = new Command("merge")
  .description("Merge a pull request")
  .argument("<repo>", "Repository slug")
  .argument("<pr-id>", "Pull request ID", parseInt)
  .option("--strategy <strategy>", "Merge strategy: merge_commit, squash, fast_forward", "merge_commit")
  .option("--message <message>", "Merge commit message")
  .option("--close-source-branch", "Delete source branch")
  .action(async (repo, prId, options, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      const result = await mergePr(client, workspace, repo, prId, {
        merge_strategy: options.strategy,
        message: options.message,
        close_source_branch: options.closeSourceBranch,
      });

      // Check for long-running merge (202 with task status)
      const taskResult = result as MergeTask;
      if (taskResult?.task_status) {
        outputAction(
          `Merge in progress. Task ID: ${taskResult.task_status.id}. Check PR status to confirm completion.`,
          globals.json,
          { task_id: taskResult.task_status.id },
        );
      } else {
        outputAction(`Merged PR #${prId} in ${workspace}/${repo}.`, globals.json);
      }
    } catch (err) {
      handleApiError(err);
    }
  });
