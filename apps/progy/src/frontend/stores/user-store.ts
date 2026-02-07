import { atom, computed } from 'nanostores';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  metadata?: string; // JSON string
}

export interface Session {
  user: User;
  session: any;
}

export interface LocalSettings {
  openaiKey?: string;
  anthropicKey?: string;
  geminiKey?: string;
  ide?: string;
}

export const $session = atom<Session | null>(null);
export const $localSettings = atom<LocalSettings>({});
export const $isUserLoading = atom<boolean>(false);
export const $remoteApiUrl = atom<string>('https://progy.francy.workers.dev');

// Computed user for easier access
export const $user = computed($session, (s) => s?.user || null);

// Actions
export const fetchUserSession = async () => {
  $isUserLoading.set(true);
  try {
    // 1. Get remote URL from local config
    const configRes = await fetch('/api/config');
    const config = await configRes.json();
    if (config.remoteApiUrl) $remoteApiUrl.set(config.remoteApiUrl);

    // 2. Get local token
    const tokenRes = await fetch('/api/auth/token');
    const { token } = await tokenRes.json();

    if (!token) {
      $session.set(null);
      return;
    }

    // 3. Get session from remote backend using token
    console.log('[DEBUG] Fetching session with token:', token.substring(0, 5) + '...');
    const remoteRes = await fetch(`${$remoteApiUrl.get()}/api/auth/get-session`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (remoteRes.ok) {
      const data = await remoteRes.json();
      console.log('[DEBUG] Session data received:', data?.user?.name);
      $session.set(data);
    } else {
      const errorText = await remoteRes.text();
      console.warn('[WARN] Session fetch failed:', remoteRes.status, errorText);
      $session.set(null);
    }
  } catch (e) {
    console.error('Failed to fetch user session', e);
    $session.set(null);
  } finally {
    $isUserLoading.set(false);
  }
};

export const fetchLocalSettings = async () => {
  try {
    const res = await fetch('/api/local-settings');
    const data = await res.json();
    $localSettings.set(data);
  } catch (e) {
    console.error('Failed to fetch local settings', e);
  }
};

export const updateLocalSettings = async (settings: Partial<LocalSettings>) => {
  try {
    const res = await fetch('/api/local-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      $localSettings.set({ ...$localSettings.get(), ...settings });
    }
  } catch (e) {
    console.error('Failed to update local settings', e);
  }
};

export const updateMetadata = async (metadata: any) => {
  const user = $user.get();
  const tokenRes = await fetch('/api/auth/token');
  const { token } = await tokenRes.json();

  if (!user || !token) return;

  try {
    // Update remote metadata via Better Auth endpoint or custom endpoint
    // Using a generic update-user endpoint if available, or Better Auth update
    const res = await fetch(`${$remoteApiUrl.get()}/api/auth/update-user`, {
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
      // Optimistic update
      const currentSession = $session.get();
      if (currentSession) {
        $session.set({
          ...currentSession,
          user: {
            ...currentSession.user,
            metadata: JSON.stringify(metadata)
          }
        });
      }
    }
  } catch (e) {
    console.error('Failed to update metadata', e);
  }
};

export const logout = async () => {
  try {
    // 1. Clear local token on CLI server
    await fetch('/api/auth/token', { method: 'POST' });

    // 2. Reset local store
    $session.set(null);

    // 3. Clear Query Cache (revalidate to fetch null/guest state)
    // We can't easily clear the cache directly with nanoquery without a method, 
    // but revalidating will force a new fetch which will return null/guest.
    fetchUserSession();

    console.log('[AUTH] Logged out successfully');
  } catch (e) {
    console.error('[AUTH] Logout failed', e);
  }
};
