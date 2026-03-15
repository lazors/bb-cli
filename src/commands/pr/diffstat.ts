import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { getDiffstat } from "../../api/pullrequests.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputResult, type TableColumn } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

const columns: TableColumn[] = [
  { key: "file", header: "File", width: 50 },
  { key: "status", header: "Status", width: 12 },
  { key: "added", header: "Added", width: 8 },
  { key: "removed", header: "Removed", width: 8 },
];

export const prDiffstatCommand = new Command("diffstat")
  .description("Get diff statistics for a pull request")
  .argument("<repo>", "Repository slug")
  .argument("<pr-id>", "Pull request ID", parseInt)
  .action(async (repo, prId, _, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      const result = await getDiffstat(client, workspace, repo, prId);

      if (globals.json) {
        outputResult(result.values, { json: true, size: result.size });
      } else {
        const displayData = result.values.map((d) => ({
          file: d.new?.path ?? d.old?.path ?? "-",
          status: d.status,
          added: `+${d.lines_added}`,
          removed: `-${d.lines_removed}`,
        }));
        outputResult(displayData, { json: false, columns });
      }
    } catch (err) {
      handleApiError(err);
    }
  });
