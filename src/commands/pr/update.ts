import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { getPullRequest, updatePullRequest } from "../../api/pullrequests.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputAction, outputResult } from "../../utils/output.js";
import { handleApiError, outputError } from "../../utils/errors.js";

export const prUpdateCommand = new Command("update")
  .description("Update a pull request")
  .argument("<repo>", "Repository slug")
  .argument("<pr-id>", "Pull request ID", parseInt)
  .option("--title <title>", "New title")
  .option("--description <text>", "New description")
  .option("--reviewer <username...>", "Replace all reviewers (repeatable)")
  .option("--destination <branch>", "New destination branch")
  .action(async (repo, prId, options, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      if (
        !options.title &&
        !options.description &&
        !options.reviewer &&
        !options.destination
      ) {
        outputError(
          "No update options specified. Use --title, --description, --reviewer, or --destination.",
        );
      }

      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);

      // Fetch current PR to preserve fields (Bitbucket drops omitted PUT fields)
      const current = await getPullRequest(client, workspace, repo, prId);

      const body: Record<string, unknown> = {
        title: options.title ?? current.title,
        description: options.description ?? current.description,
        source: current.source,
        destination: options.destination
          ? { branch: { name: options.destination } }
          : current.destination,
        close_source_branch: current.close_source_branch,
        draft: current.draft,
      };

      if (options.reviewer) {
        body.reviewers = options.reviewer.map((u: string) => ({
          username: u,
        }));
      } else {
        body.reviewers = current.reviewers.map((r) => ({
          username: r.nickname,
        }));
      }

      const updated = await updatePullRequest(
        client,
        workspace,
        repo,
        prId,
        body,
      );

      if (globals.json) {
        outputResult(updated, { json: true });
      } else {
        outputAction(
          `Updated PR #${prId} in ${workspace}/${repo}.`,
          false,
        );
      }
    } catch (err) {
      handleApiError(err);
    }
  });
