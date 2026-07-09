import { describe, expect, it } from "vitest";
import { createFrontendEnvConfig } from "./env.config";

describe("frontend env config", () => {
  it("requires NEXT_PUBLIC_API_BASE_URL instead of silently defaulting", () => {
    expect(() => createFrontendEnvConfig({})).toThrow(/NEXT_PUBLIC_API_BASE_URL/);
  });

  it("accepts a configured http(s) backend origin and strips path segments", () => {
    expect(createFrontendEnvConfig({ NEXT_PUBLIC_API_BASE_URL: " https://api.example.test/v1 " })).toEqual({
      apiBaseUrl: "https://api.example.test",
      validatedKeys: ["NEXT_PUBLIC_API_BASE_URL"],
    });
  });

  it("rejects invalid API base URLs with the env key name", () => {
    expect(() => createFrontendEnvConfig({ NEXT_PUBLIC_API_BASE_URL: "not a url" })).toThrow(/NEXT_PUBLIC_API_BASE_URL/);
  });

  it("rejects non-http backend origins", () => {
    expect(() => createFrontendEnvConfig({ NEXT_PUBLIC_API_BASE_URL: "ftp://api.example.test" })).toThrow(/http or https/);
  });
});
