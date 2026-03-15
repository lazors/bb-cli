import { readFileSync, writeFileSync, mkdirSync, chmodSync } from "node:fs";
import { join } from "node:path";
import { homedir, platform } from "node:os";
import type { Config } from "../types/config.js";

export function getConfigDir(): string {
  const os = platform();
  if (os === "win32") {
    const appData = process.env.APPDATA || join(homedir(), "AppData", "Roaming");
    return join(appData, "bitbucket-cli");
  }
  if (os === "darwin") {
    return join(homedir(), "Library", "Application Support", "bitbucket-cli");
  }
  // Linux and others
  const xdgConfig = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
  return join(xdgConfig, "bitbucket-cli");
}

export function getConfigPath(): string {
  return join(getConfigDir(), "config.json");
}

export function readConfig(): Config | null {
  const configPath = getConfigPath();
  try {
    const content = readFileSync(configPath, "utf-8");
    return JSON.parse(content) as Config;
  } catch (err: unknown) {
    if (err instanceof SyntaxError) {
      throw new Error(
        `Config file is corrupt (invalid JSON): ${configPath}\nRun 'bb auth setup' to recreate it.`,
      );
    }
    // File doesn't exist — not configured
    return null;
  }
}

export function writeConfig(config: Config): void {
  const configDir = getConfigDir();
  mkdirSync(configDir, { recursive: true });

  const configPath = getConfigPath();
  const content = JSON.stringify(config, null, 2) + "\n";
  writeFileSync(configPath, content, { mode: 0o600 });

  // On Unix, also chmod the file explicitly (mode option may not work on all systems)
  if (platform() !== "win32") {
    try {
      chmodSync(configPath, 0o600);
    } catch {
      // Best effort
    }
  }
}
