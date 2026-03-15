import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { listRepositories } from "../../api/repos.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputResult, type TableColumn } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

const columns: TableColumn[] = [
  { key: "slug", header: "Name", width: 30 },
  {
    key: "description",
    header: "Description",
    width: 40,
    format: (v) => {
      const s = String(v ?? "");
      return s.length > 80 ? s.slice(0, 77) + "..." : s;
    },
  },
  { key: "language", header: "Language", width: 15 },
  {
    key: "updated_on",
    header: "Updated",
    width: 20,
    format: (v) => {
      if (!v) return "-";
      return new Date(v as string).toLocaleDateString();
    },
  },
];

export const repoListCommand = new Command("list")
  .description("List repositories in a workspace")
  .option("--role <role>", "Filter by role (admin, contributor, member, owner)")
  .option("--sort <field>", "Sort field (e.g., -updated_on)")
  .option("--limit <n>", "Maximum number of results", parseInt)
  .option("--page-size <n>", "Results per API request (max 100)", parseInt)
  .action(async (options, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);

      const result = await listRepositories(client, workspace, {
        role: options.role,
        sort: options.sort,
        limit: options.limit,
        pageSize: options.pageSize,
      });

      outputResult(result.values, {
        json: globals.json,
        columns,
        size: result.size,
      });
    } catch (err) {
      handleApiError(err);
    }
  });
