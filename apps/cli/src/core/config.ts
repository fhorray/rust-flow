import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { dirname } from "node:path";
import { GLOBAL_CONFIG_PATH } from "./paths";

export interface AIConfig {
  provider?: 'openai' | 'anthropic' | 'google' | 'xai' | 'ollama';
  model?: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface GlobalConfig {
  token?: string;
  ai?: AIConfig;
  [key: string]: any;
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function getGlobalConfig(): Promise<GlobalConfig> {
  if (await exists(GLOBAL_CONFIG_PATH)) {
    try {
      const content = await readFile(GLOBAL_CONFIG_PATH, "utf-8");
      return JSON.parse(content);
    } catch {
      return {};
    }
  }
  return {};
}

export async function saveGlobalConfig(config: GlobalConfig): Promise<void> {
  await mkdir(dirname(GLOBAL_CONFIG_PATH), { recursive: true });
  await writeFile(GLOBAL_CONFIG_PATH, JSON.stringify(config, null, 2));
}

export async function updateGlobalConfig(updates: Partial<GlobalConfig>): Promise<GlobalConfig> {
  const current = await getGlobalConfig();
  const next = { ...current, ...updates };
  await saveGlobalConfig(next);
  return next;
}

export async function loadToken(): Promise<string | null> {
  const config = await getGlobalConfig();
  return config.token || null;
}

export async function saveToken(token: string): Promise<void> {
  await updateGlobalConfig({ token });
}

export async function clearToken(): Promise<void> {
  const config = await getGlobalConfig();
  delete config.token;
  await saveGlobalConfig(config);
}
