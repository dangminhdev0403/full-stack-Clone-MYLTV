"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AdminShell } from "@/features/admin-shell";
import { useAcademicYearsQuery, useClassesQuery, useSemestersQuery } from "@/features/academic-structure/hooks/use-academic-structure";
import { useStudentsQuery } from "@/features/students/hooks/use-students";
import { useSaveRewardMutation, useSaveScoreMutation, useScoresQuery, useStudentRewardsQuery } from "../hooks/use-scores";
import { summarizeScores } from "./score-statistics";
import type { ScoreFilters } from "../service/scores.client";

export function GradesPage() {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions ?? [];
  const isSuperAdmin = session?.user?.role === "super_admin";
  const canRead = isSuperAdmin || permissions.includes("academics.scores.read") || permissions.includes("academics.scores.*");
  const canManage = isSuperAdmin || permissions.includes("academics.scores.manage") || permissions.includes("academics.scores.*");

  const [selectedTab, setSelectedTab] = useState<"scores" | "rewards">("scores");
  const [filters, setFilters] = useState<ScoreFilters>({
    student_id: "",
    class_id: "",
    academic_year_id: "",
    semester_id: "",
    subject_id: "",
  });

  const { data: years = [] } = useAcademicYearsQuery({ enabled: canRead });
  const { data: semesters = [] } = useSemestersQuery(filters.academic_year_id, { enabled: canRead });
  const { data: classes = [] } = useClassesQuery(
    filters.academic_year_id ? { academic_year_id: filters.academic_year_id } : undefined,
    { enabled: canRead }
  );
  const { data: studentsData } = useStudentsQuery("");
  const studentList = studentsData?.items ?? [];

  const scoresQuery = useScoresQuery(filters, { enabled: canRead && selectedTab === "scores" });
  const rewardsQuery = useStudentRewardsQuery(filters.student_id ?? "", {
    enabled: canRead && selectedTab === "rewards" && Boolean(filters.student_id),
  });

  const scoreStatistics = summarizeScores(scoresQuery.data ?? []);

  const saveScoreMutation = useSaveScoreMutation();
  const saveRewardMutation = useSaveRewardMutation();

  const [showAddModal, setShowAddModal] = useState(false);
  const [scoreFormError, setScoreFormError] = useState<string | null>(null);
  const [scoreForm, setScoreForm] = useState({
    student_id: "",
    subject_id: "math",
    subject_name: "Toán Học",
    oral_scores: "8.0, 9.0",
    fifteen_min_scores: "8.5",
    midterm_score: "8.0",
    final_score: "9.0",
    teacher_comment: "",
  });

  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [rewardFormError, setRewardFormError] = useState<string | null>(null);
  const [rewardForm, setRewardForm] = useState({
    student_id: "",
    type: "reward" as "reward" | "discipline",
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    issuer: "",
  });

  const handleFilterChange = (key: keyof ScoreFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenAddScore = () => {
    setScoreFormError(null);
    setScoreForm((prev) => ({
      ...prev,
      student_id: filters.student_id || (studentList[0]?.id ?? ""),
    }));
    setShowAddModal(true);
  };

  const handleOpenAddReward = () => {
    setRewardFormError(null);
    setRewardForm((prev) => ({
      ...prev,
      student_id: filters.student_id || (studentList[0]?.id ?? ""),
    }));
    setShowAddRewardModal(true);
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    setScoreFormError(null);

    const targetStudentId = scoreForm.student_id.trim();
    if (!targetStudentId) {
      setScoreFormError("Vui lòng chọn học sinh.");
      return;
    }
    if (!scoreForm.subject_name.trim()) {
      setScoreFormError("Vui lòng nhập tên môn học.");
      return;
    }

    const oralArr = scoreForm.oral_scores.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
    const fifteenArr = scoreForm.fifteen_min_scores.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));

    saveScoreMutation.mutate(
      {
        student_id: targetStudentId,
        subject_id: scoreForm.subject_id || "subject",
        subject_name: scoreForm.subject_name.trim(),
        oral_scores: oralArr,
        fifteen_min_scores: fifteenArr,
        midterm_score: scoreForm.midterm_score ? parseFloat(scoreForm.midterm_score) || null : null,
        final_score: scoreForm.final_score ? parseFloat(scoreForm.final_score) || null : null,
        teacher_comment: scoreForm.teacher_comment.trim() || null,
        class_id: filters.class_id || undefined,
        academic_year_id: filters.academic_year_id || undefined,
        semester_id: filters.semester_id || undefined,
      },
      {
        onSuccess: () => {
          setShowAddModal(false);
          setScoreFormError(null);
        },
        onError: (err: Error) => {
          setScoreFormError(err.message || "Không thể lưu điểm số. Vui lòng kiểm tra lại.");
        },
      }
    );
  };

  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    setRewardFormError(null);

    const targetStudentId = rewardForm.student_id.trim();
    if (!targetStudentId) {
      setRewardFormError("Vui lòng chọn học sinh.");
      return;
    }
    if (!rewardForm.title.trim()) {
      setRewardFormError("Vui lòng nhập tiêu đề.");
      return;
    }

    saveRewardMutation.mutate(
      {
        student_id: targetStudentId,
        type: rewardForm.type,
        title: rewardForm.title.trim(),
        content: rewardForm.content.trim(),
        date: rewardForm.date,
        issuer: rewardForm.issuer.trim() || null,
      },
      {
        onSuccess: () => {
          setShowAddRewardModal(false);
          setRewardFormError(null);
        },
        onError: (err: Error) => {
          setRewardFormError(err.message || "Không thể lưu khen thưởng/kỷ luật.");
        },
      }
    );
  };

  return (
    <AdminShell
      title="Điểm số"
      subtitle="Quản lý bảng điểm, nhận xét giáo viên và kết quả học tập qua BFF /api/admin/scores."
      activeHref="/admin/grades"
    >
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative flex flex-col gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
              Academics · Điểm Số & Sổ Điểm
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Sổ điểm môn học & Khen thưởng
            </h2>
            <p className="mt-2 text-base leading-relaxed text-white/90">
              Tra cứu theo lớp, năm học, học kỳ, môn học hoặc học sinh và cập nhật điểm số trực tiếp.
            </p>
          </div>

          {canRead && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-2">
              <div>
                <label htmlFor="filter-year" className="block text-xs font-bold text-white/80 mb-1">
                  Năm học
                </label>
                <select
                  id="filter-year"
                  value={filters.academic_year_id}
                  onChange={(e) => handleFilterChange("academic_year_id", e.target.value)}
                  className="w-full bg-white text-base rounded-xl px-3 py-2 text-[var(--foreground)] font-medium focus:outline-none"
                >
                  <option value="">Tất cả năm học</option>
                  {years.map((yr) => (
                    <option key={yr.id} value={yr.id}>
                      {yr.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-semester" className="block text-xs font-bold text-white/80 mb-1">
                  Học kỳ
                </label>
                <select
                  id="filter-semester"
                  value={filters.semester_id}
                  onChange={(e) => handleFilterChange("semester_id", e.target.value)}
                  className="w-full bg-white text-base rounded-xl px-3 py-2 text-[var(--foreground)] font-medium focus:outline-none"
                >
                  <option value="">Tất cả học kỳ</option>
                  {semesters.map((sem) => (
                    <option key={sem.id} value={sem.id}>
                      {sem.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-class" className="block text-xs font-bold text-white/80 mb-1">
                  Lớp học
                </label>
                <select
                  id="filter-class"
                  value={filters.class_id}
                  onChange={(e) => handleFilterChange("class_id", e.target.value)}
                  className="w-full bg-white text-base rounded-xl px-3 py-2 text-[var(--foreground)] font-medium focus:outline-none"
                >
                  <option value="">Tất cả lớp</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-student" className="block text-xs font-bold text-white/80 mb-1">
                  Học sinh
                </label>
                <select
                  id="filter-student"
                  value={filters.student_id}
                  onChange={(e) => handleFilterChange("student_id", e.target.value)}
                  className="w-full bg-white text-base rounded-xl px-3 py-2 text-[var(--foreground)] font-medium focus:outline-none"
                >
                  <option value="">Tất cả học sinh</option>
                  {studentList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name} ({st.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-subject" className="block text-xs font-bold text-white/80 mb-1">
                  Môn học ID
                </label>
                <input
                  id="filter-subject"
                  type="text"
                  value={filters.subject_id}
                  onChange={(e) => handleFilterChange("subject_id", e.target.value)}
                  placeholder="Mã môn..."
                  className="w-full bg-white text-base rounded-xl px-3 py-2 text-[var(--foreground)] font-medium focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {!canRead ? (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
          <p className="font-bold text-lg">Không có quyền truy cập</p>
          <p className="mt-1 text-sm">Bạn không có quyền xem thông tin điểm số học sinh.</p>
        </div>
      ) : (
        <>
          {selectedTab === "scores" && scoresQuery.data ? (
            <section aria-label="Hồ sơ điểm học sinh" className="flex flex-wrap items-end justify-between gap-5 rounded-2xl border border-[var(--outline-variant)] bg-white p-5">
              <div>
                <p className="text-sm font-bold text-[var(--secondary)]">Trung bình môn có dữ liệu</p>
                <p className="text-4xl font-black">{scoreStatistics.average ?? "Chưa có"}</p>
              </div>
              <div className="flex gap-8 text-sm">
                <span>
                  <strong className="block text-2xl">{scoreStatistics.graded}/{scoreStatistics.subjects}</strong>
                  môn đã chấm
                </span>
                <span>
                  <strong className="block text-2xl text-rose-700">{scoreStatistics.belowFive}</strong>
                  môn dưới 5
                </span>
              </div>
            </section>
          ) : null}

          <div className="flex items-center justify-between border-b border-[var(--outline-variant)] pb-3">
            <div role="tablist" aria-label="Danh mục điểm số và khen thưởng" className="flex gap-3">
              <button
                role="tab"
                id="tab-scores"
                aria-selected={selectedTab === "scores"}
                aria-controls="panel-scores"
                onClick={() => setSelectedTab("scores")}
                className={`px-5 py-2.5 text-base font-bold rounded-xl ${
                  selectedTab === "scores"
                    ? "bg-[var(--primary)] text-white"
                    : "bg-white border border-[var(--outline-variant)] text-[var(--secondary)] hover:text-[var(--foreground)]"
                }`}
              >
                Bảng Điểm Môn Học
              </button>
              <button
                role="tab"
                id="tab-rewards"
                aria-selected={selectedTab === "rewards"}
                aria-controls="panel-rewards"
                onClick={() => setSelectedTab("rewards")}
                className={`px-5 py-2.5 text-base font-bold rounded-xl ${
                  selectedTab === "rewards"
                    ? "bg-[var(--primary)] text-white"
                    : "bg-white border border-[var(--outline-variant)] text-[var(--secondary)] hover:text-[var(--foreground)]"
                }`}
              >
                Khen Thưởng - Kỷ Luật
              </button>
            </div>

            {canManage && (
              <div className="flex gap-2">
                {selectedTab === "scores" ? (
                  <button
                    onClick={handleOpenAddScore}
                    className="px-4 py-2 bg-[var(--primary)] text-white font-bold rounded-xl text-sm shadow-sm hover:opacity-90"
                  >
                    + Cập Nhật Điểm
                  </button>
                ) : (
                  <button
                    onClick={handleOpenAddReward}
                    className="px-4 py-2 bg-[var(--primary)] text-white font-bold rounded-xl text-sm shadow-sm hover:opacity-90"
                  >
                    + Thêm Khen Thưởng
                  </button>
                )}
              </div>
            )}
          </div>

          {selectedTab === "scores" ? (
            <div id="panel-scores" role="tabpanel" aria-labelledby="tab-scores">
              {scoresQuery.isPending ? (
                <div role="status" className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-base text-[var(--secondary)]">
                  <div className="mx-auto size-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent mb-3" />
                  Đang tải danh sách điểm số...
                </div>
              ) : scoresQuery.isError ? (
                <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
                  <p className="font-bold">Không thể tải danh sách điểm số.</p>
                  <p className="mt-1 text-sm">{scoresQuery.error?.message}</p>
                  <button
                    type="button"
                    onClick={() => void scoresQuery.refetch()}
                    className="mt-3 rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    Thử tải lại
                  </button>
                </div>
              ) : scoresQuery.data?.length === 0 ? (
                <div className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-base text-[var(--secondary)]">
                  Không tìm thấy dữ liệu điểm số phù hợp với bộ lọc.
                </div>
              ) : (
                <div className="bg-white border border-[var(--outline-variant)] rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-base text-[var(--foreground)] border-collapse">
                      <thead className="bg-[var(--surface-container)] text-[var(--secondary)] font-bold border-b border-[var(--outline-variant)] uppercase text-sm tracking-wider">
                        <tr>
                          <th className="px-5 py-4 text-left w-44">Môn Học</th>
                          <th className="px-4 py-4 text-center w-36">Điểm Miệng</th>
                          <th className="px-4 py-4 text-center w-36">Điểm 15 Phút</th>
                          <th className="px-4 py-4 text-center w-28">Giữa Kỳ</th>
                          <th className="px-4 py-4 text-center w-28">Cuối Kỳ</th>
                          <th className="px-4 py-4 text-center w-32">Trung Bình</th>
                          <th className="px-5 py-4 text-left">Nhận Xét Giáo Viên</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--outline-variant)] text-base font-medium align-middle">
                        {scoresQuery.data?.map((sc) => (
                          <tr key={sc.id || `${sc.student_id}-${sc.subject_id}`} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-4 font-bold text-[var(--foreground)] align-middle">{sc.subject_name}</td>
                            <td className="px-4 py-4 text-center text-emerald-700 font-bold font-mono align-middle">{sc.oral_scores?.join(", ") || "-"}</td>
                            <td className="px-4 py-4 text-center text-emerald-700 font-bold font-mono align-middle">{sc.fifteen_min_scores?.join(", ") || "-"}</td>
                            <td className="px-4 py-4 text-center text-emerald-700 font-bold font-mono align-middle">{sc.midterm_score ?? "-"}</td>
                            <td className="px-4 py-4 text-center text-emerald-700 font-bold font-mono align-middle">{sc.final_score ?? "-"}</td>
                            <td className="px-4 py-4 text-center text-indigo-700 font-extrabold text-lg font-mono align-middle">{sc.average_score ?? "-"}</td>
                            <td className="px-5 py-4 text-[var(--foreground)] align-middle">{sc.teacher_comment || "Chưa có nhận xét."}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div id="panel-rewards" role="tabpanel" aria-labelledby="tab-rewards">
              {!filters.student_id ? (
                <div className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-base text-[var(--secondary)]">
                  Vui lòng chọn học sinh ở bộ lọc phía trên để xem khen thưởng - kỷ luật.
                </div>
              ) : rewardsQuery.isPending ? (
                <div role="status" className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-base text-[var(--secondary)]">
                  <div className="mx-auto size-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent mb-3" />
                  Đang tải dữ liệu khen thưởng...
                </div>
              ) : rewardsQuery.isError ? (
                <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
                  <p className="font-bold">Không thể tải dữ liệu khen thưởng.</p>
                  <p className="mt-1 text-sm">{rewardsQuery.error?.message}</p>
                  <button
                    type="button"
                    onClick={() => void rewardsQuery.refetch()}
                    className="mt-3 rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    Thử tải lại
                  </button>
                </div>
              ) : rewardsQuery.data?.length === 0 ? (
                <div className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-base text-[var(--secondary)]">
                  Chưa có khen thưởng hay kỷ luật nào cho học sinh này.
                </div>
              ) : (
                <div className="space-y-4">
                  {rewardsQuery.data?.map((rw) => (
                    <div key={rw.id} className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3.5 py-1 text-sm font-bold rounded-full uppercase border ${
                            rw.type === "reward" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {rw.type === "reward" ? "Khen Thưởng" : "Kỷ Luật"}
                        </span>
                        <span className="text-sm text-[var(--secondary)] font-mono font-bold">{rw.date}</span>
                      </div>
                      <h3 className="text-xl font-bold text-[var(--foreground)] mt-3">{rw.title}</h3>
                      <p className="text-base text-[var(--secondary)] mt-1.5 leading-relaxed">{rw.content}</p>
                      <span className="text-sm text-[var(--secondary)] block mt-4 font-medium">Cấp bởi: {rw.issuer || "Nhà trường"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {showAddModal && (
        <div role="dialog" aria-labelledby="modal-score-title" aria-modal="true" className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[var(--outline-variant)] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h2 id="modal-score-title" className="text-xl font-bold text-[var(--foreground)]">Cập Nhật Điểm Môn Học</h2>

            {scoreFormError && (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 font-medium">
                {scoreFormError}
              </div>
            )}

            <form onSubmit={handleSaveScore} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Học sinh</label>
                <select
                  required
                  value={scoreForm.student_id}
                  onChange={(e) => setScoreForm({ ...scoreForm, student_id: e.target.value })}
                  className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-medium"
                >
                  <option value="">-- Chọn học sinh --</option>
                  {studentList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name} ({st.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Môn học</label>
                <input
                  type="text"
                  required
                  value={scoreForm.subject_name}
                  onChange={(e) => setScoreForm({ ...scoreForm, subject_name: e.target.value })}
                  className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Điểm miệng (phân cách dấu phẩy)</label>
                  <input
                    type="text"
                    value={scoreForm.oral_scores}
                    onChange={(e) => setScoreForm({ ...scoreForm, oral_scores: e.target.value })}
                    className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Điểm 15 phút</label>
                  <input
                    type="text"
                    value={scoreForm.fifteen_min_scores}
                    onChange={(e) => setScoreForm({ ...scoreForm, fifteen_min_scores: e.target.value })}
                    className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Điểm Giữa Kỳ</label>
                  <input
                    type="text"
                    value={scoreForm.midterm_score}
                    onChange={(e) => setScoreForm({ ...scoreForm, midterm_score: e.target.value })}
                    className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Điểm Cuối Kỳ</label>
                  <input
                    type="text"
                    value={scoreForm.final_score}
                    onChange={(e) => setScoreForm({ ...scoreForm, final_score: e.target.value })}
                    className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Nhận xét giáo viên</label>
                <textarea
                  rows={2}
                  value={scoreForm.teacher_comment}
                  onChange={(e) => setScoreForm({ ...scoreForm, teacher_comment: e.target.value })}
                  className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-[var(--secondary)] hover:text-[var(--foreground)] font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saveScoreMutation.isPending}
                  className="px-5 py-2 text-sm bg-[var(--primary)] text-white font-bold rounded-lg disabled:opacity-50"
                >
                  {saveScoreMutation.isPending ? "Đang lưu..." : "Lưu Điểm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddRewardModal && (
        <div role="dialog" aria-labelledby="modal-reward-title" aria-modal="true" className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[var(--outline-variant)] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h2 id="modal-reward-title" className="text-xl font-bold text-[var(--foreground)]">Thêm Khen Thưởng / Kỷ Luật</h2>

            {rewardFormError && (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 font-medium">
                {rewardFormError}
              </div>
            )}

            <form onSubmit={handleSaveReward} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Học sinh</label>
                <select
                  required
                  value={rewardForm.student_id}
                  onChange={(e) => setRewardForm({ ...rewardForm, student_id: e.target.value })}
                  className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-medium"
                >
                  <option value="">-- Chọn học sinh --</option>
                  {studentList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name} ({st.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Loại hình</label>
                  <select
                    value={rewardForm.type}
                    onChange={(e) => setRewardForm({ ...rewardForm, type: e.target.value as "reward" | "discipline" })}
                    className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-medium"
                  >
                    <option value="reward">Khen Thưởng</option>
                    <option value="discipline">Kỷ Luật</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Ngày ghi nhận</label>
                  <input
                    type="date"
                    required
                    value={rewardForm.date}
                    onChange={(e) => setRewardForm({ ...rewardForm, date: e.target.value })}
                    className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Tiêu đề</label>
                <input
                  type="text"
                  required
                  value={rewardForm.title}
                  onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                  placeholder="Ví dụ: Học sinh giỏi HK1"
                  className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Nội dung chi tiết</label>
                <textarea
                  rows={2}
                  value={rewardForm.content}
                  onChange={(e) => setRewardForm({ ...rewardForm, content: e.target.value })}
                  className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Đơn vị / Người cấp</label>
                <input
                  type="text"
                  value={rewardForm.issuer}
                  onChange={(e) => setRewardForm({ ...rewardForm, issuer: e.target.value })}
                  placeholder="Ví dụ: Hiệu trưởng"
                  className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRewardModal(false)}
                  className="px-4 py-2 text-sm text-[var(--secondary)] hover:text-[var(--foreground)] font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saveRewardMutation.isPending}
                  className="px-5 py-2 text-sm bg-[var(--primary)] text-white font-bold rounded-lg disabled:opacity-50"
                >
                  {saveRewardMutation.isPending ? "Đang lưu..." : "Lưu Thưởng / Kỷ Luật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
