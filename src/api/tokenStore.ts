type TokenPair = {
  accessToken: string | null;
  refreshToken: string | null;
};

type TokenStore = TokenPair & {
  setTokens: (accessToken: string | null, refreshToken?: string | null) => void;
  setAccessToken: (accessToken: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  clear: () => void;
};

const tokens: TokenPair = {
  accessToken: null,
  refreshToken: null,
};

const tokenStore: TokenStore = {
  ...tokens,
  setTokens(accessToken, refreshToken = null) {
    tokens.accessToken = accessToken ?? null;
    tokens.refreshToken = refreshToken ?? null;
  },
  setAccessToken(accessToken) {
    tokens.accessToken = accessToken ?? null;
  },
  setRefreshToken(refreshToken) {
    tokens.refreshToken = refreshToken ?? null;
  },
  clear() {
    tokens.accessToken = null;
    tokens.refreshToken = null;
  },
};

export function getAccessToken(): string | null {
  return tokens.accessToken;
}

export function getRefreshToken(): string | null {
  return tokens.refreshToken;
}

export function setTokens(
  accessToken: string | null,
  refreshToken?: string | null,
): void {
  tokenStore.setTokens(accessToken, refreshToken ?? null);
}

export function setAccessToken(accessToken: string | null): void {
  tokenStore.setAccessToken(accessToken);
}

export function setRefreshToken(refreshToken: string | null): void {
  tokenStore.setRefreshToken(refreshToken);
}

export function clearTokens(): void {
  tokenStore.clear();
}
