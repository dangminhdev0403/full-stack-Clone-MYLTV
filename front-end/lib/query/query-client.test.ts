import { describe, expect, it } from "vitest";
import { ApiClientError } from "../api/schemas";
import { createQueryClient } from "./query-client";

describe("query client auth behavior", () => {
  it("does not retry authentication failures", () => {
    const retry = createQueryClient().getDefaultOptions().queries?.retry;
    expect(typeof retry).toBe("function");
    expect((retry as (count: number, error: Error) => boolean)(0, new ApiClientError("AUTH", "Unauthorized", undefined, undefined, 401))).toBe(false);
  });

  it("allows at most two attempts for transient failures", () => {
    const retry = createQueryClient().getDefaultOptions().queries?.retry as (count: number, error: Error) => boolean;
    expect(retry(0, new Error("temporary"))).toBe(true);
    expect(retry(2, new Error("temporary"))).toBe(false);
  });
});
