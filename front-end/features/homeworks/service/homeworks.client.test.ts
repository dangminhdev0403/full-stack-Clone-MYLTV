import { afterEach, describe, expect, it, vi } from "vitest";
import { listHomeworks } from "./homeworks.client";

afterEach(() => vi.unstubAllGlobals());

describe("homeworks client", () => {
  it("uses admin BFF and surfaces API errors", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              items: [],
              page: 1,
              page_size: 20,
              total: 0,
              has_next: false,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    await expect(listHomeworks({ class_id: "class-1" })).resolves.toMatchObject(
      { items: [] },
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/homeworks?class_id=class-1",
      { cache: "no-store" },
    );
  });
});
