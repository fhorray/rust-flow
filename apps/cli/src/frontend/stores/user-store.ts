import { useStore } from '@nanostores/react';
import { atom, computed } from 'nanostores';
import { createFetcherStore, mutateCache, revalidateKeys } from './query-client';
import { API_URL } from '@consts';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  metadata?: string; // JSON string
  subscription?: string;
  hasLifetime?: boolean;
}

export interface Session {
  user: User;
  session: any;
}

export interface LocalSettings {
  openaiKey?: string;
  anthropicKey?: string;
  geminiKey?: string;
  xaiKey?: string;
  aiProvider?: string;
  aiModel?: string;
  ide?: string;
}

interface ConfigResponse {
  remoteApiUrl?: string;
  isOffline?: boolean;
  isOfficial?: boolean;
}

interface TokenResponse {
  token?: string;
}

// --- Queries ---

export const $configQuery = createFetcherStore<ConfigResponse>(['/config']);
export const $tokenQuery = createFetcherStore<TokenResponse>(['/auth/token']);
export const $localSettingsQuery = createFetcherStore<LocalSettings>(['/local-settings']);

// --- Derived State ---

// Use API_URL from constants as base default
const BASE_API_URL = API_URL.endsWith('') ? API_URL.slice(0, -4) : API_URL;

export const $remoteApiUrl = computed($configQuery, (config) => {
  return config.data?.remoteApiUrl || BASE_API_URL;
});

export const $isOffline = computed($configQuery, (config) => !!config.data?.isOffline);
export const $isOfficial = computed($configQuery, (config) => config.data?.isOfficial !== false);

// Authenticated Session Query
export const $sessionQuery = createFetcherStore([
  $remoteApiUrl,
  '/auth/get-session',
  computed($tokenQuery, (t) => t.data?.token)
], {
  fetcher: async (baseUrl, path, token) => {
    if (!token) return null;
    const res = await fetch(`${baseUrl}${path}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch session');
    return res.json();
  }
});

// Main Session Atom/Computed
export const $session = computed($sessionQuery, (q) => q.data as Session | null);
export const $user = computed($session, (s) => s?.user || null);

export const $localSettings = computed($localSettingsQuery, (q) => q.data || {});

// Loading state aggregates all queries
export const $isUserLoading = computed(
  [$configQuery, $tokenQuery, $sessionQuery],
  (config, token, session) => config.loading || token.loading || session.loading
);

// --- Actions ---

/**
 * Fetches the local settings.
 */
export const fetchLocalSettings = () => $localSettingsQuery.revalidate();

/**
 * Updates the local settings.
 * @param {Partial<LocalSettings>} settings - The settings to update.
 */
export const updateLocalSettings = async (settings: Partial<LocalSettings>) => {
  try {
    const res = await fetch('/local-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      // Optimistic update using mutateCache
      mutateCache('/local-settings', { ...$localSettings.get(), ...settings });
      // Revalidate to ensure consistency
      $localSettingsQuery.revalidate();
    }
  } catch (e) {
    console.error('Failed to update local settings', e);
  }
};

/**
 * Updates the user metadata.
 * @param {any} metadata - The metadata to update.
 */
export const updateMetadata = async (metadata: any) => {
  const user = $user.get();
  const token = $tokenQuery.get().data?.token;

  if (!user || !token) return;

  try {
    const remoteUrl = $remoteApiUrl.get();
    const res = await fetch(`${remoteUrl}/auth/update-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        data: {
          metadata: JSON.stringify(metadata)
        }
      }),
    });

    if (res.ok) {
      // Revalidate session to get updated metadata
      $sessionQuery.revalidate();
    }
  } catch (e) {
    console.error('Failed to update metadata', e);
  }
};

/**
 * Logs out the user.
 */
export const logout = async () => {
  try {
    // 1. Clear local token on CLI server
    await fetch('/auth/token', { method: 'POST' });

    // 2. Revalidate queries
    // Invalidating token query will cause it to re-fetch, return null, 
    // which cascades to session query returning null.
    revalidateKeys(['/auth/token']);

    console.log('[AUTH] Logged out successfully');
  } catch (e) {
    console.error('[AUTH] Logout failed', e);
  }
};

/**
 * Returns the user store.
 * @returns {object} The user store.
 */
export const useUser = () => {
  const user = useStore($user);
  const session = useStore($session);
  const isUserLoading = useStore($isUserLoading);
  const isOffline = useStore($isOffline);
  const isOfficial = useStore($isOfficial);
  const remoteApiUrl = useStore($remoteApiUrl);
  const localSettings = useStore($localSettings);

  return {
    user,
    session,
    isUserLoading,
    isOffline,
    isOfficial,
    remoteApiUrl,
    localSettings,

    actions: {
      fetchLocalSettings,
      updateLocalSettings,
      updateMetadata,
      logout
    }
  };
};
