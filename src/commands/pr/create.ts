import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { createPullRequest } from "../../api/pullrequests.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputAction, outputResult } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

export const prCreateCommand = new Command("create")
  .description("Create a new pull request")
  .argument("<repo>", "Repository slug")
  .requiredOption("--title <title>", "PR title")
  .requiredOption("--source <branch>", "Source branch name")
  .option("--destination <branch>", "Destination branch (default: main)")
  .option("--description <text>", "PR description")
  .option("--reviewer <username...>", "Reviewer usernames (repeatable)")
  .option("--close-source-branch", "Delete source branch on merge")
  .option("--draft", "Create as draft PR")
  .action(async (repo, options, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);

      const body: Parameters<typeof createPullRequest>[3] = {
        title: options.title,
        source: { branch: { name: options.source } },
      };

      if (options.destination) {
        body.destination = { branch: { name: options.destination } };
      }
      if (options.description) {
        body.description = options.description;
      }
      if (options.reviewer) {
        body.reviewers = options.reviewer.map((u: string) => ({
          username: u,
        }));
      }
      if (options.closeSourceBranch) {
        body.close_source_branch = true;
      }
      if (options.draft) {
        body.draft = true;
      }

      const pr = await createPullRequest(client, workspace, repo, body);

      if (globals.json) {
        outputResult(pr, { json: true });
      } else {
        const draftMsg = pr.draft ? " (draft)" : "";
        outputAction(
          `Created PR #${pr.id}${draftMsg}: ${pr.links.html?.href ?? ""}`,
          false,
        );
      }
    } catch (err) {
      handleApiError(err);
    }
  });
