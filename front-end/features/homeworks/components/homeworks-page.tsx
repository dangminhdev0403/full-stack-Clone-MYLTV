"use client";

import { useState } from "react";
import { AdminShell, Icon } from "@/features/admin-shell";
import { useCreateHomeworkMutation, useHomeworksQuery } from "../hooks/use-homeworks";

export function HomeworksPage() {
  const [studentId, setStudentId] = useState("HS001");
  const homeworksQuery = useHomeworksQuery(studentId);
  const createMutation = useCreateHomeworkMutation();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: "Toán Học",
    title: "",
    content: "",
    teacher: "Nguyễn Văn Minh",
    deadline: "2026-06-27T20:00",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    createMutation.mutate(
      {
        student_id: studentId,
        subject: formData.subject,
        title: formData.title,
        content: formData.content,
        teacher: formData.teacher,
        deadline: new Date(formData.deadline).toISOString(),
      },
      {
        onSuccess: () => {
          setShowModal(false);
          setFormData({
            subject: "Toán Học",
            title: "",
            content: "",
            teacher: "Nguyễn Văn Minh",
            deadline: "2026-06-27T20:00",
          });
        },
      }
    );
  };

  return (
    <AdminShell
      title="Bài tập"
      subtitle="Giao, theo dõi và tổng hợp bài tập về nhà qua BFF /api/admin/homeworks."
      activeHref="/admin/homeworks"
    >
      <section className="relative overflow-hidden rounded-2xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full border-[32px] border-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
              Academics · Bài Tập Về Nhà
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Quản lý giao bài tập & Tiến độ
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Hệ thống tự động theo dõi hạn nộp và thống kê bài tập theo học sinh.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Mã học sinh..."
              className="bg-white border border-[var(--outline-variant)] text-sm rounded-lg px-3 py-2 text-[var(--foreground)] font-bold"
            />
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 font-bold text-[var(--primary)] shadow-sm hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Icon name="assignment" />
              + Giao Bài Tập Mới
            </button>
          </div>
        </div>
      </section>

      {homeworksQuery.isPending ? (
        <div role="status" className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-sm text-[var(--secondary)]">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent mb-3" />
          Đang tải danh sách bài tập của học sinh {studentId}...
        </div>
      ) : homeworksQuery.isError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <p className="font-bold">Không thể tải bài tập.</p>
          <button
            type="button"
            onClick={() => void homeworksQuery.refetch()}
            className="mt-3 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Thử tải lại
          </button>
        </div>
      ) : homeworksQuery.data?.items.length === 0 ? (
        <div className="rounded-2xl border border-[var(--outline-variant)] bg-white p-8 text-center text-sm text-[var(--secondary)]">
          Chưa có bài tập nào giao cho học sinh {studentId}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {homeworksQuery.data?.items.map((hw) => (
            <div key={hw.id} className="bg-white border border-[var(--outline-variant)] rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {hw.subject}
                </span>
                <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Hạn nộp: {new Date(hw.deadline).toLocaleString("vi-VN")}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">{hw.title}</h3>
              <p className="text-sm text-[var(--secondary)] leading-relaxed">{hw.content}</p>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--outline-variant)] text-xs text-[var(--secondary)]">
                <span>Giáo viên: {hw.teacher}</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Trạng thái: {hw.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[var(--outline-variant)] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Giao Bài Tập Mới</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Môn học</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Tiêu đề bài tập</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Tiêu đề..."
                  className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Yêu cầu & Nội dung</label>
                <textarea
                  rows={3}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Yêu cầu bài tập..."
                  className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Giáo viên phụ trách</label>
                  <input
                    type="text"
                    required
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--secondary)] mb-1">Hạn nộp</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full bg-white border border-[var(--outline-variant)] text-sm rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-[var(--secondary)] hover:text-[var(--foreground)]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 text-sm bg-[var(--primary)] text-white font-bold rounded-lg disabled:opacity-50"
                >
                  {createMutation.isPending ? "Đang giao..." : "Giao Bài Tập"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
