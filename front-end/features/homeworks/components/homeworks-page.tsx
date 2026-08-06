"use client";

import { useState } from "react";
import { AdminShell } from "@/features/admin-shell";
import { useClassesQuery } from "@/features/academic-structure/hooks/use-academic-structure";
import { useStudentsQuery } from "@/features/students/hooks/use-students";
import {
  useArchiveHomeworkMutation,
  useCreateHomeworkMutation,
  useHomeworksQuery,
} from "../hooks/use-homeworks";

export function HomeworksPage() {
  const [classId, setClassId] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [targetType, setTargetType] = useState<"class" | "students">("class");
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const classes = useClassesQuery({ is_active: true });
  const students = useStudentsQuery("?page_size=100");
  const homeworks = useHomeworksQuery({
    class_id: classId || undefined,
    include_archived: showArchived,
  });
  const create = useCreateHomeworkMutation();
  const archive = useArchiveHomeworkMutation();
  const [form, setForm] = useState({
    subject: "",
    title: "",
    content: "",
    teacher: "",
    deadline: "",
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (targetType === "class" ? !classId : studentIds.length === 0) return;
    create.mutate(
      {
        target_type: targetType,
        ...(targetType === "class"
          ? { class_id: classId }
          : { student_ids: studentIds }),
        ...form,
        deadline: new Date(form.deadline).toISOString(),
      },
      {
        onSuccess: () => {
          setFormOpen(false);
          setForm({
            subject: "",
            title: "",
            content: "",
            teacher: "",
            deadline: "",
          });
        },
      },
    );
  }

  return (
    <AdminShell
      title="Bài tập"
      subtitle="Giao bài và theo dõi tiến độ nộp thực tế."
      activeHref="/admin/homeworks"
    >
      <section className="rounded-2xl bg-[var(--primary)] p-6 text-white">
        <h2 className="text-2xl font-black">Quản lý bài tập</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <label className="grid gap-1 text-sm font-bold">
            Lớp
            <select
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
              className="rounded-lg bg-white px-3 py-2 text-slate-900"
            >
              <option value="">Tất cả lớp</option>
              {classes.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.display_name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(event) => setShowArchived(event.target.checked)}
            />{" "}
            Hiện bài đã lưu trữ
          </label>
          <button
            type="button"
            disabled={!classId}
            onClick={() => setFormOpen(true)}
            className="ml-auto self-end rounded-lg bg-white px-4 py-2 font-bold text-[var(--primary)] disabled:opacity-50"
          >
            Giao bài mới
          </button>
        </div>
      </section>

      {homeworks.isPending ? (
        <p role="status" className="rounded-xl border bg-white p-6">
          Đang tải bài tập...
        </p>
      ) : homeworks.isError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800"
        >
          Không thể tải bài tập.{" "}
          <button
            type="button"
            onClick={() => void homeworks.refetch()}
            className="underline"
          >
            Thử lại
          </button>
        </div>
      ) : !homeworks.data?.items.length ? (
        <p className="rounded-xl border bg-white p-6">
          Chưa có bài tập phù hợp.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {homeworks.data.items.map((item) => (
            <article key={item.id} className="rounded-2xl border bg-white p-5">
              <div className="flex justify-between gap-3">
                <strong>{item.subject}</strong>
                <span>{new Date(item.deadline).toLocaleString("vi-VN")}</span>
              </div>
              <h3 className="mt-2 text-lg font-black">{item.title}</h3>
              <p className="mt-2 text-sm">{item.content}</p>
              <p className="mt-3 text-sm">
                Đã nộp {item.progress.submitted}/{item.progress.assigned}; còn{" "}
                {item.progress.pending}
              </p>
              {!item.archived_at && (
                <button
                  type="button"
                  disabled={archive.isPending}
                  onClick={() => archive.mutate(item.id)}
                  className="mt-3 rounded-lg border px-3 py-2 text-sm"
                >
                  Lưu trữ
                </button>
              )}
            </article>
          ))}
        </div>
      )}

      {formOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="homework-form-title"
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
        >
          <form
            onSubmit={submit}
            className="w-full max-w-lg space-y-3 rounded-2xl bg-white p-6"
          >
            <h2 id="homework-form-title" className="text-xl font-black">
              Giao bài tập
            </h2>
            <fieldset className="flex gap-4">
              <legend className="text-sm font-bold">Đối tượng nhận</legend>
              {(["class", "students"] as const).map((type) => (
                <label key={type} className="flex gap-2 text-sm">
                  <input
                    type="radio"
                    checked={targetType === type}
                    onChange={() => setTargetType(type)}
                  />
                  {type === "class" ? "Cả lớp" : "Học sinh được chọn"}
                </label>
              ))}
            </fieldset>
            {targetType === "class" ? (
              <label className="grid gap-1 text-sm font-bold">
                Lớp
                <select
                  required
                  value={classId}
                  onChange={(event) => setClassId(event.target.value)}
                  className="rounded-lg border p-2"
                >
                  <option value="">Chọn lớp</option>
                  {classes.data?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.display_name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="grid gap-1 text-sm font-bold">
                Học sinh
                <select
                  multiple
                  required
                  value={studentIds}
                  onChange={(event) =>
                    setStudentIds(
                      Array.from(
                        event.target.selectedOptions,
                        (option) => option.value,
                      ),
                    )
                  }
                  className="min-h-28 rounded-lg border p-2"
                >
                  {students.data?.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code} · {item.full_name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {(["subject", "title", "teacher", "deadline"] as const).map(
              (field) => (
                <label key={field} className="grid gap-1 text-sm font-bold">
                  {
                    {
                      subject: "Môn học",
                      title: "Tiêu đề",
                      teacher: "Giáo viên",
                      deadline: "Hạn nộp",
                    }[field]
                  }
                  <input
                    required
                    type={field === "deadline" ? "datetime-local" : "text"}
                    value={form[field]}
                    onChange={(event) =>
                      setForm({ ...form, [field]: event.target.value })
                    }
                    className="rounded-lg border p-2"
                  />
                </label>
              ),
            )}
            <label className="grid gap-1 text-sm font-bold">
              Nội dung
              <textarea
                required
                value={form.content}
                onChange={(event) =>
                  setForm({ ...form, content: event.target.value })
                }
                className="rounded-lg border p-2"
              />
            </label>
            {create.isError && (
              <p role="alert" className="text-sm text-red-700">
                Không thể giao bài. Kiểm tra dữ liệu rồi thử lại.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-lg border px-4 py-2"
              >
                Hủy
              </button>
              <button
                disabled={create.isPending}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-white"
              >
                {create.isPending ? "Đang giao..." : "Giao bài"}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
