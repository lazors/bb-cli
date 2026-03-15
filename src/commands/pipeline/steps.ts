import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { listSteps } from "../../api/pipelines.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputResult, type TableColumn } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

const columns: TableColumn[] = [
  { key: "name", header: "Name", width: 30 },
  { key: "status", header: "Status", width: 20 },
  { key: "duration", header: "Duration", width: 10 },
];

export const pipelineStepsCommand = new Command("steps")
  .description("List steps for a pipeline run")
  .argument("<repo>", "Repository slug")
  .argument("<pipeline-uuid>", "Pipeline UUID")
  .action(async (repo, pipelineUuid, _, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      const result = await listSteps(client, workspace, repo, pipelineUuid);

      if (globals.json) {
        outputResult(result.values, { json: true, size: result.size });
      } else {
        const displayData = result.values.map((s) => ({
          name: s.name,
          status: s.state.result ? `${s.state.name} (${s.state.result.name})` : s.state.name,
          duration: s.duration_in_seconds != null ? `${s.duration_in_seconds}s` : "-",
        }));
        outputResult(displayData, { json: false, columns });
      }
    } catch (err) {
      handleApiError(err);
    }
  });
