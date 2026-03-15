import { Command } from "commander";
import { writeConfig } from "../../auth/config.js";
import type { Config } from "../../types/config.js";
import { outputAction } from "../../utils/output.js";
import { outputError } from "../../utils/errors.js";

export const setupCommand = new Command("setup")
  .description("Configure authentication credentials and default workspace")
  .option("--username <username>", "Bitbucket username")
  .option("--app-password <password>", "Bitbucket app password")
  .option("--access-token <token>", "OAuth2 access token")
  .option("-w, --workspace <slug>", "Default workspace to set")
  .action((options) => {
    const hasBasic = options.username || options.appPassword;
    const hasOAuth = options.accessToken;

    if (hasBasic && hasOAuth) {
      outputError(
        "Cannot provide both --username/--app-password and --access-token. Choose one authentication method.",
      );
    }

    if (!hasBasic && !hasOAuth) {
      outputError(
        "Must provide either --username + --app-password or --access-token.",
      );
    }

    if (hasBasic && (!options.username || !options.appPassword)) {
      outputError(
        "Both --username and --app-password are required for app password authentication.",
      );
    }

    const config: Config = hasOAuth
      ? {
          auth: { type: "oauth2", access_token: options.accessToken },
          defaults: { workspace: options.workspace },
        }
      : {
          auth: {
            type: "app-password",
            username: options.username,
            app_password: options.appPassword,
          },
          defaults: { workspace: options.workspace },
        };

    try {
      writeConfig(config);
    } catch (err) {
      outputError(
        `Failed to write config: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    const json = options.parent?.parent?.opts?.()?.json ?? process.argv.includes("--json");
    const authType = hasOAuth ? "OAuth2" : "App Password";
    const wsMsg = options.workspace
      ? ` Default workspace: ${options.workspace}`
      : "";
    outputAction(
      `Authentication configured (${authType}).${wsMsg}`,
      json,
    );
  });
