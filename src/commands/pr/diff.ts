import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { getDiff } from "../../api/pullrequests.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { handleApiError } from "../../utils/errors.js";

export const prDiffCommand = new Command("diff")
  .description("Get the diff for a pull request (unified diff format)")
  .argument("<repo>", "Repository slug")
  .argument("<pr-id>", "Pull request ID", parseInt)
  .action(async (repo, prId, _, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      const diff = await getDiff(client, workspace, repo, prId);

      if (globals.json) {
        process.stdout.write(JSON.stringify({ diff }, null, 2) + "\n");
      } else {
        process.stdout.write(diff);
      }
    } catch (err) {
      handleApiError(err);
    }
  });
