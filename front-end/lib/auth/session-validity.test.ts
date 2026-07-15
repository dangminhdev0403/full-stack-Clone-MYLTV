import { describe, expect, it } from "vitest";
import { isUsableAuthToken } from "./session-validity";

describe("session validity", () => {
  it("requires an access token and rejects a failed refresh session", () => {
    expect(isUsableAuthToken(null)).toBe(false);
    expect(isUsableAuthToken({ accessToken: "access" })).toBe(true);
    expect(isUsableAuthToken({ accessToken: "access", error: "RefreshAccessTokenError" })).toBe(false);
    expect(isUsableAuthToken({ error: "RefreshAccessTokenError" })).toBe(false);
  });
});
