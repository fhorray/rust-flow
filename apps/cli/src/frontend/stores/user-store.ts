import { useStore } from '@nanostores/react';
import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
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
  runnerId?: string;
}

interface ConfigResponse {
  remoteApiUrl?: string;
  isOffline?: boolean;
  isOfficial?: boolean;
  env?: "student" | "instructor";
  isInstructor?: boolean;
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
const BASE_API_URL = API_URL;

export const $remoteApiUrl = computed($configQuery, (config) => {
  return config.data?.remoteApiUrl || BASE_API_URL;
});

export const $isOffline = computed($configQuery, (config) => !!config.data?.isOffline);
export const $isOfficial = computed($configQuery, (config) => config.data?.isOfficial !== false);
export const $env = computed($configQuery, (config) => config.data?.env || "student");
export const $isInstructor = computed($configQuery, (config) => !!config.data?.isInstructor);

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
export const $session = computed([$sessionQuery, $isInstructor], (q, isInstructor) => {
  if (isInstructor) {
    // Force a Pro instructor guest session, regardless of logged in state
    // This prevents instructors from accidentally saving test data to their real account
    return {
      user: {
        id: "guest-instructor",
        name: "Instructor Mode",
        email: "guest@progy.local",
        image: undefined, // Explicitly no image to show purely Guest UI
        subscription: "pro", // All features unlocked
        hasLifetime: true
      },
      session: { token: "guest" }
    } as Session;
  }
  return q.data as Session | null;
});
export const $user = computed($session, (s) => s?.user || null);

// Persistent Settings Atom
export const $settings = persistentAtom<LocalSettings>('progy:settings', {}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// Backward compatibility (deprecated)
export const $localSettings = computed($settings, (s) => s);

// Loading state aggregates all queries
export const $isUserLoading = computed(
  [$configQuery, $tokenQuery, $sessionQuery],
  (config, token, session) => config.loading || token.loading || session.loading
);

// --- Actions ---

/**
 * Fetches the local settings.
 */
export const fetchLocalSettings = async () => {
  try {
    const res = await fetch('/local-settings');
    if (res.ok) {
      const data = await res.json();
      // Merge with local settings, preferring remote if valid? 
      // Or just overwrite? Usually remote is source of truth if syncing.
      // Let's overwrite but keep any local-only keys if we had them (not likely here)
      $settings.set({ ...$settings.get(), ...data });
    }
  } catch (e) {
    console.error('Failed to fetch local settings', e);
  }
};

/**
 * Updates the local settings.
 * @param {Partial<LocalSettings>} settings - The settings to update.
 */
export const updateLocalSettings = async (settings: Partial<LocalSettings>) => {
  try {
    // 1. Optimistic Update
    const next = { ...$settings.get(), ...settings };
    $settings.set(next);

    // 2. Sync to Backend
    const res = await fetch('/local-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings), // Sending partial updates is fine if backend handles it
    });

    if (!res.ok) {
      // Revert on failure? For now, just log.
      console.error('Failed to sync settings to backend');
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
