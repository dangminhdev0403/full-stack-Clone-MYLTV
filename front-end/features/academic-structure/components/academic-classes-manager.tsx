"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AdminShell, Icon } from "@/features/admin-shell";
import {
  useAcademicYearsQuery,
  useAssignEnrollmentMutation,
  useClassesQuery,
  useClassRosterQuery,
  useCreateClassMutation,
  useCreateGradeLevelMutation,
  useDeactivateEnrollmentMutation,
  useGradeLevelsQuery,
  useUpdateClassMutation,
  useUpdateGradeLevelMutation,
} from "../hooks/use-academic-structure";
import type { GradeLevel, SchoolClass } from "../service/academic-structure.client";

function translateErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes("Grade level code already exists")) {
      return "Mã khối lớp đã tồn tại trong hệ thống.";
    }
    if (msg.includes("Class code already exists in this academic year")) {
      return "Mã lớp học đã tồn tại trong năm học này.";
    }
    if (msg.includes("Academic year not found")) {
      return "Không tìm thấy năm học được chọn.";
    }
    if (msg.includes("Grade level not found")) {
      return "Không tìm thấy khối lớp được chọn.";
    }
    if (msg.includes("Homeroom teacher must exist, be active, and have teacher role")) {
      return "Giáo viên chủ nhiệm phải tồn tại, đang hoạt động và có vai trò giáo viên.";
    }
    if (msg.includes("Cannot enroll student into an inactive class")) {
      return "Không thể xếp học sinh vào lớp đang tạm ngưng.";
    }
    if (msg.includes("Student not found")) {
      return "Không tìm thấy học sinh với mã này.";
    }
    if (msg.includes("Cannot enroll an inactive student")) {
      return "Không thể xếp học sinh đã thôi học hoặc tạm ngưng.";
    }
    if (msg.includes("Student is already actively enrolled in this class")) {
      return "Học sinh này đã được xếp vào lớp học này.";
    }
    return msg;
  }
  return "Thao tác không thành công. Vui lòng thử lại.";
}

export function AcademicClassesManager() {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions ?? [];
  const isSuperAdmin = session?.user?.role === "super_admin";

  const canRead =
    isSuperAdmin ||
    permissions.includes("academics.structure.read") ||
    permissions.includes("academics.structure.*");
  const canManage =
    isSuperAdmin ||
    permissions.includes("academics.structure.manage") ||
    permissions.includes("academics.structure.*");

  const [activeTab, setActiveTab] = useState<"grades" | "classes" | "roster">("grades");

  // Class filters
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>("all");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");

  // Roster selected class
  const [selectedClassForRoster, setSelectedClassForRoster] = useState<string>("");

  // Modals
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeLevel | null>(null);

  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Alerts
  const [inlineError, setInlineError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Queries
  const gradeLevelsQuery = useGradeLevelsQuery({ enabled: canRead });
  const academicYearsQuery = useAcademicYearsQuery({ enabled: canRead });
  const classesQuery = useClassesQuery(
    {
      academic_year_id: selectedYearFilter === "all" ? undefined : selectedYearFilter,
      grade_level_id: selectedGradeFilter === "all" ? undefined : selectedGradeFilter,
      is_active: selectedStatusFilter === "all" ? undefined : selectedStatusFilter === "true",
    },
    { enabled: canRead }
  );
  const rosterQuery = useClassRosterQuery(
    { classId: selectedClassForRoster },
    { enabled: canRead && Boolean(selectedClassForRoster) }
  );

  // Mutations
  const createGradeMutation = useCreateGradeLevelMutation();
  const updateGradeMutation = useUpdateGradeLevelMutation();
  const createClassMutation = useCreateClassMutation();
  const updateClassMutation = useUpdateClassMutation();
  const assignEnrollmentMutation = useAssignEnrollmentMutation();
  const deactivateEnrollmentMutation = useDeactivateEnrollmentMutation();

  if (!canRead) {
    return (
      <AdminShell title="Quản lý Khối lớp & Lớp học" activeHref="/admin/system">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <h2 className="text-lg font-bold">Không có quyền truy cập</h2>
          <p className="mt-2 text-sm">
            Tài khoản của bạn không có quyền xem cấu hình khối lớp và lớp học. Vui lòng liên hệ quản trị viên.
          </p>
        </div>
      </AdminShell>
    );
  }

  const gradeLevels = gradeLevelsQuery.data ?? [];
  const academicYears = academicYearsQuery.data ?? [];
  const classes = classesQuery.data ?? [];
  const rosterData = rosterQuery.data;

  const handleSaveGrade = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInlineError("");
    setSuccessMessage("");
    const formData = new FormData(e.currentTarget);
    const code = (formData.get("code") as string)?.trim();
    const displayName = (formData.get("displayName") as string)?.trim();
    const sortOrder = Number(formData.get("sortOrder")) || 0;

    if (!code || !displayName) {
      setInlineError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      if (editingGrade) {
        await updateGradeMutation.mutateAsync({
          id: editingGrade.id,
          payload: { code, display_name: displayName, sort_order: sortOrder },
        });
        setSuccessMessage("Cập nhật khối lớp thành công.");
      } else {
        await createGradeMutation.mutateAsync({
          code,
          display_name: displayName,
          sort_order: sortOrder,
        });
        setSuccessMessage("Tạo khối lớp thành công.");
      }
      setGradeModalOpen(false);
      setEditingGrade(null);
    } catch (err) {
      setInlineError(translateErrorMessage(err));
    }
  };

  const handleSaveClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInlineError("");
    setSuccessMessage("");
    const formData = new FormData(e.currentTarget);
    const code = (formData.get("code") as string)?.trim();
    const displayName = (formData.get("displayName") as string)?.trim();
    const academicYearId = formData.get("academicYearId") as string;
    const gradeLevelId = formData.get("gradeLevelId") as string;
    const teacherIdRaw = (formData.get("homeroomTeacherId") as string)?.trim();
    const homeroomTeacherId = teacherIdRaw ? teacherIdRaw : null;
    const isActive = formData.get("isActive") === "true";

    if (!code || !displayName || !academicYearId || !gradeLevelId) {
      setInlineError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      if (editingClass) {
        await updateClassMutation.mutateAsync({
          id: editingClass.id,
          payload: {
            code,
            display_name: displayName,
            academic_year_id: academicYearId,
            grade_level_id: gradeLevelId,
            homeroom_teacher_id: homeroomTeacherId,
            is_active: isActive,
          },
        });
        setSuccessMessage("Cập nhật lớp học thành công.");
      } else {
        await createClassMutation.mutateAsync({
          code,
          display_name: displayName,
          academic_year_id: academicYearId,
          grade_level_id: gradeLevelId,
          homeroom_teacher_id: homeroomTeacherId,
          is_active: isActive,
        });
        setSuccessMessage("Tạo lớp học mới thành công.");
      }
      setClassModalOpen(false);
      setEditingClass(null);
    } catch (err) {
      setInlineError(translateErrorMessage(err));
    }
  };

  const handleAssignStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInlineError("");
    setSuccessMessage("");
    if (!selectedClassForRoster) {
      setInlineError("Vui lòng chọn lớp học trước khi xếp lớp.");
      return;
    }
    const formData = new FormData(e.currentTarget);
    const studentId = (formData.get("studentId") as string)?.trim();
    const startsOn = (formData.get("startsOn") as string)?.trim();

    if (!studentId) {
      setInlineError("Vui lòng nhập Mã học sinh.");
      return;
    }

    try {
      await assignEnrollmentMutation.mutateAsync({
        classId: selectedClassForRoster,
        payload: {
          student_id: studentId,
          starts_on: startsOn || undefined,
        },
      });
      setSuccessMessage("Xếp học sinh vào lớp thành công.");
      setAssignModalOpen(false);
    } catch (err) {
      setInlineError(translateErrorMessage(err));
    }
  };

  const handleDeactivateEnrollment = async (studentId: string) => {
    if (!selectedClassForRoster) return;
    setInlineError("");
    setSuccessMessage("");
    try {
      await deactivateEnrollmentMutation.mutateAsync({
        classId: selectedClassForRoster,
        studentId,
      });
      setSuccessMessage("Đã hủy xếp lớp học sinh.");
    } catch (err) {
      setInlineError(translateErrorMessage(err));
    }
  };

  return (
    <AdminShell title="Quản lý Khối lớp & Lớp học" activeHref="/admin/system">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "grades"}
            onClick={() => {
              setActiveTab("grades");
              setInlineError("");
              setSuccessMessage("");
            }}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === "grades"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Xem danh sách khối lớp
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "classes"}
            onClick={() => {
              setActiveTab("classes");
              setInlineError("");
              setSuccessMessage("");
            }}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === "classes"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Xem danh sách lớp học
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "roster"}
            onClick={() => {
              setActiveTab("roster");
              setInlineError("");
              setSuccessMessage("");
            }}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === "roster"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Danh sách học sinh lớp
          </button>
        </div>

        {/* Global Feedback Banners */}
        {inlineError && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200" role="alert">
            {inlineError}
          </div>
        )}
        {successMessage && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 border border-green-200" role="status">
            {successMessage}
          </div>
        )}

        {/* Tab 1: Grade Levels */}
        {activeTab === "grades" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách Khối lớp</h2>
              {canManage && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingGrade(null);
                    setGradeModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  <Icon name="plus" />
                  Thêm khối lớp
                </button>
              )}
            </div>

            {gradeLevelsQuery.isLoading ? (
              <div className="p-8 text-center text-gray-500">Đang tải danh sách khối lớp...</div>
            ) : gradeLevelsQuery.isError ? (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                Lỗi tải danh sách khối lớp.
                <button
                  onClick={() => gradeLevelsQuery.refetch()}
                  className="ml-2 font-semibold underline"
                >
                  Thử lại
                </button>
              </div>
            ) : gradeLevels.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-gray-500">
                Chưa có khối lớp nào trong hệ thống.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-700">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Mã khối</th>
                      <th className="px-4 py-3">Tên hiển thị</th>
                      <th className="px-4 py-3">Thứ tự sắp xếp</th>
                      {canManage && <th className="px-4 py-3 text-right">Thao tác</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {gradeLevels.map((g) => (
                      <tr key={g.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{g.code}</td>
                        <td className="px-4 py-3">{g.display_name}</td>
                        <td className="px-4 py-3">{g.sort_order}</td>
                        {canManage && (
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingGrade(g);
                                setGradeModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Sửa
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: School Classes */}
        {activeTab === "classes" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách Lớp học</h2>
              {canManage && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingClass(null);
                    setClassModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  <Icon name="plus" />
                  Thêm lớp học
                </button>
              )}
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div>
                <label htmlFor="filter-year" className="block text-xs font-medium text-gray-700">
                  Năm học
                </label>
                <select
                  id="filter-year"
                  value={selectedYearFilter}
                  onChange={(e) => setSelectedYearFilter(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">Tất cả năm học</option>
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.display_name} {y.is_current ? "(Hiện tại)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-grade" className="block text-xs font-medium text-gray-700">
                  Khối lớp
                </label>
                <select
                  id="filter-grade"
                  value={selectedGradeFilter}
                  onChange={(e) => setSelectedGradeFilter(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">Tất cả khối lớp</option>
                  {gradeLevels.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-status" className="block text-xs font-medium text-gray-700">
                  Trạng thái
                </label>
                <select
                  id="filter-status"
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Tạm ngưng</option>
                </select>
              </div>
            </div>

            {classesQuery.isLoading ? (
              <div className="p-8 text-center text-gray-500">Đang tải danh sách lớp học...</div>
            ) : classesQuery.isError ? (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                Lỗi tải danh sách lớp học.
                <button
                  onClick={() => classesQuery.refetch()}
                  className="ml-2 font-semibold underline"
                >
                  Thử lại
                </button>
              </div>
            ) : classes.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-gray-500">
                Không tìm thấy lớp học nào phù hợp điều kiện lọc.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-700">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Mã lớp</th>
                      <th className="px-4 py-3">Tên lớp</th>
                      <th className="px-4 py-3">Khối</th>
                      <th className="px-4 py-3">Năm học</th>
                      <th className="px-4 py-3">GV Chủ nhiệm</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      {canManage && <th className="px-4 py-3 text-right">Thao tác</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {classes.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{c.code}</td>
                        <td className="px-4 py-3">{c.display_name}</td>
                        <td className="px-4 py-3">{c.grade_level?.display_name ?? c.grade_level_id}</td>
                        <td className="px-4 py-3">{c.academic_year?.display_name ?? c.academic_year_id}</td>
                        <td className="px-4 py-3">
                          {c.homeroom_teacher?.display_name ?? c.homeroom_teacher_id ?? "Chưa phân công"}
                        </td>
                        <td className="px-4 py-3">
                          {c.is_active ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              Đang hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                              Tạm ngưng
                            </span>
                          )}
                        </td>
                        {canManage && (
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingClass(c);
                                setClassModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Sửa
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Roster & Student Enrollment */}
        {activeTab === "roster" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách Học sinh theo Lớp</h2>
              {canManage && selectedClassForRoster && (
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  <Icon name="plus" />
                  Xếp học sinh vào lớp
                </button>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 max-w-md">
              <label htmlFor="select-class-roster" className="block text-xs font-medium text-gray-700">
                Chọn lớp học
              </label>
              <select
                id="select-class-roster"
                value={selectedClassForRoster}
                onChange={(e) => setSelectedClassForRoster(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">-- Vui lòng chọn lớp học --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.display_name} ({c.code}) - {c.academic_year?.display_name ?? ""}
                  </option>
                ))}
              </select>
            </div>

            {!selectedClassForRoster ? (
              <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-gray-500">
                Vui lòng chọn một lớp học ở trên để xem danh sách học sinh.
              </div>
            ) : rosterQuery.isLoading ? (
              <div className="p-8 text-center text-gray-500">Đang tải danh sách học sinh...</div>
            ) : rosterQuery.isError ? (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                Lỗi tải danh sách học sinh của lớp.
                <button
                  onClick={() => rosterQuery.refetch()}
                  className="ml-2 font-semibold underline"
                >
                  Thử lại
                </button>
              </div>
            ) : !rosterData || rosterData.enrollments.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-gray-500">
                Chưa có học sinh nào trong lớp học này.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-700">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Mã học sinh</th>
                      <th className="px-4 py-3">Họ và tên</th>
                      <th className="px-4 py-3">Ngày bắt đầu</th>
                      <th className="px-4 py-3">Ngày kết thúc</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      {canManage && <th className="px-4 py-3 text-right">Thao tác</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rosterData.enrollments.map((enr) => (
                      <tr key={enr.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {enr.student?.code ?? enr.student_id}
                        </td>
                        <td className="px-4 py-3">{enr.student?.full_name ?? "Học sinh"}</td>
                        <td className="px-4 py-3">{enr.starts_on ?? "-"}</td>
                        <td className="px-4 py-3">{enr.ends_on ?? "-"}</td>
                        <td className="px-4 py-3">
                          {enr.is_active ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              Đang học
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                              Đã chuyển / ngưng
                            </span>
                          )}
                        </td>
                        {canManage && (
                          <td className="px-4 py-3 text-right">
                            {enr.is_active && (
                              <button
                                type="button"
                                onClick={() => handleDeactivateEnrollment(enr.student_id)}
                                className="text-red-600 hover:text-red-800 font-medium text-xs"
                              >
                                Hủy xếp lớp
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal: Create/Edit Grade Level */}
        {gradeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-label="Khối lớp modal">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingGrade ? "Chỉnh sửa khối lớp" : "Thêm khối lớp mới"}
              </h3>
              <form onSubmit={handleSaveGrade} className="space-y-4">
                <div>
                  <label htmlFor="grade-code-input" className="block text-sm font-medium text-gray-700">
                    Mã khối lớp (Code) *
                  </label>
                  <input
                    id="grade-code-input"
                    name="code"
                    type="text"
                    required
                    defaultValue={editingGrade?.code ?? ""}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="grade-name-input" className="block text-sm font-medium text-gray-700">
                    Tên hiển thị khối lớp *
                  </label>
                  <input
                    id="grade-name-input"
                    name="displayName"
                    type="text"
                    required
                    defaultValue={editingGrade?.display_name ?? ""}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="grade-sort-input" className="block text-sm font-medium text-gray-700">
                    Thứ tự sắp xếp
                  </label>
                  <input
                    id="grade-sort-input"
                    name="sortOrder"
                    type="number"
                    defaultValue={editingGrade?.sort_order ?? 0}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGradeModalOpen(false);
                      setEditingGrade(null);
                    }}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500"
                  >
                    Lưu thông tin khối lớp
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create/Edit School Class */}
        {classModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-label="Lớp học modal">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingClass ? "Chỉnh sửa lớp học" : "Thêm lớp học mới"}
              </h3>
              <form onSubmit={handleSaveClass} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="class-year-select" className="block text-sm font-medium text-gray-700">
                      Năm học *
                    </label>
                    <select
                      id="class-year-select"
                      name="academicYearId"
                      required
                      defaultValue={editingClass?.academic_year_id ?? academicYears[0]?.id ?? ""}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                      {academicYears.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.display_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="class-grade-select" className="block text-sm font-medium text-gray-700">
                      Khối lớp *
                    </label>
                    <select
                      id="class-grade-select"
                      name="gradeLevelId"
                      required
                      defaultValue={editingClass?.grade_level_id ?? gradeLevels[0]?.id ?? ""}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                      {gradeLevels.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.display_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="class-code-input" className="block text-sm font-medium text-gray-700">
                    Mã lớp học (Code) *
                  </label>
                  <input
                    id="class-code-input"
                    name="code"
                    type="text"
                    required
                    defaultValue={editingClass?.code ?? ""}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="class-name-input" className="block text-sm font-medium text-gray-700">
                    Tên lớp học *
                  </label>
                  <input
                    id="class-name-input"
                    name="displayName"
                    type="text"
                    required
                    defaultValue={editingClass?.display_name ?? ""}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="class-teacher-input" className="block text-sm font-medium text-gray-700">
                    Mã Giáo viên chủ nhiệm (Không bắt buộc)
                  </label>
                  <input
                    id="class-teacher-input"
                    name="homeroomTeacherId"
                    type="text"
                    defaultValue={editingClass?.homeroom_teacher_id ?? ""}
                    placeholder="VD: teacher-01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="class-active-select" className="block text-sm font-medium text-gray-700">
                    Trạng thái hoạt động
                  </label>
                  <select
                    id="class-active-select"
                    name="isActive"
                    defaultValue={editingClass ? (editingClass.is_active ? "true" : "false") : "true"}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="true">Đang hoạt động</option>
                    <option value="false">Tạm ngưng</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setClassModalOpen(false);
                      setEditingClass(null);
                    }}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500"
                  >
                    Lưu thông tin lớp học
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Assign Student Enrollment */}
        {assignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-label="Xếp lớp học sinh modal">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Xếp học sinh vào lớp</h3>
              <form onSubmit={handleAssignStudent} className="space-y-4">
                <div>
                  <label htmlFor="assign-student-id" className="block text-sm font-medium text-gray-700">
                    Mã học sinh (Student ID) *
                  </label>
                  <input
                    id="assign-student-id"
                    name="studentId"
                    type="text"
                    required
                    placeholder="VD: std-123"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="assign-starts-on" className="block text-sm font-medium text-gray-700">
                    Ngày bắt đầu học (starts_on)
                  </label>
                  <input
                    id="assign-starts-on"
                    name="startsOn"
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAssignModalOpen(false)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500"
                  >
                    Xác nhận xếp lớp
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
