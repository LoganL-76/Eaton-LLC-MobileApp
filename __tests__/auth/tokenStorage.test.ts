import {
  __resetTokenStorageForTests,
  clearTokens,
  configureTokenStorage,
  getAccessToken,
  getRefreshToken,
  setTokens,
  type TokenStorageAdapter,
} from "../../lib/tokenStorage";

describe("tokenStorage", () => {
  beforeEach(() => {
    __resetTokenStorageForTests();
  });

  it("stores and returns access token", async () => {
    await setTokens({ accessToken: "access_123" });

    await expect(getAccessToken()).resolves.toBe("access_123");
    await expect(getRefreshToken()).resolves.toBeNull();
  });

  it("stores and returns access + refresh tokens", async () => {
    await setTokens({ accessToken: "access_abc", refreshToken: "refresh_def" });

    await expect(getAccessToken()).resolves.toBe("access_abc");
    await expect(getRefreshToken()).resolves.toBe("refresh_def");
  });

  it("removes stale refresh token when setting access token only", async () => {
    await setTokens({ accessToken: "access_1", refreshToken: "refresh_1" });
    await expect(getRefreshToken()).resolves.toBe("refresh_1");

    await setTokens({ accessToken: "access_2" });

    await expect(getAccessToken()).resolves.toBe("access_2");
    await expect(getRefreshToken()).resolves.toBeNull();
  });

  it("clears tokens", async () => {
    await setTokens({ accessToken: "access_x", refreshToken: "refresh_y" });

    await clearTokens();

    await expect(getAccessToken()).resolves.toBeNull();
    await expect(getRefreshToken()).resolves.toBeNull();
  });

  it("can be configured with a custom adapter (realistic future wiring)", async () => {
    const calls: Array<{ fn: string; key: string; value?: string }> = [];
    const backing = new Map<string, string>();

    const customAdapter: TokenStorageAdapter = {
      async getItem(key) {
        calls.push({ fn: "getItem", key });
        return backing.has(key) ? backing.get(key)! : null;
      },
      async setItem(key, value) {
        calls.push({ fn: "setItem", key, value });
        backing.set(key, value);
      },
      async removeItem(key) {
        calls.push({ fn: "removeItem", key });
        backing.delete(key);
      },
    };

    configureTokenStorage(customAdapter);

    await setTokens({ accessToken: "a", refreshToken: "r" });
    await expect(getAccessToken()).resolves.toBe("a");
    await expect(getRefreshToken()).resolves.toBe("r");

    expect(calls.some((c) => c.fn === "setItem")).toBe(true);
    expect(calls.some((c) => c.fn === "getItem")).toBe(true);
  });
});
