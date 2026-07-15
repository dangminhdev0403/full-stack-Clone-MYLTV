import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createStudent,
  replaceStudentAccounts,
  updateStudent,
} from "./students.client";

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal("fetch", fetchMock);

afterEach(() => fetchMock.mockReset());

describe("students client mutation exports", () => {
  it("exports create and update against Student Administration", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(success(student())))
      .mockResolvedValueOnce(jsonResponse(success(student({ class_name: "10A2" }))));

    await expect(createStudent({ code: "HS001", full_name: "Student", class_name: "10A1" })).resolves.toMatchObject({ id: "student-1" });
    await expect(updateStudent("student-1", { class_name: "10A2" })).resolves.toMatchObject({ class_name: "10A2" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/admin/students", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ code: "HS001", full_name: "Student", class_name: "10A1" }),
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/admin/students/student-1", expect.objectContaining({
      method: "PATCH",
      body: JSON.stringify({ class_name: "10A2" }),
    }));
  });

  it("replaces linked accounts through the explicit accounts action", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(success({ updated: true })));

    await expect(replaceStudentAccounts("student-1", ["account-1"])).resolves.toEqual({ updated: true });
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/students/student-1/accounts", expect.objectContaining({
      method: "PUT",
      body: JSON.stringify({ account_ids: ["account-1"] }),
    }));
  });
});

function student(overrides: Record<string, unknown> = {}) {
  return {
    id: "student-1",
    code: "HS001",
    full_name: "Student",
    avatar_url: null,
    grade: "10",
    class_name: "10A1",
    school_name: "LTV",
    is_active: true,
    created_at: "2026-07-15T00:00:00.000Z",
    updated_at: "2026-07-15T00:00:00.000Z",
    ...overrides,
  };
}

function success(data: unknown) { return { success: true, data }; }
function jsonResponse(body: unknown) { return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } }); }
