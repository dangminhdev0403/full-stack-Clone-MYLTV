import { beforeEach, describe, expect, it, vi } from "vitest";

const refresh = vi.fn();
vi.mock("@/features/auth/service/auth-api", () => ({ refresh }));

describe("Auth.js token refresh", () => {
  beforeEach(() => refresh.mockReset());

  it("shares one backend refresh across concurrent requests", async () => {
    refresh.mockResolvedValue({ access_token: "new", refresh_token: "rotated", expires_in: 900 });
    const { refreshAuthTokenSingleFlight } = await import("./token-refresh");
    const token = { accessToken: "old", refreshToken: "refresh", accessTokenExpiresAt: 0 };

    const [first, second] = await Promise.all([
      refreshAuthTokenSingleFlight(token),
      refreshAuthTokenSingleFlight(token),
    ]);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(first).toMatchObject({ accessToken: "new", refreshToken: "rotated" });
    expect(second).toEqual(first);
  });
});
