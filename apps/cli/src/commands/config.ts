import { getGlobalConfig, saveGlobalConfig } from "../core/config";
import { logger } from "../core/logger";

export async function setConfig(path: string, value: any) {
  const keys = path.split(".");
  const config = await getGlobalConfig();

  let current: any = config;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i] as string;
    if (!current[k] || typeof current[k] !== "object") {
      current[k] = {};
    }
    current = current[k];
  }

  const lastKey = keys[keys.length - 1] as string;
  current[lastKey] = value;
  await saveGlobalConfig(config);
  logger.success(`Config updated: \x1b[1m${path}\x1b[0m is now \x1b[38;5;208m${value}\x1b[0m`);
}

export async function listConfig() {
  const config = await getGlobalConfig();
  logger.brand("Current Global Configuration:");
  console.log("");
  console.log(JSON.stringify(config, null, 2));
  console.log("");
}
