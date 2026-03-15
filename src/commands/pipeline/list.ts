import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { listPipelines } from "../../api/pipelines.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputResult, type TableColumn } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

const columns: TableColumn[] = [
  { key: "build_number", header: "#", width: 6 },
  { key: "status", header: "Status", width: 20 },
  { key: "branch", header: "Branch", width: 20 },
  { key: "creator", header: "Creator", width: 20 },
  { key: "created_on", header: "Created", width: 20, format: (v) => {
    if (!v) return "-";
    return new Date(v as string).toLocaleString();
  }},
];

export const pipelineListCommand = new Command("list")
  .description("List pipeline runs for a repository")
  .argument("<repo>", "Repository slug")
  .option("--sort <field>", "Sort field (e.g., -created_on)")
  .option("--limit <n>", "Maximum number of results", parseInt)
  .option("--page-size <n>", "Results per API request (max 100)", parseInt)
  .action(async (repo, options, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      const result = await listPipelines(client, workspace, repo, {
        sort: options.sort,
        limit: options.limit,
        pageSize: options.pageSize,
      });

      if (globals.json) {
        outputResult(result.values, { json: true, size: result.size });
      } else {
        const displayData = result.values.map((p) => ({
          build_number: p.build_number,
          status: p.state.result ? `${p.state.name} (${p.state.result.name})` : p.state.name,
          branch: p.target.ref_name,
          creator: p.creator?.display_name ?? "-",
          created_on: p.created_on,
        }));
        outputResult(displayData, { json: false, columns, size: result.size });
      }
    } catch (err) {
      handleApiError(err);
    }
  });
