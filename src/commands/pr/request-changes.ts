import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { requestChanges } from "../../api/pullrequests.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputAction } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

export const prRequestChangesCommand = new Command("request-changes")
  .description("Request changes on a pull request")
  .argument("<repo>", "Repository slug")
  .argument("<pr-id>", "Pull request ID", parseInt)
  .action(async (repo, prId, _, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      await requestChanges(client, workspace, repo, prId);
      outputAction(`Requested changes on PR #${prId} in ${workspace}/${repo}.`, globals.json);
    } catch (err) {
      handleApiError(err);
    }
  });
