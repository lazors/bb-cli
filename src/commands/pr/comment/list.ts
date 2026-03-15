import { Command } from "commander";
import { BitbucketClient } from "../../../api/client.js";
import { listComments } from "../../../api/comments.js";
import { resolveWorkspace } from "../../../auth/credentials.js";
import { outputResult, type TableColumn } from "../../../utils/output.js";
import { handleApiError } from "../../../utils/errors.js";

const columns: TableColumn[] = [
  { key: "id", header: "ID", width: 6 },
  { key: "author", header: "Author", width: 20 },
  { key: "content", header: "Content", width: 40 },
  { key: "location", header: "Location", width: 20 },
  { key: "resolved", header: "Resolved", width: 8 },
  { key: "created_on", header: "Created", width: 20, format: (v) => {
    if (!v) return "-";
    return new Date(v as string).toLocaleString();
  }},
];

export const commentListCommand = new Command("list")
  .description("List comments on a pull request")
  .argument("<repo>", "Repository slug")
  .argument("<pr-id>", "Pull request ID", parseInt)
  .option("--limit <n>", "Maximum number of results", parseInt)
  .action(async (repo, prId, options, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      const result = await listComments(client, workspace, repo, prId, {
        limit: options.limit,
      });

      if (globals.json) {
        outputResult(result.values, { json: true, size: result.size });
      } else {
        const displayData = result.values
          .filter((c) => !c.deleted)
          .map((c) => ({
            id: c.id,
            author: c.user.display_name,
            content: c.content.raw.length > 40 ? c.content.raw.slice(0, 37) + "..." : c.content.raw,
            location: c.inline ? `${c.inline.path}:${c.inline.to ?? c.inline.from ?? ""}` : "General",
            resolved: c.resolved ? "Yes" : "No",
            created_on: c.created_on,
          }));
        outputResult(displayData, { json: false, columns });
      }
    } catch (err) {
      handleApiError(err);
    }
  });
