import { Command } from "commander";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Auth commands
import { setupCommand } from "./commands/auth/setup.js";
import { statusCommand } from "./commands/auth/status.js";

// Repo commands
import { repoListCommand } from "./commands/repo/list.js";
import { repoViewCommand } from "./commands/repo/view.js";

// PR commands
import { prListCommand } from "./commands/pr/list.js";
import { prViewCommand } from "./commands/pr/view.js";
import { prCreateCommand } from "./commands/pr/create.js";
import { prUpdateCommand } from "./commands/pr/update.js";
import { prApproveCommand } from "./commands/pr/approve.js";
import { prUnapproveCommand } from "./commands/pr/unapprove.js";
import { prRequestChangesCommand } from "./commands/pr/request-changes.js";
import { prUnrequestChangesCommand } from "./commands/pr/unrequest-changes.js";
import { prMergeCommand } from "./commands/pr/merge.js";
import { prDeclineCommand } from "./commands/pr/decline.js";
import { prPublishCommand } from "./commands/pr/publish.js";
import { prDraftCommand } from "./commands/pr/draft.js";
import { prActivityCommand } from "./commands/pr/activity.js";
import { prDiffCommand } from "./commands/pr/diff.js";
import { prDiffstatCommand } from "./commands/pr/diffstat.js";
import { prCommitsCommand } from "./commands/pr/commits.js";
import { prTasksCommand } from "./commands/pr/tasks.js";

// Comment commands
import { commentListCommand } from "./commands/pr/comment/list.js";
import { commentAddCommand } from "./commands/pr/comment/add.js";
import { commentUpdateCommand } from "./commands/pr/comment/update.js";
import { commentDeleteCommand } from "./commands/pr/comment/delete.js";
import { commentResolveCommand } from "./commands/pr/comment/resolve.js";
import { commentReopenCommand } from "./commands/pr/comment/reopen.js";

// Pipeline commands
import { pipelineListCommand } from "./commands/pipeline/list.js";
import { pipelineRunCommand } from "./commands/pipeline/run.js";
import { pipelineViewCommand } from "./commands/pipeline/view.js";
import { pipelineStopCommand } from "./commands/pipeline/stop.js";
import { pipelineStepsCommand } from "./commands/pipeline/steps.js";
import { pipelineStepCommand } from "./commands/pipeline/step.js";
import { pipelineLogsCommand } from "./commands/pipeline/logs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(join(__dirname, "..", "package.json"), "utf-8"),
    );
    return pkg.version;
  } catch {
    return "0.0.0";
  }
}

const program = new Command();

program
  .name("bb")
  .description("Bitbucket Cloud CLI")
  .version(getVersion())
  .option("-w, --workspace <slug>", "Workspace slug (overrides default)")
  .option("--json", "Output in JSON format", false)
  .option("-v, --verbose", "Show HTTP request/response details", false);

// Auth commands
const authCmd = new Command("auth").description("Authentication commands");
authCmd.addCommand(setupCommand);
authCmd.addCommand(statusCommand);
program.addCommand(authCmd);

// Repo commands
const repoCmd = new Command("repo").description("Repository commands");
repoCmd.addCommand(repoListCommand);
repoCmd.addCommand(repoViewCommand);
program.addCommand(repoCmd);

// PR commands
const prCmd = new Command("pr").description("Pull request commands");
prCmd.addCommand(prListCommand);
prCmd.addCommand(prViewCommand);
prCmd.addCommand(prCreateCommand);
prCmd.addCommand(prUpdateCommand);
prCmd.addCommand(prApproveCommand);
prCmd.addCommand(prUnapproveCommand);
prCmd.addCommand(prRequestChangesCommand);
prCmd.addCommand(prUnrequestChangesCommand);
prCmd.addCommand(prMergeCommand);
prCmd.addCommand(prDeclineCommand);
prCmd.addCommand(prPublishCommand);
prCmd.addCommand(prDraftCommand);
prCmd.addCommand(prActivityCommand);
prCmd.addCommand(prDiffCommand);
prCmd.addCommand(prDiffstatCommand);
prCmd.addCommand(prCommitsCommand);
prCmd.addCommand(prTasksCommand);

// Comment subcommands under pr
const commentCmd = new Command("comment").description(
  "Pull request comment commands",
);
commentCmd.addCommand(commentListCommand);
commentCmd.addCommand(commentAddCommand);
commentCmd.addCommand(commentUpdateCommand);
commentCmd.addCommand(commentDeleteCommand);
commentCmd.addCommand(commentResolveCommand);
commentCmd.addCommand(commentReopenCommand);
prCmd.addCommand(commentCmd);

program.addCommand(prCmd);

// Pipeline commands
const pipelineCmd = new Command("pipeline").description("Pipeline commands");
pipelineCmd.addCommand(pipelineListCommand);
pipelineCmd.addCommand(pipelineRunCommand);
pipelineCmd.addCommand(pipelineViewCommand);
pipelineCmd.addCommand(pipelineStopCommand);
pipelineCmd.addCommand(pipelineStepsCommand);
pipelineCmd.addCommand(pipelineStepCommand);
pipelineCmd.addCommand(pipelineLogsCommand);
program.addCommand(pipelineCmd);

program.parse();
