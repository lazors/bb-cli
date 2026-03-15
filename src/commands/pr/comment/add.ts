import { Command } from "commander";
import { BitbucketClient } from "../../../api/client.js";
import { createComment } from "../../../api/comments.js";
import { resolveWorkspace } from "../../../auth/credentials.js";
import { outputAction, outputResult } from "../../../utils/output.js";
import { handleApiError } from "../../../utils/errors.js";

export const commentAddCommand = new Command("add")
  .description("Create a comment on a pull request")
  .argument("<repo>", "Repository slug")
  .argument("<pr-id>", "Pull request ID", parseInt)
  .requiredOption("--body <text>", "Comment text (markdown)")
  .option("--file <path>", "File path (for inline comment)")
  .option("--line <n>", "Line number (for inline comment)", parseInt)
  .option("--parent <id>", "Parent comment ID (for replies)", parseInt)
  .action(async (repo, prId, options, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);

      const body: Parameters<typeof createComment>[4] = {
        content: { raw: options.body },
      };

      if (options.file) {
        body.inline = { path: options.file, to: options.line ?? 1 };
      }
      if (options.parent) {
        body.parent = { id: options.parent };
      }

      const comment = await createComment(client, workspace, repo, prId, body);

      if (globals.json) {
        outputResult(comment, { json: true });
      } else {
        outputAction(`Created comment #${comment.id} on PR #${prId}.`, false);
      }
    } catch (err) {
      handleApiError(err);
    }
  });
