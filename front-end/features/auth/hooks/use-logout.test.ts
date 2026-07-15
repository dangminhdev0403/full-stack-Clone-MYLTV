import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const signOut = vi.fn();
vi.mock("next-auth/react", () => ({ signOut }));

describe("logout client cleanup", () => {
  beforeEach(() => signOut.mockReset());

  it("cancels and clears cached data before Auth.js sign out", async () => {
    const client = new QueryClient();
    client.setQueryData(["private"], { secret: true });
    const cancel = vi.spyOn(client, "cancelQueries");
    const clear = vi.spyOn(client, "clear");
    const { clearClientStateAndSignOut } = await import("./use-logout");

    await clearClientStateAndSignOut(client);

    expect(cancel).toHaveBeenCalledBefore(clear);
    expect(clear).toHaveBeenCalledBefore(signOut);
    expect(client.getQueryData(["private"])).toBeUndefined();
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });
});
