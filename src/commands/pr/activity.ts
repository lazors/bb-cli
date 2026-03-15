import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { getActivity } from "../../api/pullrequests.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputResult, type TableColumn } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";
import type { Activity } from "../../types/api.js";

function getActivityType(activity: Activity): string {
  if (activity.comment) return "comment";
  if (activity.update) return "update";
  if (activity.approval) return "approval";
  if (activity.changes_requested) return "changes_requested";
  return "unknown";
}

function getActivityUser(activity: Activity): string {
  if (activity.comment) return activity.comment.user.display_name;
  if (activity.update) return activity.update.author.display_name;
  if (activity.approval) return activity.approval.user.display_name;
  if (activity.changes_requested) return activity.changes_requested.user.display_name;
  return "-";
}

function getActivityDate(activity: Activity): string {
  if (activity.comment) return activity.comment.created_on;
  if (activity.update) return activity.update.date;
  if (activity.approval) return activity.approval.date;
  if (activity.changes_requested) return activity.changes_requested.date;
  return "-";
}

function getActivitySummary(activity: Activity): string {
  if (activity.comment) {
    const raw = activity.comment.content.raw;
    return raw.length > 60 ? raw.slice(0, 57) + "..." : raw;
  }
  if (activity.update) return `State: ${activity.update.state}`;
  if (activity.approval) return "Approved";
  if (activity.changes_requested) return "Changes requested";
  return "-";
}

const columns: TableColumn[] = [
  { key: "date", header: "Date", width: 20, format: (v) => {
    if (!v || v === "-") return "-";
    return new Date(v as string).toLocaleString();
  }},
  { key: "type", header: "Type", width: 18 },
  { key: "user", header: "User", width: 20 },
  { key: "summary", header: "Summary", width: 40 },
];

export const prActivityCommand = new Command("activity")
  .description("Get the activity log for a pull request")
  .argument("<repo>", "Repository slug")
  .argument("<pr-id>", "Pull request ID", parseInt)
  .option("--limit <n>", "Maximum number of results", parseInt)
  .action(async (repo, prId, options, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      const result = await getActivity(client, workspace, repo, prId, {
        limit: options.limit,
      });

      if (globals.json) {
        outputResult(result.values, { json: true, size: result.size });
      } else {
        const displayData = result.values.map((a) => ({
          date: getActivityDate(a),
          type: getActivityType(a),
          user: getActivityUser(a),
          summary: getActivitySummary(a),
        }));
        outputResult(displayData, { json: false, columns });
      }
    } catch (err) {
      handleApiError(err);
    }
  });
