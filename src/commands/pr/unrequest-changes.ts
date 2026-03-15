import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { unrequestChanges } from "../../api/pullrequests.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputAction } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

export const prUnrequestChangesCommand = new Command("unrequest-changes")
  .description("Remove a change request from a pull request")
  .argument("<repo>", "Repository slug")
  .argument("<pr-id>", "Pull request ID", parseInt)
  .action(async (repo, prId, _, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      await unrequestChanges(client, workspace, repo, prId);
      outputAction(`Removed change request from PR #${prId} in ${workspace}/${repo}.`, globals.json);
    } catch (err) {
      handleApiError(err);
    }
  });
