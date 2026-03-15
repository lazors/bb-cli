import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { getPullRequest, updatePullRequest } from "../../api/pullrequests.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputAction } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

export const prDraftCommand = new Command("draft")
  .description("Convert a pull request to draft status")
  .argument("<repo>", "Repository slug")
  .argument("<pr-id>", "Pull request ID", parseInt)
  .action(async (repo, prId, _, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);

      const current = await getPullRequest(client, workspace, repo, prId);

      const body: Record<string, unknown> = {
        title: current.title,
        description: current.description,
        source: current.source,
        destination: current.destination,
        reviewers: current.reviewers.map((r) => ({ username: r.nickname })),
        close_source_branch: current.close_source_branch,
        draft: true,
      };

      await updatePullRequest(client, workspace, repo, prId, body);
      outputAction(
        `Converted PR #${prId} in ${workspace}/${repo} to draft.`,
        globals.json,
      );
    } catch (err) {
      handleApiError(err);
    }
  });
