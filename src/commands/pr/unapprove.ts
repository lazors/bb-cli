import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { unapprovePr } from "../../api/pullrequests.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputAction } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

export const prUnapproveCommand = new Command("unapprove")
  .description("Remove approval from a pull request")
  .argument("<repo>", "Repository slug")
  .argument("<pr-id>", "Pull request ID", parseInt)
  .action(async (repo, prId, _, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      await unapprovePr(client, workspace, repo, prId);
      outputAction(`Removed approval from PR #${prId} in ${workspace}/${repo}.`, globals.json);
    } catch (err) {
      handleApiError(err);
    }
  });
