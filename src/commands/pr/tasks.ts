import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { getActivity } from "../../api/pullrequests.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputResult, outputAction, type TableColumn } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

const columns: TableColumn[] = [
  { key: "description", header: "Description", width: 50 },
  { key: "status", header: "Status", width: 15 },
];

export const prTasksCommand = new Command("tasks")
  .description("List tasks on a pull request (read-only)")
  .argument("<repo>", "Repository slug")
  .argument("<pr-id>", "Pull request ID", parseInt)
  .action(async (repo, prId, _, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      const result = await getActivity(client, workspace, repo, prId);

      // Filter for task-related activity entries
      // Tasks in Bitbucket appear as update activities with task content
      const tasks = result.values
        .filter((a) => {
          // Look for task-related entries in the activity log
          if (a.update && (a.update as Record<string, unknown>).changes) {
            return true;
          }
          return false;
        })
        .map((a) => ({
          description: (a.update as Record<string, unknown>)?.title ?? "Task",
          status: (a.update as Record<string, unknown>)?.state ?? "unknown",
        }));

      if (tasks.length === 0) {
        if (globals.json) {
          outputResult([], { json: true, size: 0 });
        } else {
          outputAction("No tasks found on this pull request.", false);
        }
        return;
      }

      outputResult(tasks, { json: globals.json, columns, size: tasks.length });
    } catch (err) {
      handleApiError(err);
    }
  });
