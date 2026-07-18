import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createStudent,
  getStudent,
  listStudents,
  replaceStudentAccounts,
  updateStudent,
} from "./students.client";

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal("fetch", fetchMock);

afterEach(() => fetchMock.mockReset());

describe("students client mutation exports", () => {
  it("keeps list parsing on lightweight student summaries", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(success({ items: [student({ guardian_contacts: [{ id: "guardian-1" }] })], page: 1, page_size: 20, total: 1, has_next: false })));

    await expect(listStudents("?page=1")).resolves.toMatchObject({ items: [{ id: "student-1", full_name: "Student" }] });

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/students?page=1", { cache: "no-store" });
  });

  it("parses student detail profile and guardian contacts from the detail endpoint", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(success(studentDetail())));

    await expect(getStudent("student-1")).resolves.toMatchObject({
      date_of_birth: "2011-05-15",
      gender: "female",
      cohort_start_year: 2023,
      cohort_end_year: 2027,
      guardian_contacts: [expect.objectContaining({ relationship: "mother", phone: "0904 123 456", is_emergency_contact: true })],
    });
  });

  it("rejects malformed detail responses instead of rendering invalid data", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(success(studentDetail({ gender: "unknown" }))));

    await expect(getStudent("student-1")).rejects.toThrow();
  });

  it("sends profile and guardian replacement fields in PATCH without camel-casing the API shape", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(success(studentDetail({ class_name: "10A2" }))));

    await expect(updateStudent("student-1", {
      class_name: "10A2",
      date_of_birth: "2011-05-15",
      gender: "female",
      ethnicity: "Kinh",
      birth_place: "Hà Nội",
      permanent_address: "12 Nguyễn Trãi",
      cohort_start_year: 2023,
      cohort_end_year: 2027,
      guardian_contacts: [{ relationship: "mother", relationship_label: null, full_name: "Trần Thị Hoa", phone: "0904 123 456", is_emergency_contact: true }],
    })).resolves.toMatchObject({ class_name: "10A2" });

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/students/student-1", expect.objectContaining({
      method: "PATCH",
      body: JSON.stringify({
        class_name: "10A2",
        date_of_birth: "2011-05-15",
        gender: "female",
        ethnicity: "Kinh",
        birth_place: "Hà Nội",
        permanent_address: "12 Nguyễn Trãi",
        cohort_start_year: 2023,
        cohort_end_year: 2027,
        guardian_contacts: [{ relationship: "mother", relationship_label: null, full_name: "Trần Thị Hoa", phone: "0904 123 456", is_emergency_contact: true }],
      }),
    }));
  });

  it("sends reversible is_active status changes through PATCH", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(success(studentDetail({ is_active: false }))));

    await expect(updateStudent("student-1", { is_active: false })).resolves.toMatchObject({ is_active: false });
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/students/student-1", expect.objectContaining({ method: "PATCH", body: JSON.stringify({ is_active: false }) }));
  });

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

function studentDetail(overrides: Record<string, unknown> = {}) {
  return student({
    date_of_birth: "2011-05-15",
    gender: "female",
    ethnicity: "Kinh",
    birth_place: "Hà Nội",
    permanent_address: "12 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    cohort_start_year: 2023,
    cohort_end_year: 2027,
    guardian_contacts: [{
      id: "guardian-1",
      relationship: "mother",
      relationship_label: null,
      full_name: "Trần Thị Hoa",
      phone: "0904 123 456",
      is_emergency_contact: true,
    }],
    ...overrides,
  });
}

function success(data: unknown) { return { success: true, data }; }
function jsonResponse(body: unknown) { return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } }); }
