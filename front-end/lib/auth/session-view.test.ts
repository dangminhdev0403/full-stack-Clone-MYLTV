import type { Session } from "next-auth";
import { describe, expect, it } from "vitest";
import { createPublicSession } from "./session-view";

describe("Auth.js session boundary", () => {
  it("exposes account data but never bearer or refresh tokens", () => {
    const session = createPublicSession(
      {
        user: {
          id: "1",
          username: "admin",
          display_name: "Admin",
          role: "admin",
          permissions: [],
          name: "Admin",
        },
        expires: new Date(Date.now() + 60_000).toISOString(),
      } as unknown as Session,
      { account: { id: "1", username: "admin", display_name: "Admin", role: "admin", permissions: [] }, accessToken: "secret-access", refreshToken: "secret-refresh" },
    );

    expect(session.user).toMatchObject({ username: "admin", role: "admin" });
    expect(JSON.stringify(session)).not.toContain("secret-access");
    expect(JSON.stringify(session)).not.toContain("secret-refresh");
  });
});
