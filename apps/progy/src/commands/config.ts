import { getGlobalConfig, saveGlobalConfig } from "../core/config";

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
  console.log(`[SUCCESS] Updated ${path} to ${value}`);
}

export async function listConfig() {
  const config = await getGlobalConfig();
  console.log(JSON.stringify(config, null, 2));
}
