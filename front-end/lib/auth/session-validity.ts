type AuthTokenState = {
  accessToken?: string;
  error?: string;
};

export function isUsableAuthToken(token: AuthTokenState | null): boolean {
  return Boolean(token?.accessToken && !token.error);
}
