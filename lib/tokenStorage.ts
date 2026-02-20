// lib/tokenStorage.ts
export type TokenPair = {
  accessToken: string;
  refreshToken?: string;
};

export type TokenStorageAdapter = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

/**
 * Default adapter: in-memory storage.
 * - No native deps (AsyncStorage/SecureStore not installed yet)
 * - Allows realistic tests now
 * - Can be swapped later without changing call sites
 */
function createMemoryAdapter(): TokenStorageAdapter {
  const store = new Map<string, string>();

  return {
    async getItem(key) {
      return store.has(key) ? store.get(key)! : null;
    },
    async setItem(key, value) {
      store.set(key, value);
    },
    async removeItem(key) {
      store.delete(key);
    },
  };
}

const KEYS = {
  accessToken: "auth.accessToken",
  refreshToken: "auth.refreshToken",
} as const;

let adapter: TokenStorageAdapter = createMemoryAdapter();

/**
 * Allows wiring SecureStore/AsyncStorage later.
 * Keep this tiny and explicit to avoid architectural drift.
 */
export function configureTokenStorage(nextAdapter: TokenStorageAdapter) {
  adapter = nextAdapter;
}

export async function setTokens(tokens: TokenPair): Promise<void> {
  await adapter.setItem(KEYS.accessToken, tokens.accessToken);

  if (tokens.refreshToken) {
    await adapter.setItem(KEYS.refreshToken, tokens.refreshToken);
  } else {
    // Ensure we don't keep stale refresh tokens around
    await adapter.removeItem(KEYS.refreshToken);
  }
}

export async function getAccessToken(): Promise<string | null> {
  return adapter.getItem(KEYS.accessToken);
}

export async function getRefreshToken(): Promise<string | null> {
  return adapter.getItem(KEYS.refreshToken);
}

export async function clearTokens(): Promise<void> {
  await adapter.removeItem(KEYS.accessToken);
  await adapter.removeItem(KEYS.refreshToken);
}

/**
 * Test helper: resets adapter back to a clean in-memory store.
 * Not exported publicly in app code paths — but safe to export for tests.
 */
export function __resetTokenStorageForTests() {
  adapter = createMemoryAdapter();
}
