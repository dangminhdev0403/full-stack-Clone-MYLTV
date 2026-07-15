import { beforeEach, describe, expect, it, vi } from "vitest";
import { login, logout, refresh } from "./auth-api";

describe("auth API service", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://backend.test";
    vi.restoreAllMocks();
  });

  it("maps the login success envelope", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: { access_token: "access", refresh_token: "refresh", expires_in: 900, account: { id: "1", username: "admin", display_name: "Admin", role: "admin", permissions: [] } } }), { status: 200 })));
    await expect(login({ username: " admin ", password: "secret" })).resolves.toMatchObject({ access_token: "access", account: { username: "admin" } });
  });

  it("sends refresh and logout credentials only to the backend", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: { access_token: "new", refresh_token: "new-refresh", expires_in: 900 } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await refresh("refresh");
    await logout("access");

    expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({ refresh_token: "refresh" }));
    expect(fetchMock.mock.calls[1][1].headers).toEqual(expect.objectContaining({ authorization: "Bearer access" }));
  });
});
