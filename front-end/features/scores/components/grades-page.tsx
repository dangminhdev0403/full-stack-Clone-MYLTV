"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin-shell";
import { useSaveRewardMutation, useSaveScoreMutation, useStudentRewardsQuery, useStudentScoresQuery } from "../hooks/use-scores";

export function GradesPage() {
  const [searchInput, setSearchInput] = useState("HS001");
  const [activeStudentId, setActiveStudentId] = useState("HS001");
  const [selectedTab, setSelectedTab] = useState<"scores" | "rewards">("scores");

  const scoresQuery = useStudentScoresQuery(activeStudentId, { enabled: selectedTab === "scores" && Boolean(activeStudentId) });
  const rewardsQuery = useStudentRewardsQuery(activeStudentId, { enabled: selectedTab === "rewards" && Boolean(activeStudentId) });

  const saveScoreMutation = useSaveScoreMutation();
  const saveRewardMutation = useSaveRewardMutation();

  const [showAddModal, setShowAddModal] = useState(false);
  const [scoreForm, setScoreForm] = useState({
    subject_id: "math",
    subject_name: "Toán Học",
    oral_scores: "8.0, 9.0",
    fifteen_min_scores: "8.5",
    midterm_score: "8.0",
    final_score: "9.0",
    teacher_comment: "",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveStudentId(searchInput.trim());
    }
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    const oralArr = scoreForm.oral_scores.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
    const fifteenArr = scoreForm.fifteen_min_scores.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));

    saveScoreMutation.mutate({
      student_id: activeStudentId,
      subject_id: scoreForm.subject_id,
      subject_name: scoreForm.subject_name,
      oral_scores: oralArr,
      fifteen_min_scores: fifteenArr,
      midterm_score: parseFloat(scoreForm.midterm_score) || null,
      final_score: parseFloat(scoreForm.final_score) || null,
      teacher_comment: scoreForm.teacher_comment,
    }, {
      onSuccess: () => {
        setShowAddModal(false);
      },
    });
  };

  return (
    <AdminShell
      title="Điểm số"
      subtitle="Quản lý bảng điểm, nhận xét giáo viên và kết quả học tập qua BFF /api/admin/scores."
      activeHref="/admin/grades"
    >
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
              Academics · Điểm Số & Sổ Điểm
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Sổ điểm môn học & Khen thưởng
            </h2>
            <p className="mt-2 text-base leading-relaxed text-white/90">
              Tra cứu theo mã học sinh và cập nhật điểm số trực tiếp.
            </p>
          </div>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Mã/ID Học sinh..."
              className="bg-white border border-[var(--outline-variant)] text-base rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-medium"
            />
            <button type="submit" className="bg-white text-[var(--primary)] font-bold text-base px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap">
              Tìm kiếm
            </button>
          </form>
        </div>
      </section>

      <div className="flex items-center justify-between border-b border-[var(--outline-variant)] pb-3">
        <div className="flex gap-3">
          <button
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

        {selectedTab === "scores" && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[var(--primary)] text-white font-bold rounded-xl text-sm shadow-sm hover:opacity-90"
          >
            + Cập Nhật Điểm
          </button>
        )}
      </div>

      {selectedTab === "scores" ? (
        scoresQuery.isPending ? (
          <div role="status" className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-base text-[var(--secondary)]">
            <div className="mx-auto size-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent mb-3" />
            Đang tải bảng điểm học sinh {activeStudentId}...
          </div>
        ) : scoresQuery.isError ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
            <p className="font-bold">Không thể tải bảng điểm.</p>
            <button
              type="button"
              onClick={() => void scoresQuery.refetch()}
              className="mt-3 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Thử tải lại
            </button>
          </div>
        ) : scoresQuery.data?.length === 0 ? (
          <div className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-base text-[var(--secondary)]">
            Chưa có bảng điểm cho học sinh {activeStudentId}.
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
                    <tr key={sc.id || sc.subject_id} className="hover:bg-slate-50 transition-colors">
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
        )
      ) : (
        rewardsQuery.isPending ? (
          <div role="status" className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-base text-[var(--secondary)]">
            <div className="mx-auto size-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent mb-3" />
            Đang tải dữ liệu khen thưởng...
          </div>
        ) : rewardsQuery.data?.length === 0 ? (
          <div className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-base text-[var(--secondary)]">
            Chưa có khen thưởng hay kỷ luật nào.
          </div>
        ) : (
          <div className="space-y-4">
            {rewardsQuery.data?.map((rw) => (
              <div key={rw.id} className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className={`px-3.5 py-1 text-sm font-bold rounded-full uppercase border ${rw.type === "reward" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
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
        )
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[var(--outline-variant)] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Cập Nhật Điểm Môn Học</h2>
            <form onSubmit={handleSaveScore} className="space-y-3">
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
                  className="px-4 py-2 text-sm text-[var(--secondary)] hover:text-[var(--foreground)]"
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
    </AdminShell>
  );
}
