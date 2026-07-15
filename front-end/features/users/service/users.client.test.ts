import { afterEach, describe, expect, it, vi } from "vitest";
import {
  disableUser,
  getUser,
  resetUserPassword,
  updateUser,
} from "./users.client";

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal("fetch", fetchMock);

afterEach(() => fetchMock.mockReset());

describe("users client mutation exports", () => {
  it("uses the implemented detail and update endpoints", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(success(user())))
      .mockResolvedValueOnce(jsonResponse(success(user({ display_name: "Updated" }))));

    await expect(getUser("user-1")).resolves.toMatchObject({ id: "user-1" });
    await expect(updateUser("user-1", { display_name: "Updated" })).resolves.toMatchObject({ display_name: "Updated" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/admin/users/user-1", { cache: "no-store" });
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/admin/users/user-1", expect.objectContaining({
      method: "PATCH",
      body: JSON.stringify({ display_name: "Updated" }),
    }));
  });

  it("exports disable and reset-password actions with their exact payloads", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(success({ disabled: true })))
      .mockResolvedValueOnce(jsonResponse(success({ reset: true })));

    await expect(disableUser("user-1")).resolves.toEqual({ disabled: true });
    await expect(resetUserPassword("user-1", "new-password")).resolves.toEqual({ reset: true });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/admin/users/user-1/disable", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/admin/users/user-1/reset-password", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ password: "new-password" }),
    }));
  });
});

function user(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    username: "admin",
    display_name: "Admin",
    role: "admin",
    is_active: true,
    created_at: "2026-07-15T00:00:00.000Z",
    updated_at: "2026-07-15T00:00:00.000Z",
    permission_keys: ["users.manage"],
    ...overrides,
  };
}

function success(data: unknown) { return { success: true, data }; }
function jsonResponse(body: unknown) { return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } }); }
