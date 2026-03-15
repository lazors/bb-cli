import { Command } from "commander";
import { readConfig, getConfigPath } from "../../auth/config.js";
import { resolveCredentials } from "../../auth/credentials.js";
import { outputResult } from "../../utils/output.js";

export const statusCommand = new Command("status")
  .description(
    "Show current authentication status and configuration",
  )
  .action((_, cmd) => {
    const json = cmd.optsWithGlobals().json ?? false;

    try {
      const creds = resolveCredentials();

      const statusData: Record<string, unknown> = {
        "Auth Type": creds.authType === "app-password" ? "App Password" : "OAuth2",
        Source: creds.source === "environment" ? "Environment variables" : `Config file (${getConfigPath()})`,
      };

      if (creds.maskedUsername) {
        statusData["Username"] = creds.maskedUsername;
      }
      if (creds.maskedSecret) {
        statusData[creds.authType === "app-password" ? "App Password" : "Access Token"] =
          creds.maskedSecret;
      }

      // Try to get workspace
      const config = readConfig();
      const workspace =
        process.env.BITBUCKET_WORKSPACE ?? config?.defaults.workspace;
      statusData["Default Workspace"] = workspace ?? "Not set";

      outputResult(statusData, { json });
    } catch (err) {
      if (json) {
        process.stderr.write(
          JSON.stringify({
            error: { message: "Not configured", status: 1 },
          }) + "\n",
        );
      } else {
        process.stderr.write(
          `Not configured. Run 'bb auth setup' to configure authentication.\n`,
        );
      }
      process.exit(1);
    }
  });
