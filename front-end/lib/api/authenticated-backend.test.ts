import { beforeEach, describe, expect, it, vi } from "vitest";

const readAuthToken = vi.fn();
const refreshAuthTokenSingleFlight = vi.fn();
const writeAuthToken = vi.fn();

vi.mock("../auth/authjs-jwt", () => ({
  readAuthToken,
  tokenNeedsRefresh: vi.fn(() => false),
  refreshAuthTokenSingleFlight,
  writeAuthToken,
  clearAuthToken: vi.fn(),
}));

describe("authenticated backend transport", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://backend.test";
    vi.clearAllMocks();
    readAuthToken.mockResolvedValue({ accessToken: "old-access", refreshToken: "refresh", accessTokenExpiresAt: Date.now() + 60_000 });
  });

  it("single-flight refreshes after a 401 and retries once", async () => {
    refreshAuthTokenSingleFlight.mockResolvedValue({ accessToken: "new-access", refreshToken: "new-refresh" });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { authenticatedBackendFetch } = await import("./authenticated-backend");

    const response = await authenticatedBackendFetch(new Request("http://web.test/api/admin/users"), "/api/v1/admin/users");

    expect(response.status).toBe(200);
    expect(refreshAuthTokenSingleFlight).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[1][1].headers).toEqual(expect.objectContaining({ authorization: "Bearer new-access" }));
    expect(writeAuthToken).toHaveBeenCalledTimes(1);
  });

  it("does not retry a network failure for a mutation", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")));
    const { authenticatedBackendFetch } = await import("./authenticated-backend");

    await expect(authenticatedBackendFetch(new Request("http://web.test"), "/api/v1/admin/users", { method: "POST", body: "{}" })).rejects.toThrow("network down");
  });
});
