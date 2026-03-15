import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { listPullRequests } from "../../api/pullrequests.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputResult, type TableColumn } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

export const prListCommand = new Command("list")
  .description("List pull requests for a repository")
  .argument("<repo>", "Repository slug")
  .option("--state <state>", "Filter: OPEN, MERGED, DECLINED, SUPERSEDED", "OPEN")
  .option("--limit <n>", "Maximum number of results", parseInt)
  .option("--page-size <n>", "Results per API request (max 100)", parseInt)
  .action(async (repo, options, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      const result = await listPullRequests(client, workspace, repo, {
        state: options.state,
        limit: options.limit,
        pageSize: options.pageSize,
      });

      const displayData = result.values.map((pr) => ({
        id: pr.id,
        title: pr.title,
        author: pr.author,
        state: pr.state,
        branches: `${pr.source.branch.name} → ${pr.destination.branch.name}`,
      }));

      // Use custom columns that include the branches field
      const listColumns: TableColumn[] = [
        { key: "id", header: "ID", width: 6 },
        { key: "title", header: "Title", width: 40 },
        { key: "author", header: "Author", width: 20, format: (v) => (v as any)?.display_name ?? "-" },
        { key: "state", header: "State", width: 12 },
        { key: "branches", header: "Branches", width: 30 },
      ];

      if (globals.json) {
        outputResult(result.values, { json: true, size: result.size });
      } else {
        outputResult(displayData, { json: false, columns: listColumns, size: result.size });
      }
    } catch (err) {
      handleApiError(err);
    }
  });
