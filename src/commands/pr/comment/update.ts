import { Command } from "commander";
import { BitbucketClient } from "../../../api/client.js";
import { updateComment } from "../../../api/comments.js";
import { resolveWorkspace } from "../../../auth/credentials.js";
import { outputAction } from "../../../utils/output.js";
import { handleApiError } from "../../../utils/errors.js";

export const commentUpdateCommand = new Command("update")
  .description("Update a comment on a pull request")
  .argument("<repo>", "Repository slug")
  .argument("<pr-id>", "Pull request ID", parseInt)
  .argument("<comment-id>", "Comment ID", parseInt)
  .requiredOption("--body <text>", "Updated comment text")
  .action(async (repo, prId, commentId, options, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      await updateComment(client, workspace, repo, prId, commentId, {
        content: { raw: options.body },
      });
      outputAction(`Updated comment #${commentId} on PR #${prId}.`, globals.json);
    } catch (err) {
      handleApiError(err);
    }
  });
