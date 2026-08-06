"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AdminShell, Icon } from "@/features/admin-shell";
import {
  useAcademicYearsQuery,
  useCreateAcademicYearMutation,
  useCreateSemesterMutation,
  useCurrentAcademicContextQuery,
  useSemestersQuery,
  useSetAcademicYearCurrentMutation,
  useSetSemesterCurrentMutation,
  useUpdateAcademicYearMutation,
  useUpdateSemesterMutation,
} from "../hooks/use-academic-structure";
import type {
  AcademicYear,
  CreateAcademicYearPayload,
  CreateSemesterPayload,
  Semester,
  UpdateAcademicYearPayload,
  UpdateSemesterPayload,
} from "../service/academic-structure.client";

function formatVietnameseMutationError(error: unknown): string {
  if (!error) return "";
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already exists") || msg.includes("conflict")) {
      return "Mã hoặc ID đã tồn tại trong hệ thống. Vui lòng nhập thông tin khác.";
    }
    if (msg.includes("invalid") || msg.includes("bad request") || msg.includes("starts_on")) {
      return "Dữ liệu nhập không hợp lệ (ngày bắt đầu phải trước hoặc bằng ngày kết thúc).";
    }
    if (msg.includes("not found")) {
      return "Không tìm thấy thông tin năm học hoặc học kỳ.";
    }
    if (msg.includes("service unavailable") || msg.includes("coherently")) {
      return "Cấu hình hiện tại chưa đồng bộ. Vui lòng kiểm tra lại thiết lập năm học/học kỳ.";
    }
    return error.message;
  }
  return "Thao tác không thành công. Vui lòng thử lại.";
}

export function AcademicStructureManager() {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions ?? [];
  const isSuperAdmin = session?.user?.role === "super_admin";

  const canRead = isSuperAdmin || permissions.includes("academics.context.read");
  const canManage = isSuperAdmin || permissions.includes("academics.context.manage");

  const [selectedYearIdFilter, setSelectedYearIdFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"years" | "semesters">("years");

  // Form modal states
  const [yearModalOpen, setYearModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  const [semesterModalOpen, setSemesterModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);

  const [inlineError, setInlineError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Queries (only enabled when user canRead)
  const currentContextQuery = useCurrentAcademicContextQuery({ enabled: canRead });
  const yearsQuery = useAcademicYearsQuery({ enabled: canRead });
  const semestersQuery = useSemestersQuery(
    selectedYearIdFilter === "all" ? undefined : selectedYearIdFilter,
    { enabled: canRead }
  );

  // Mutations
  const createYearMutation = useCreateAcademicYearMutation();
  const updateYearMutation = useUpdateAcademicYearMutation();
  const setYearCurrentMutation = useSetAcademicYearCurrentMutation();

  const createSemesterMutation = useCreateSemesterMutation();
  const updateSemesterMutation = useUpdateSemesterMutation();
  const setSemesterCurrentMutation = useSetSemesterCurrentMutation();

  // Year Form initial state
  const [yearForm, setYearForm] = useState<CreateAcademicYearPayload>({
    id: "",
    code: "",
    display_name: "",
    starts_on: "",
    ends_on: "",
  });

  // Semester Form initial state
  const [semesterForm, setSemesterForm] = useState<CreateSemesterPayload>({
    id: "",
    academic_year_id: "",
    code: "",
    display_name: "",
    starts_on: "",
    ends_on: "",
    sort_order: 1,
  });

  const openCreateYearModal = () => {
    setEditingYear(null);
    setYearForm({
      id: "",
      code: "",
      display_name: "",
      starts_on: new Date().toISOString().slice(0, 10),
      ends_on: new Date(Date.now() + 31536000000).toISOString().slice(0, 10),
    });
    setInlineError("");
    setYearModalOpen(true);
  };

  const openEditYearModal = (year: AcademicYear) => {
    setEditingYear(year);
    setYearForm({
      id: year.id,
      code: year.code,
      display_name: year.display_name,
      starts_on: year.starts_on,
      ends_on: year.ends_on,
    });
    setInlineError("");
    setYearModalOpen(true);
  };

  const openCreateSemesterModal = () => {
    const defaultYearId = yearsQuery.data?.[0]?.id ?? "";
    setEditingSemester(null);
    setSemesterForm({
      id: "",
      academic_year_id: defaultYearId,
      code: "HK1",
      display_name: "Học kỳ I",
      starts_on: new Date().toISOString().slice(0, 10),
      ends_on: new Date(Date.now() + 15552000000).toISOString().slice(0, 10),
      sort_order: 1,
    });
    setInlineError("");
    setSemesterModalOpen(true);
  };

  const openEditSemesterModal = (semester: Semester) => {
    setEditingSemester(semester);
    setSemesterForm({
      id: semester.id,
      academic_year_id: semester.academic_year_id,
      code: semester.code,
      display_name: semester.display_name,
      starts_on: semester.starts_on,
      ends_on: semester.ends_on,
      sort_order: semester.sort_order,
    });
    setInlineError("");
    setSemesterModalOpen(true);
  };

  const handleYearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError("");
    setSuccessMessage("");
    try {
      if (editingYear) {
        const payload: UpdateAcademicYearPayload = {
          code: yearForm.code,
          display_name: yearForm.display_name,
          starts_on: yearForm.starts_on,
          ends_on: yearForm.ends_on,
        };
        await updateYearMutation.mutateAsync({ id: editingYear.id, payload });
        setSuccessMessage("Cập nhật năm học thành công.");
      } else {
        await createYearMutation.mutateAsync(yearForm);
        setSuccessMessage("Tạo năm học mới thành công.");
      }
      setYearModalOpen(false);
    } catch (err) {
      setInlineError(formatVietnameseMutationError(err));
    }
  };

  const handleSemesterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError("");
    setSuccessMessage("");
    try {
      if (editingSemester) {
        const payload: UpdateSemesterPayload = {
          code: semesterForm.code,
          display_name: semesterForm.display_name,
          starts_on: semesterForm.starts_on,
          ends_on: semesterForm.ends_on,
          sort_order: semesterForm.sort_order,
        };
        await updateSemesterMutation.mutateAsync({ id: editingSemester.id, payload });
        setSuccessMessage("Cập nhật học kỳ thành công.");
      } else {
        await createSemesterMutation.mutateAsync(semesterForm);
        setSuccessMessage("Tạo học kỳ mới thành công.");
      }
      setSemesterModalOpen(false);
    } catch (err) {
      setInlineError(formatVietnameseMutationError(err));
    }
  };

  const handleSetYearCurrent = async (id: string) => {
    setInlineError("");
    setSuccessMessage("");
    try {
      await setYearCurrentMutation.mutateAsync({ id });
      setSuccessMessage("Đã thiết lập năm học hiện tại.");
    } catch (err) {
      setInlineError(formatVietnameseMutationError(err));
    }
  };

  const handleSetSemesterCurrent = async (id: string) => {
    setInlineError("");
    setSuccessMessage("");
    try {
      await setSemesterCurrentMutation.mutateAsync({ id });
      setSuccessMessage("Đã thiết lập học kỳ hiện tại.");
    } catch (err) {
      setInlineError(formatVietnameseMutationError(err));
    }
  };

  const currentYear = currentContextQuery.data?.academic_year;
  const currentSemester = currentContextQuery.data?.semester;

  const yearsList = yearsQuery.data ?? [];
  const semestersList = semestersQuery.data ?? [];

  if (!canRead) {
    return (
      <AdminShell title="Hệ thống" activeHref="/admin/system">
        <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300">
          <div className="flex items-center gap-2 font-medium">
            <Icon name="error" className="w-5 h-5" />
            <span>Không có quyền truy cập</span>
          </div>
          <p className="mt-2 text-sm">
            Tài khoản của bạn không có quyền xem cấu hình năm học và học kỳ. Vui lòng liên hệ quản trị viên.
          </p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Cấu hình hệ thống" activeHref="/admin/system">
      <div className="space-y-6">
        {/* Header Summary & Current Context Status */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 text-sm font-medium">
                <Icon name="settings" className="w-4 h-4" />
                <span>Quản lý cấu hình năm học & học kỳ</span>
              </div>
              <h1 className="text-2xl font-bold mt-1">Cấu hình thời gian học tập</h1>
              <p className="text-slate-300 text-sm mt-1">
                Thiết lập năm học, các học kỳ trực thuộc và quản lý ngữ cảnh học tập toàn hệ thống.
              </p>
            </div>

            {/* Current Context Pill */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 min-w-[260px]">
              <div className="text-xs uppercase tracking-wider text-indigo-200 font-semibold mb-1">
                Ngữ cảnh hiện tại
              </div>
              {currentContextQuery.isLoading ? (
                <div className="text-sm text-slate-300 animate-pulse">Đang tải ngữ cảnh...</div>
              ) : currentContextQuery.isError ? (
                <div className="text-xs text-amber-300 flex items-center gap-1">
                  <Icon name="warning" className="w-4 h-4" />
                  <span>Chưa xác định</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Năm học:</span>
                    <span className="font-semibold text-emerald-400">
                      {currentYear?.display_name ?? "Chưa thiết lập"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Học kỳ:</span>
                    <span className="font-semibold text-cyan-300">
                      {currentSemester?.display_name ?? "Chưa thiết lập"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Messages Banner */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="check_circle" className="w-5 h-5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-emerald-600 hover:text-emerald-900 text-xs font-medium"
              aria-label="Đóng thông báo thành công"
            >
              Đóng
            </button>
          </div>
        )}

        {inlineError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="error" className="w-5 h-5 text-rose-600" />
              <span>{inlineError}</span>
            </div>
            <button
              onClick={() => setInlineError("")}
              className="text-rose-600 hover:text-rose-900 text-xs font-medium"
              aria-label="Đóng thông báo lỗi"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Tab Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("years")}
              aria-label="Xem danh sách năm học"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === "years"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Năm học ({yearsList.length})
            </button>
            <button
              onClick={() => setActiveTab("semesters")}
              aria-label="Xem danh sách học kỳ"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === "semesters"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Học kỳ ({semestersList.length})
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeTab === "semesters" && (
              <div className="flex items-center gap-2">
                <label htmlFor="filter-year-select" className="text-xs font-medium text-slate-500">
                  Lọc năm học:
                </label>
                <select
                  id="filter-year-select"
                  aria-label="Lọc học kỳ theo năm học"
                  value={selectedYearIdFilter}
                  onChange={(e) => setSelectedYearIdFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="all">Tất cả năm học</option>
                  {yearsList.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.display_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {canManage && (
              <button
                onClick={activeTab === "years" ? openCreateYearModal : openCreateSemesterModal}
                aria-label={activeTab === "years" ? "Thêm năm học" : "Thêm học kỳ"}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
              >
                <Icon name="add" className="w-4 h-4" />
                <span>{activeTab === "years" ? "Thêm năm học" : "Thêm học kỳ"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Academic Years List */}
        {activeTab === "years" && (
          <div className="space-y-4">
            {yearsQuery.isLoading ? (
              <div className="p-8 text-center text-slate-500 animate-pulse">
                Đang tải danh sách năm học...
              </div>
            ) : yearsQuery.isError ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
                <p className="text-rose-700 text-sm font-medium">Không thể tải danh sách năm học.</p>
                <button
                  onClick={() => yearsQuery.refetch()}
                  className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700"
                  aria-label="Thử lại tải danh sách năm học"
                >
                  Thử lại
                </button>
              </div>
            ) : yearsList.length === 0 ? (
              <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center">
                <Icon name="calendar_month" className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">Chưa có năm học nào trong hệ thống.</p>
                {canManage && (
                  <button
                    onClick={openCreateYearModal}
                    className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium hover:bg-indigo-700"
                    aria-label="Thêm năm học"
                  >
                    Tạo năm học đầu tiên
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {yearsList.map((year) => (
                  <div
                    key={year.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      year.is_current
                        ? "border-emerald-500 bg-gradient-to-b from-emerald-50/40 to-white dark:from-emerald-950/20 dark:to-slate-900 shadow-md"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Mã: {year.code}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                          {year.display_name}
                        </h3>
                      </div>
                      {year.is_current ? (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <Icon name="check_circle" className="w-3.5 h-3.5" />
                          <span>Hiện tại</span>
                        </span>
                      ) : (
                        canManage && (
                          <button
                            onClick={() => handleSetYearCurrent(year.id)}
                            disabled={setYearCurrentMutation.isPending}
                            aria-label={`Đặt ${year.display_name} làm năm học hiện tại`}
                            className="text-xs font-medium px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            Đặt hiện tại
                          </button>
                        )
                      )}
                    </div>

                    <div className="mt-4 space-y-1 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      <div className="flex justify-between">
                        <span>Ngày bắt đầu:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{year.starts_on}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ngày kết thúc:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{year.ends_on}</span>
                      </div>
                      {year.semesters && (
                        <div className="flex justify-between pt-1">
                          <span>Số học kỳ:</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {year.semesters.length} học kỳ
                          </span>
                        </div>
                      )}
                    </div>

                    {canManage && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                        <button
                          onClick={() => openEditYearModal(year)}
                          aria-label={`Chỉnh sửa năm học ${year.display_name}`}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center gap-1"
                        >
                          <Icon name="edit" className="w-3.5 h-3.5" />
                          <span>Chỉnh sửa</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Semesters List */}
        {activeTab === "semesters" && (
          <div className="space-y-4">
            {semestersQuery.isLoading ? (
              <div className="p-8 text-center text-slate-500 animate-pulse">
                Đang tải danh sách học kỳ...
              </div>
            ) : semestersQuery.isError ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
                <p className="text-rose-700 text-sm font-medium">Không thể tải danh sách học kỳ.</p>
                <button
                  onClick={() => semestersQuery.refetch()}
                  className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700"
                  aria-label="Thử lại tải danh sách học kỳ"
                >
                  Thử lại
                </button>
              </div>
            ) : semestersList.length === 0 ? (
              <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center">
                <Icon name="calendar_view_day" className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  {selectedYearIdFilter !== "all"
                    ? "Không tìm thấy học kỳ nào thuộc năm học này."
                    : "Chưa có học kỳ nào trong hệ thống."}
                </p>
                {canManage && (
                  <button
                    onClick={openCreateSemesterModal}
                    className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium hover:bg-indigo-700"
                    aria-label="Thêm học kỳ"
                  >
                    Tạo học kỳ mới
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm" aria-label="Bảng danh sách học kỳ">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th scope="col" className="px-5 py-3">Mã học kỳ</th>
                        <th scope="col" className="px-5 py-3">Tên học kỳ</th>
                        <th scope="col" className="px-5 py-3">Thuộc năm học</th>
                        <th scope="col" className="px-5 py-3">Thời gian</th>
                        <th scope="col" className="px-5 py-3">Thứ tự</th>
                        <th scope="col" className="px-5 py-3 text-center">Trạng thái</th>
                        {canManage && <th scope="col" className="px-5 py-3 text-right">Thao tác</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {semestersList.map((sem) => {
                        const belongsToYear = yearsList.find((y) => y.id === sem.academic_year_id);
                        return (
                          <tr key={sem.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                              {sem.code}
                            </td>
                            <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                              {sem.display_name}
                            </td>
                            <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                              {belongsToYear ? belongsToYear.display_name : sem.academic_year_id}
                            </td>
                            <td className="px-5 py-4 text-xs text-slate-500">
                              {sem.starts_on} → {sem.ends_on}
                            </td>
                            <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                              {sem.sort_order}
                            </td>
                            <td className="px-5 py-4 text-center">
                              {sem.is_current ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <Icon name="check_circle" className="w-3.5 h-3.5" />
                                  <span>Hiện tại</span>
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">Khác</span>
                              )}
                            </td>
                            {canManage && (
                              <td className="px-5 py-4 text-right space-x-2">
                                {!sem.is_current && (
                                  <button
                                    onClick={() => handleSetSemesterCurrent(sem.id)}
                                    disabled={setSemesterCurrentMutation.isPending}
                                    aria-label={`Đặt ${sem.display_name} làm học kỳ hiện tại`}
                                    className="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    Đặt hiện tại
                                  </button>
                                )}
                                <button
                                  onClick={() => openEditSemesterModal(sem)}
                                  aria-label={`Chỉnh sửa ${sem.display_name}`}
                                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                                >
                                  Sửa
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Year Create/Edit Form */}
        {yearModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingYear ? "Chỉnh sửa năm học" : "Tạo mới năm học"}
                </h2>
                <button
                  onClick={() => setYearModalOpen(false)}
                  aria-label="Đóng cửa sổ năm học"
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Icon name="close" className="w-5 h-5" />
                </button>
              </div>

              {inlineError && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200">
                  {inlineError}
                </div>
              )}

              <form onSubmit={handleYearSubmit} className="space-y-4">
                {!editingYear && (
                  <div>
                    <label htmlFor="year-id-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Mã định danh (ID năm học)
                    </label>
                    <input
                      id="year-id-input"
                      type="text"
                      required
                      placeholder="vd: 2025-2026"
                      value={yearForm.id}
                      onChange={(e) => setYearForm({ ...yearForm, id: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="year-code-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Mã năm học (Code)
                  </label>
                  <input
                    id="year-code-input"
                    type="text"
                    required
                    placeholder="vd: 2025-2026"
                    value={yearForm.code}
                    onChange={(e) => setYearForm({ ...yearForm, code: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="year-display-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tên hiển thị
                  </label>
                  <input
                    id="year-display-input"
                    type="text"
                    required
                    placeholder="vd: Năm học 2025 - 2026"
                    value={yearForm.display_name}
                    onChange={(e) => setYearForm({ ...yearForm, display_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="year-starts-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Ngày bắt đầu
                    </label>
                    <input
                      id="year-starts-input"
                      type="date"
                      required
                      value={yearForm.starts_on}
                      onChange={(e) => setYearForm({ ...yearForm, starts_on: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="year-ends-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Ngày kết thúc
                    </label>
                    <input
                      id="year-ends-input"
                      type="date"
                      required
                      value={yearForm.ends_on}
                      onChange={(e) => setYearForm({ ...yearForm, ends_on: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setYearModalOpen(false)}
                    aria-label="Hủy thao tác năm học"
                    className="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={createYearMutation.isPending || updateYearMutation.isPending}
                    aria-label="Lưu thông tin năm học"
                    className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                  >
                    {editingYear ? "Lưu thay đổi" : "Tạo năm học"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Semester Create/Edit Form */}
        {semesterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingSemester ? "Chỉnh sửa học kỳ" : "Tạo mới học kỳ"}
                </h2>
                <button
                  onClick={() => setSemesterModalOpen(false)}
                  aria-label="Đóng cửa sổ học kỳ"
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Icon name="close" className="w-5 h-5" />
                </button>
              </div>

              {inlineError && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200">
                  {inlineError}
                </div>
              )}

              <form onSubmit={handleSemesterSubmit} className="space-y-4">
                {!editingSemester && (
                  <div>
                    <label htmlFor="semester-id-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Mã định danh (ID học kỳ)
                    </label>
                    <input
                      id="semester-id-input"
                      type="text"
                      required
                      placeholder="vd: 2025-2026-sem1"
                      value={semesterForm.id}
                      onChange={(e) => setSemesterForm({ ...semesterForm, id: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {!editingSemester && (
                  <div>
                    <label htmlFor="semester-year-select" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Thuộc năm học
                    </label>
                    <select
                      id="semester-year-select"
                      required
                      value={semesterForm.academic_year_id}
                      onChange={(e) => setSemesterForm({ ...semesterForm, academic_year_id: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    >
                      {yearsList.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.display_name} ({y.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="semester-code-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Mã học kỳ (Code)
                    </label>
                    <input
                      id="semester-code-input"
                      type="text"
                      required
                      placeholder="vd: HK1"
                      value={semesterForm.code}
                      onChange={(e) => setSemesterForm({ ...semesterForm, code: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="semester-sort-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Thứ tự hiển thị
                    </label>
                    <input
                      id="semester-sort-input"
                      type="number"
                      min={1}
                      required
                      value={semesterForm.sort_order}
                      onChange={(e) => setSemesterForm({ ...semesterForm, sort_order: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="semester-display-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tên hiển thị học kỳ
                  </label>
                  <input
                    id="semester-display-input"
                    type="text"
                    required
                    placeholder="vd: Học kỳ I"
                    value={semesterForm.display_name}
                    onChange={(e) => setSemesterForm({ ...semesterForm, display_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="semester-starts-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Ngày bắt đầu
                    </label>
                    <input
                      id="semester-starts-input"
                      type="date"
                      required
                      value={semesterForm.starts_on}
                      onChange={(e) => setSemesterForm({ ...semesterForm, starts_on: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="semester-ends-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Ngày kết thúc
                    </label>
                    <input
                      id="semester-ends-input"
                      type="date"
                      required
                      value={semesterForm.ends_on}
                      onChange={(e) => setSemesterForm({ ...semesterForm, ends_on: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSemesterModalOpen(false)}
                    aria-label="Hủy thao tác học kỳ"
                    className="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={createSemesterMutation.isPending || updateSemesterMutation.isPending}
                    aria-label="Lưu thông tin học kỳ"
                    className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                  >
                    {editingSemester ? "Lưu thay đổi" : "Tạo học kỳ"}
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
