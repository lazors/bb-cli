import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { listCommits } from "../../api/pullrequests.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputResult, type TableColumn } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

const columns: TableColumn[] = [
  { key: "hash", header: "Hash", width: 10 },
  { key: "message", header: "Message", width: 50 },
  { key: "author", header: "Author", width: 20 },
  { key: "date", header: "Date", width: 20, format: (v) => {
    if (!v) return "-";
    return new Date(v as string).toLocaleString();
  }},
];

export const prCommitsCommand = new Command("commits")
  .description("List commits on a pull request")
  .argument("<repo>", "Repository slug")
  .argument("<pr-id>", "Pull request ID", parseInt)
  .action(async (repo, prId, _, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      const result = await listCommits(client, workspace, repo, prId);

      if (globals.json) {
        outputResult(result.values, { json: true, size: result.size });
      } else {
        const displayData = result.values.map((c) => ({
          hash: c.hash.slice(0, 10),
          message: c.message.split("\n")[0].slice(0, 50),
          author: c.author.user?.display_name ?? c.author.raw,
          date: c.date,
        }));
        outputResult(displayData, { json: false, columns });
      }
    } catch (err) {
      handleApiError(err);
    }
  });
