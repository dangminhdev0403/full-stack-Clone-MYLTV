"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminShell } from "@/features/admin-shell";
import { ApiClientError } from "@/lib/api/schemas";
import {
  type NewsItem,
  type NewsWritePayload,
} from "../service/news.client";
import {
  useCreateNewsMutation,
  useDeleteNewsMutation,
  useHideNewsMutation,
  useNewsQuery,
  usePinNewsMutation,
  usePublishNewsMutation,
  useReorderNewsMutation,
  useUpdateNewsMutation,
} from "../hooks/use-news";

const categoryLabels: Record<string, string> = { "Thong bao": "Thông báo", "Tin tuc": "Tin tức", "Su kien": "Sự kiện" };
const statusLabels = { draft: "Bản nháp", published: "Đã xuất bản", hidden: "Đã ẩn" } as const;

export function NewsPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [preview, setPreview] = useState<NewsItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [actionError, setActionError] = useState("");
  const permissions = session?.user?.permissions ?? [];
  const isSuperAdmin = session?.user?.role === "super_admin";
  const canManage = isSuperAdmin || permissions.includes("communication.news.manage");
  const canPublish = isSuperAdmin || permissions.includes("communication.news.publish");
  
  const newsQuery = useNewsQuery(query ? `?q=${encodeURIComponent(query)}` : "");
  const createMutation = useCreateNewsMutation();
  const updateMutation = useUpdateNewsMutation();
  const publishMutation = usePublishNewsMutation();
  const hideMutation = useHideNewsMutation();
  const pinMutation = usePinNewsMutation();
  const reorderMutation = useReorderNewsMutation();

  const saveMutation = {
    isPending: createMutation.isPending || updateMutation.isPending,
    mutate: ({ id, payload }: { id?: string; payload: NewsWritePayload }) => {
      if (id) {
        updateMutation.mutate(
          { id, payload },
          {
            onSuccess: () => {
              setActionError("");
              setFeedback("Đã cập nhật tin tức.");
              setEditing(null);
              setShowForm(false);
            },
            onError: (error) => setActionError(errorMessage(error)),
          },
        );
      } else {
        createMutation.mutate(payload, {
          onSuccess: () => {
            setActionError("");
            setFeedback("Đã tạo tin tức.");
            setEditing(null);
            setShowForm(false);
          },
          onError: (error) => setActionError(errorMessage(error)),
        });
      }
    },
  };

  const deleteMutation = useDeleteNewsMutation();

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tin tức này?")) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            setActionError("");
            setFeedback("Đã xóa tin tức.");
          },
          onError: (error) => setActionError(errorMessage(error)),
        }
      );
    }
  };

  const actionMutation = {
    isPending:
      publishMutation.isPending ||
      hideMutation.isPending ||
      pinMutation.isPending ||
      reorderMutation.isPending ||
      deleteMutation.isPending,
    mutate: ({
      item,
      action,
      value,
    }: {
      item: NewsItem;
      action: "publish" | "hide" | "pin" | "reorder";
      value?: boolean | number;
    }) => {
      const onSuccess = () => {
        setActionError("");
        setFeedback("Đã cập nhật trạng thái tin tức.");
      };
      const onError = (error: unknown) => setActionError(errorMessage(error));

      if (action === "publish") {
        publishMutation.mutate({ id: item.id }, { onSuccess, onError });
      } else if (action === "hide") {
        hideMutation.mutate({ id: item.id }, { onSuccess, onError });
      } else if (action === "pin") {
        pinMutation.mutate(
          { id: item.id, isPinned: Boolean(value) },
          { onSuccess, onError },
        );
      } else {
        reorderMutation.mutate(
          { id: item.id, sortOrder: Number(value) },
          { onSuccess, onError },
        );
      }
    },
  };
  const items = newsQuery.data?.items ?? [];
  const queryError = newsQuery.error ? errorMessage(newsQuery.error) : "";

  function openCreate() { setEditing(null); setShowForm(true); setFeedback(""); }
  function openEdit(item: NewsItem) { setEditing(item); setShowForm(true); setFeedback(""); }

  return <AdminShell activeHref="/admin/news" title="Tin tức" subtitle="Quản lý nội dung thuộc Communication API.">
    <section aria-label="Bộ lọc tin tức" className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <form onSubmit={(event) => { event.preventDefault(); setQuery(String(new FormData(event.currentTarget).get("q") ?? "").trim()); }} className="flex flex-1 gap-2">
        <input name="q" aria-label="Tìm tin tức" placeholder="Tìm theo tiêu đề..." className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2" />
        <button className="rounded-lg border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50">Tìm kiếm</button>
      </form>
      {canManage ? <button type="button" onClick={openCreate} className="rounded-lg bg-[#004ac6] px-4 py-2 font-bold text-white hover:bg-blue-800">Tạo tin</button> : null}
    </section>

    {feedback ? <p role="status" className="rounded-lg bg-emerald-50 p-4 text-emerald-800">{feedback}</p> : null}
    {actionError || queryError ? <ErrorState message={actionError || queryError} retry={() => newsQuery.refetch()} /> : null}
    {showForm && canManage ? <NewsForm item={editing} pending={saveMutation.isPending} onCancel={() => setShowForm(false)} onSubmit={(payload) => saveMutation.mutate({ id: editing?.id, payload })} /> : null}

    <section aria-label="Danh sách tin tức" className="overflow-hidden rounded-xl border bg-white">
      {newsQuery.isPending ? <p className="p-6">Đang tải tin tức...</p> : null}
      {!newsQuery.isPending && !queryError && items.length === 0 ? <p className="p-8 text-center text-slate-500">Chưa có tin tức phù hợp.</p> : null}
      {items.length > 0 ? <div className="divide-y">{items.map((item) => <NewsRow key={item.id} item={item} canManage={canManage} canPublish={canPublish} pending={actionMutation.isPending} onPreview={setPreview} onEdit={openEdit} onDelete={handleDelete} onAction={(action, value) => actionMutation.mutate({ item, action, value })} />)}</div> : null}
    </section>

    {preview ? <Preview item={preview} onClose={() => setPreview(null)} /> : null}
  </AdminShell>;
}

function NewsRow({ item, canManage, canPublish, pending, onPreview, onEdit, onDelete, onAction }: { item: NewsItem; canManage: boolean; canPublish: boolean; pending: boolean; onPreview: (item: NewsItem) => void; onEdit: (item: NewsItem) => void; onDelete: (id: string) => void; onAction: (action: "publish" | "hide" | "pin" | "reorder", value?: boolean | number) => void }) {
  const status = item.status;
  return <article className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
    <div>
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide">
        <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-800">{categoryLabels[item.category] ?? item.category}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{statusLabels[status]}</span>
        {item.is_pinned ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">Đã ghim</span> : null}
      </div>
      <h2 className="mt-3 text-xl font-black">{item.title}</h2>
      <p className="mt-1 text-slate-600">{item.summary}</p>
      {item.published_at ? <p className="mt-2 text-xs text-slate-500">{new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.published_at))}</p> : null}
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => onPreview(item)} className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-50">Xem trước</button>
      {canManage ? <>
        <button type="button" onClick={() => onEdit(item)} className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-50">Chỉnh sửa</button>
        <button type="button" disabled={pending} onClick={() => onDelete(item.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50">Xóa</button>
        <button type="button" disabled={pending} onClick={() => onAction("pin", !item.is_pinned)} className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">{item.is_pinned ? "Bỏ ghim" : "Ghim tin"}</button>
        <button type="button" disabled={pending || item.sort_order === 0} aria-label="Đưa tin lên" onClick={() => onAction("reorder", Math.max(0, item.sort_order - 1))} className="rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-50">↑</button>
        <button type="button" disabled={pending} aria-label="Đưa tin xuống" onClick={() => onAction("reorder", item.sort_order + 1)} className="rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-50">↓</button>
      </> : null}
      {canPublish ? status !== "published" ? <button type="button" disabled={pending} onClick={() => onAction("publish")} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Xuất bản</button> : <button type="button" disabled={pending} onClick={() => onAction("hide")} className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Ẩn tin</button> : null}
    </div>
  </article>;
}

function NewsForm({ item, pending, onCancel, onSubmit }: { item: NewsItem | null; pending: boolean; onCancel: () => void; onSubmit: (payload: NewsWritePayload) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      title: String(form.get("title") ?? "").trim(),
      summary: String(form.get("summary") ?? "").trim(),
      content: String(form.get("content") ?? "").trim(),
      image_url: String(form.get("image_url") ?? "").trim() || null,
      category: String(form.get("category")) as NewsItem["category"],
      audiences: [{ type: "all", value: null }],
    });
  }
  return <form onSubmit={submit} className="grid gap-4 rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between"><h2 className="text-xl font-black">{item ? "Chỉnh sửa tin" : "Tạo tin mới"}</h2><button type="button" onClick={onCancel} className="text-sm font-semibold text-slate-600">Đóng</button></div>
    <label className="grid gap-1 text-sm font-semibold">Tiêu đề<input name="title" required minLength={3} defaultValue={item?.title} className="rounded-lg border p-3 font-normal" /></label>
    <label className="grid gap-1 text-sm font-semibold">Tóm tắt<textarea name="summary" required minLength={3} defaultValue={item?.summary} rows={2} className="rounded-lg border p-3 font-normal" /></label>
    <label className="grid gap-1 text-sm font-semibold">Nội dung<textarea name="content" required defaultValue={item?.content} rows={6} className="rounded-lg border p-3 font-normal" /></label>
    <div className="grid gap-4 md:grid-cols-2">
      <label className="grid gap-1 text-sm font-semibold">Danh mục<select name="category" defaultValue={item?.category ?? "Thong bao"} className="rounded-lg border p-3 font-normal"><option value="Thong bao">Thông báo</option><option value="Tin tuc">Tin tức</option><option value="Su kien">Sự kiện</option></select></label>
      <label className="grid gap-1 text-sm font-semibold">URL hình ảnh<input name="image_url" type="url" defaultValue={item?.image_url ?? ""} className="rounded-lg border p-3 font-normal" /></label>
    </div>

    <div className="flex justify-end gap-2"><button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 font-semibold">Hủy</button><button disabled={pending} className="rounded-lg bg-[#004ac6] px-4 py-2 font-bold text-white disabled:opacity-50">{pending ? "Đang lưu..." : "Lưu tin"}</button></div>
  </form>;
}

function Preview({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  return <div role="dialog" aria-modal="true" aria-labelledby="news-preview-title" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"><article className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex justify-between gap-4"><span className="text-sm font-bold text-cyan-800">{categoryLabels[item.category] ?? item.category}</span><button type="button" onClick={onClose} className="font-semibold">Đóng</button></div><h2 id="news-preview-title" className="mt-4 text-3xl font-black">{item.title}</h2><p className="mt-3 text-lg text-slate-600">{item.summary}</p>{item.image_url ? <a href={item.image_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-semibold text-blue-700 underline">Mở hình ảnh đính kèm</a> : null}<div className="mt-6 whitespace-pre-wrap leading-7 text-slate-800">{item.content || "Chưa có nội dung chi tiết."}</div></article></div>;
}

function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-50 p-4 text-red-800"><span>{message}</span><button type="button" onClick={retry} className="rounded-lg border border-red-300 px-3 py-1.5 font-semibold">Thử lại</button></div>;
}

function errorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.status === 403) return "Bạn không có quyền thực hiện thao tác này.";
    return `${error.message}${error.requestId ? ` (${error.requestId})` : ""}`;
  }
  return "Không thể kết nối dịch vụ tin tức.";
}
