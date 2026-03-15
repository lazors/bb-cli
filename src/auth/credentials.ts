import { readConfig } from "./config.js";
import { ENV_VARS } from "../types/config.js";

export interface ResolvedCredentials {
  authHeader: string;
  source: "environment" | "config";
  workspace?: string;
  authType: "app-password" | "oauth2";
  maskedUsername?: string;
  maskedSecret?: string;
}

function maskValue(value: string): string {
  if (value.length <= 8) {
    return "****";
  }
  return value.slice(0, 4) + "****" + value.slice(-4);
}

export function resolveWorkspace(flagWorkspace?: string): string {
  if (flagWorkspace) return flagWorkspace;

  const envWorkspace = process.env[ENV_VARS.WORKSPACE];
  if (envWorkspace) return envWorkspace;

  const config = readConfig();
  if (config?.defaults.workspace) return config.defaults.workspace;

  throw new Error(
    "No workspace specified. Use --workspace flag, set a default with 'bb auth setup --workspace <slug>', or set BITBUCKET_WORKSPACE environment variable.",
  );
}

export function resolveCredentials(): ResolvedCredentials {
  // Check environment variables first
  const envToken = process.env[ENV_VARS.ACCESS_TOKEN];
  const envUsername = process.env[ENV_VARS.USERNAME];
  const envPassword = process.env[ENV_VARS.APP_PASSWORD];
  const envWorkspace = process.env[ENV_VARS.WORKSPACE];

  if (envToken) {
    return {
      authHeader: `Bearer ${envToken}`,
      source: "environment",
      workspace: envWorkspace,
      authType: "oauth2",
      maskedSecret: maskValue(envToken),
    };
  }

  if (envUsername || envPassword) {
    if (!envUsername) {
      throw new Error(
        `Partial environment credentials: ${ENV_VARS.APP_PASSWORD} is set but ${ENV_VARS.USERNAME} is missing.`,
      );
    }
    if (!envPassword) {
      throw new Error(
        `Partial environment credentials: ${ENV_VARS.USERNAME} is set but ${ENV_VARS.APP_PASSWORD} is missing.`,
      );
    }
    const encoded = Buffer.from(`${envUsername}:${envPassword}`).toString("base64");
    return {
      authHeader: `Basic ${encoded}`,
      source: "environment",
      workspace: envWorkspace,
      authType: "app-password",
      maskedUsername: maskValue(envUsername),
      maskedSecret: maskValue(envPassword),
    };
  }

  // Fall back to config file
  const config = readConfig();
  if (!config) {
    throw new Error(
      "No credentials configured. Run 'bb auth setup' to configure authentication.",
    );
  }

  if (config.auth.type === "oauth2") {
    return {
      authHeader: `Bearer ${config.auth.access_token}`,
      source: "config",
      workspace: config.defaults.workspace,
      authType: "oauth2",
      maskedSecret: maskValue(config.auth.access_token),
    };
  }

  const encoded = Buffer.from(
    `${config.auth.username}:${config.auth.app_password}`,
  ).toString("base64");
  return {
    authHeader: `Basic ${encoded}`,
    source: "config",
    workspace: config.defaults.workspace,
    authType: "app-password",
    maskedUsername: maskValue(config.auth.username),
    maskedSecret: maskValue(config.auth.app_password),
  };
}
