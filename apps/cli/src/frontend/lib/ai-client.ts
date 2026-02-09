import { $localSettings, $remoteApiUrl } from '../stores/user-store';

export interface AiRequestOptions {
  endpoint: 'hint' | 'explain' | 'generate' | 'chat';
  context?: any;
  prompt?: string;
  difficulty?: string;
  messages?: any[];
  onChunk?: (chunk: string) => void;
}

let cachedToken: string | null = null;

export async function callAi(options: AiRequestOptions) {
  const settings = $localSettings.get();
  const remoteUrl = $remoteApiUrl.get();

  // 1. Resolve Auth Token
  if (!cachedToken) {
    const tokenRes = await fetch('/auth/token');
    const { token } = await tokenRes.json();
    cachedToken = token;
  }
  const token = cachedToken;

  // 2. Resolve AI Config
  const provider = settings.aiProvider || 'openai';
  let apiKey = settings.openaiKey;
  if (provider === 'anthropic') apiKey = settings.anthropicKey;
  else if (provider === 'google') apiKey = settings.geminiKey;
  else if (provider === 'xai') apiKey = settings.xaiKey;

  const config = {
    provider,
    model: settings.aiModel,
    apiKey
  };

  // 3. Perform Request
  const res = await fetch(`${remoteUrl}/ai/${options.endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      context: options.context,
      prompt: options.prompt,
      difficulty: options.difficulty,
      messages: options.messages,
      config
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }

  // 4. Handle Streaming vs JSON
  if (options.onChunk && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      if (chunkValue) {
        options.onChunk(chunkValue);
      }
    }
    return null;
  }

  return await res.json();
}
