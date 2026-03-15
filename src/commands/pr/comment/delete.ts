import { Command } from "commander";
import { BitbucketClient } from "../../../api/client.js";
import { deleteComment } from "../../../api/comments.js";
import { resolveWorkspace } from "../../../auth/credentials.js";
import { outputAction } from "../../../utils/output.js";
import { handleApiError } from "../../../utils/errors.js";

export const commentDeleteCommand = new Command("delete")
  .description("Delete a comment on a pull request")
  .argument("<repo>", "Repository slug")
  .argument("<pr-id>", "Pull request ID", parseInt)
  .argument("<comment-id>", "Comment ID", parseInt)
  .action(async (repo, prId, commentId, _, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      await deleteComment(client, workspace, repo, prId, commentId);
      outputAction(`Deleted comment #${commentId} on PR #${prId}.`, globals.json);
    } catch (err) {
      handleApiError(err);
    }
  });
