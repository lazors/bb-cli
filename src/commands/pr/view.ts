import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { getPullRequest } from "../../api/pullrequests.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputResult } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

export const prViewCommand = new Command("view")
  .description("Get details for a specific pull request")
  .argument("<repo>", "Repository slug")
  .argument("<pr-id>", "Pull request ID", parseInt)
  .action(async (repo, prId, _, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      const pr = await getPullRequest(client, workspace, repo, prId);

      if (globals.json) {
        outputResult(pr, { json: true });
      } else {
        const reviewerInfo = pr.participants
          .filter((p) => p.role === "REVIEWER")
          .map((p) => `${p.user.display_name} (${p.state ?? "pending"})`)
          .join(", ") || "None";

        outputResult(
          {
            ID: pr.id,
            Title: pr.title,
            State: pr.state,
            Draft: pr.draft,
            Author: pr.author.display_name,
            Source: pr.source.branch.name,
            Destination: pr.destination.branch.name,
            Reviewers: reviewerInfo,
            Description: pr.description || "-",
            Created: pr.created_on,
            Updated: pr.updated_on,
            "Close Source Branch": pr.close_source_branch,
            URL: pr.links.html?.href ?? "-",
          },
          { json: false },
        );
      }
    } catch (err) {
      handleApiError(err);
    }
  });
