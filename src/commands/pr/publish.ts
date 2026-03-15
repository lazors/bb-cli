import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { getPullRequest, updatePullRequest } from "../../api/pullrequests.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputAction } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

export const prPublishCommand = new Command("publish")
  .description("Publish a draft pull request (mark ready for review)")
  .argument("<repo>", "Repository slug")
  .argument("<pr-id>", "Pull request ID", parseInt)
  .action(async (repo, prId, _, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);

      const current = await getPullRequest(client, workspace, repo, prId);

      if (!current.draft) {
        outputAction(
          `PR #${prId} is already published (not a draft).`,
          globals.json,
        );
        return;
      }

      const body: Record<string, unknown> = {
        title: current.title,
        description: current.description,
        source: current.source,
        destination: current.destination,
        reviewers: current.reviewers.map((r) => ({ username: r.nickname })),
        close_source_branch: current.close_source_branch,
        draft: false,
      };

      await updatePullRequest(client, workspace, repo, prId, body);
      outputAction(
        `Published PR #${prId} in ${workspace}/${repo}. PR is now ready for review.`,
        globals.json,
      );
    } catch (err) {
      handleApiError(err);
    }
  });
