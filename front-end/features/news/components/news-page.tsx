"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminShell, Icon } from "@/features/admin-shell";
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

const categoryConfig: Record<string, { label: string; bg: string; text: string; border: string; icon: string }> = {
  "Thong bao": { label: "Thông báo", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "campaign" },
  "Thông báo": { label: "Thông báo", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "campaign" },
  "Tin tuc": { label: "Tin tức", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: "newspaper" },
  "Tin tức": { label: "Tin tức", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: "newspaper" },
  "Su kien": { label: "Sự kiện", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "event" },
  "Sự kiện": { label: "Sự kiện", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "event" },
};

const categoryLabels: Record<string, string> = {
  "Thong bao": "Thông báo",
  "Tin tuc": "Tin tức",
  "Su kien": "Sự kiện",
};

const statusLabels = { draft: "Bản nháp", published: "Đã xuất bản", hidden: "Đã ẩn" } as const;

export function NewsPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
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
  const deleteMutation = useDeleteNewsMutation();

  const saveMutation = {
    isPending: createMutation.isPending || updateMutation.isPending,
    mutate: ({ id, payload }: { id?: string; payload: NewsWritePayload }) => {
      if (id) {
        updateMutation.mutate(
          { id, payload },
          {
            onSuccess: () => {
              setActionError("");
              setFeedback("Đã cập nhật tin tức thành công.");
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
            setFeedback("Đã tạo tin tức mới thành công.");
            setEditing(null);
            setShowForm(false);
          },
          onError: (error) => setActionError(errorMessage(error)),
        });
      }
    },
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tin tức này?")) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            setActionError("");
            setFeedback("Đã xóa tin tức thành công.");
          },
          onError: (error) => setActionError(errorMessage(error)),
        },
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

  const itemsData = newsQuery.data?.items;
  const rawItems = useMemo(() => itemsData ?? [], [itemsData]);
  const queryError = newsQuery.error ? errorMessage(newsQuery.error) : "";

  // Filtering on category & status for rich UX
  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      if (selectedCategory !== "all" && normalizeCategory(item.category) !== selectedCategory) return false;
      if (selectedStatus === "published" && item.status !== "published") return false;
      if (selectedStatus === "draft" && item.status !== "draft") return false;
      if (selectedStatus === "hidden" && item.status !== "hidden") return false;
      if (selectedStatus === "pinned" && !item.is_pinned) return false;
      return true;
    });
  }, [rawItems, selectedCategory, selectedStatus]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = rawItems.length;
    const published = rawItems.filter((i) => i.status === "published").length;
    const draft = rawItems.filter((i) => i.status === "draft").length;
    const pinned = rawItems.filter((i) => i.is_pinned).length;
    return { total, published, draft, pinned };
  }, [rawItems]);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
    setFeedback("");
    setActionError("");
  }

  function openEdit(item: NewsItem) {
    setEditing(item);
    setShowForm(true);
    setFeedback("");
    setActionError("");
  }

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setQuery(searchInput.trim());
  };

  return (
    <AdminShell
      activeHref="/admin/news"
      title="Tin tức & Thông báo"
      subtitle="Quản lý tin tức, thông báo và sự kiện truyền thông toàn hệ thống."
    >
      {/* 1. Header Metrics / Stats Bar */}
      <section aria-label="Thống kê tin tức" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:shadow-sm">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Icon name="article" className="text-[26px]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng số tin</p>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:shadow-sm">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <Icon name="check_circle" className="text-[26px]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Đã xuất bản</p>
            <p className="text-2xl font-black text-slate-900">{stats.published}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:shadow-sm">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <Icon name="edit_note" className="text-[26px]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bản nháp</p>
            <p className="text-2xl font-black text-slate-900">{stats.draft}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:shadow-sm">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
            <Icon name="keep" className="text-[26px]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Đã ghim</p>
            <p className="text-2xl font-black text-slate-900">{stats.pinned}</p>
          </div>
        </div>
      </section>

      {/* 2. Controls & Search/Filters Header */}
      <section aria-label="Bộ lọc tin tức" className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]" />
              <input
                name="q"
                aria-label="Tìm tin tức"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm theo tiêu đề..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {searchInput && (
                <button
                  type="button"
                  aria-label="Xóa tìm kiếm"
                  onClick={() => { setSearchInput(""); setQuery(""); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Icon name="close" className="text-[18px]" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
            >
              <Icon name="search" className="text-[18px]" />
              <span>Tìm kiếm</span>
            </button>
          </form>

          {canManage ? (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-[0.98]"
            >
              <Icon name="add" className="text-[20px]" />
              <span>Tạo tin</span>
            </button>
          ) : null}
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          {/* Categories Tab */}
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <span className="mr-1 text-slate-400 font-semibold">Danh mục:</span>
            {[
              { id: "all", label: "Tất cả" },
              { id: "Thong bao", label: "Thông báo" },
              { id: "Tin tuc", label: "Tin tức" },
              { id: "Su kien", label: "Sự kiện" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Status Tab */}
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <span className="mr-1 text-slate-400 font-semibold">Trạng thái:</span>
            {[
              { id: "all", label: "Tất cả" },
              { id: "published", label: "Đã xuất bản" },
              { id: "draft", label: "Bản nháp" },
              { id: "hidden", label: "Đã ẩn" },
              { id: "pinned", label: "Đã ghim" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStatus(st.id)}
                className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                  selectedStatus === st.id
                    ? "bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback & Error alerts */}
      {feedback ? (
        <div role="status" className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-800 shadow-xs">
          <div className="flex items-center gap-2">
            <Icon name="check_circle" className="text-[20px] text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button type="button" aria-label="Đóng thông báo" onClick={() => setFeedback("")} className="text-emerald-600 hover:text-emerald-900">
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      ) : null}

      {actionError || queryError ? (
        <ErrorState message={actionError || queryError} retry={() => newsQuery.refetch()} />
      ) : null}

      {/* Modal Form for Create / Edit */}
      {showForm && canManage ? (
        <NewsFormModal
          item={editing}
          pending={saveMutation.isPending}
          onCancel={() => setShowForm(false)}
          onSubmit={(payload) => saveMutation.mutate({ id: editing?.id, payload })}
        />
      ) : null}

      {/* 3. News List Container */}
      <section aria-label="Danh sách tin tức" className="space-y-3">
        {newsQuery.isPending ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-12 text-slate-500 shadow-xs">
            <div className="size-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
            <p className="mt-3 text-sm font-medium">Đang tải tin tức...</p>
          </div>
        ) : null}

        {!newsQuery.isPending && !queryError && filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
            <div className="grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Icon name="newspaper" className="text-[32px]" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">Không tìm thấy tin tức</h3>
            <p className="mt-1 text-sm text-slate-500">Chưa có tin tức phù hợp.</p>
            {canManage && (
              <button
                type="button"
                onClick={openCreate}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
              >
                <Icon name="add" className="text-[18px]" />
                <span>Tạo tin mới ngay</span>
              </button>
            )}
          </div>
        ) : null}

        {filteredItems.length > 0 ? (
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                canManage={canManage}
                canPublish={canPublish}
                pending={actionMutation.isPending}
                onPreview={setPreview}
                onEdit={openEdit}
                onDelete={handleDelete}
                onAction={(action, value) => actionMutation.mutate({ item, action, value })}
              />
            ))}
          </div>
        ) : null}
      </section>

      {/* 4. Article Preview Dialog Modal */}
      {preview ? <PreviewModal item={preview} onClose={() => setPreview(null)} /> : null}
    </AdminShell>
  );
}

function NewsCard({
  item,
  canManage,
  canPublish,
  pending,
  onPreview,
  onEdit,
  onDelete,
  onAction,
}: {
  item: NewsItem;
  canManage: boolean;
  canPublish: boolean;
  pending: boolean;
  onPreview: (item: NewsItem) => void;
  onEdit: (item: NewsItem) => void;
  onDelete: (id: string) => void;
  onAction: (action: "publish" | "hide" | "pin" | "reorder", value?: boolean | number) => void;
}) {
  const status = item.status;
  const categoryMeta = categoryConfig[item.category] ?? {
    label: categoryLabels[item.category] ?? item.category,
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: "bookmark",
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md md:flex-row md:items-center md:justify-between md:gap-6">
      {/* Visual Accent bar for Pinned Items */}
      {item.is_pinned && (
        <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-amber-400 to-amber-600" />
      )}

      {/* Content Section */}
      <div className="flex flex-1 items-start gap-4">
        {/* Optional Thumbnail or Category Icon Backdrop */}
        {item.image_url ? (
          <div className="hidden size-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:block">
            {/* eslint-disable-next-html-element-for-img */}
            <img src={item.image_url} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
        ) : (
          <div className={`hidden size-14 shrink-0 place-items-center rounded-xl ${categoryMeta.bg} ${categoryMeta.text} sm:grid`}>
            <Icon name={categoryMeta.icon} className="text-[24px]" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Badges Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {/* Category Tag */}
            <span className={`inline-flex items-center gap-1 rounded-md border ${categoryMeta.border} ${categoryMeta.bg} ${categoryMeta.text} px-2.5 py-0.5`}>
              <Icon name={categoryMeta.icon} className="text-[14px]" />
              <span>{categoryMeta.label}</span>
            </span>

            {/* Status Tag */}
            {status === "published" && (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{statusLabels.published}</span>
              </span>
            )}
            {status === "draft" && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-amber-700">
                <span>{statusLabels.draft}</span>
              </span>
            )}
            {status === "hidden" && (
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-slate-600">
                <span>{statusLabels.hidden}</span>
              </span>
            )}

            {/* Pinned Tag */}
            {item.is_pinned ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-100/80 px-2.5 py-0.5 text-amber-800 font-bold">
                <Icon name="keep" className="text-[14px]" />
                <span>Đã ghim</span>
              </span>
            ) : null}

            {/* Sort Order indicator */}
            <span className="ml-auto text-[11px] text-slate-400 font-mono">#Thứ tự: {item.sort_order}</span>
          </div>

          {/* Title */}
          <h2 className="mt-2 text-lg font-bold leading-snug text-slate-900 group-hover:text-blue-600 transition-colors">
            {item.title}
          </h2>

          {/* Summary */}
          <p className="mt-1 line-clamp-2 text-sm text-slate-600 leading-relaxed">
            {item.summary}
          </p>

          {/* Footer Timestamp */}
          {item.published_at ? (
            <div className="mt-2.5 flex items-center gap-1 text-xs font-medium text-slate-400">
              <Icon name="schedule" className="text-[14px]" />
              <span>
                Xuất bản: {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.published_at))}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 md:mt-0 md:border-t-0 md:pt-0">
        <button
          type="button"
          onClick={() => onPreview(item)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-[0.97]"
        >
          <Icon name="visibility" className="text-[16px] text-slate-500" />
          <span>Xem trước</span>
        </button>

        {canManage ? (
          <>
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-[0.97]"
            >
              <Icon name="edit" className="text-[16px] text-blue-600" />
              <span>Chỉnh sửa</span>
            </button>

            <button
              type="button"
              disabled={pending}
              onClick={() => onDelete(item.id)}
              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-all disabled:opacity-50 active:scale-[0.97]"
            >
              <Icon name="delete" className="text-[16px]" />
              <span>Xóa</span>
            </button>

            <button
              type="button"
              disabled={pending}
              onClick={() => onAction("pin", !item.is_pinned)}
              className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50 active:scale-[0.97] ${
                item.is_pinned
                  ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon name="keep" className="text-[16px]" />
              <span>{item.is_pinned ? "Bỏ ghim" : "Ghim tin"}</span>
            </button>

            {/* Reorder Buttons */}
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-xs">
              <button
                type="button"
                disabled={pending || item.sort_order === 0}
                aria-label="Đưa tin lên"
                onClick={() => onAction("reorder", Math.max(0, item.sort_order - 1))}
                className="grid size-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                title="Đưa tin lên"
              >
                <Icon name="arrow_upward" className="text-[16px]" />
              </button>
              <div className="h-4 w-px bg-slate-200" />
              <button
                type="button"
                disabled={pending}
                aria-label="Đưa tin xuống"
                onClick={() => onAction("reorder", item.sort_order + 1)}
                className="grid size-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                title="Đưa tin xuống"
              >
                <Icon name="arrow_downward" className="text-[16px]" />
              </button>
            </div>
          </>
        ) : null}

        {/* Publish/Hide Button */}
        {canPublish ? (
          status !== "published" ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => onAction("publish")}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all disabled:opacity-50 active:scale-[0.97]"
            >
              <Icon name="publish" className="text-[16px]" />
              <span>Xuất bản</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => onAction("hide")}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-900 transition-all disabled:opacity-50 active:scale-[0.97]"
            >
              <Icon name="visibility_off" className="text-[16px]" />
              <span>Ẩn tin</span>
            </button>
          )
        ) : null}
      </div>
    </article>
  );
}

function NewsFormModal({
  item,
  pending,
  onCancel,
  onSubmit,
}: {
  item: NewsItem | null;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (payload: NewsWritePayload) => void;
}) {
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? "");

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-form-title"
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-blue-100 text-blue-700">
              <Icon name={item ? "edit" : "add_box"} className="text-[20px]" />
            </div>
            <h2 id="news-form-title" className="text-lg font-bold text-slate-900">
              {item ? "Chỉnh sửa tin" : "Tạo tin mới"}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Đóng biểu mẫu"
            onClick={onCancel}
            className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} className="p-6 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Tiêu đề <span className="text-rose-500">*</span>
            </span>
            <input
              name="title"
              required
              minLength={3}
              defaultValue={item?.title}
              placeholder="Nhập tiêu đề tin tức hoặc thông báo..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Tóm tắt ngắn <span className="text-rose-500">*</span>
            </span>
            <textarea
              name="summary"
              required
              minLength={3}
              defaultValue={item?.summary}
              rows={2}
              placeholder="Mô tả tóm tắt nội dung chính..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Nội dung chi tiết <span className="text-rose-500">*</span>
            </span>
            <textarea
              name="content"
              required
              defaultValue={item?.content}
              rows={5}
              placeholder="Nhập toàn bộ nội dung bài viết..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Danh mục</span>
              <select
                name="category"
                defaultValue={item?.category ?? "Thong bao"}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Thong bao">Thông báo</option>
                <option value="Tin tuc">Tin tức</option>
                <option value="Su kien">Sự kiện</option>
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">URL hình ảnh (Tùy chọn)</span>
              <input
                name="image_url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/banner.jpg"
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
          </div>

          {/* Image Preview Box */}
          {imageUrl ? (
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
              <span className="block text-[11px] font-semibold text-slate-500 mb-1">Xem trước ảnh đính kèm:</span>
              <div className="max-h-36 overflow-hidden rounded-lg">
                {/* eslint-disable-next-html-element-for-img */}
                <img src={imageUrl} alt="Preview" className="w-full object-cover" />
              </div>
            </div>
          ) : null}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {pending ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu tin</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PreviewModal({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  const categoryMeta = categoryConfig[item.category] ?? {
    label: categoryLabels[item.category] ?? item.category,
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: "bookmark",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-preview-title"
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <article className="relative my-8 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10">
        {/* Banner image if present */}
        {item.image_url ? (
          <div className="relative h-56 w-full overflow-hidden bg-slate-900">
            {/* eslint-disable-next-html-element-for-img */}
            <img src={item.image_url} alt="" className="size-full object-cover opacity-90" />
            <button
              type="button"
              aria-label="Đóng xem trước"
              onClick={onClose}
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-slate-950/60 text-white backdrop-blur-md hover:bg-slate-950/80 transition-all"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>
        ) : null}

        <div className="p-6 md:p-8">
          {!item.image_url && (
            <div className="flex justify-end">
              <button
                type="button"
                aria-label="Đóng xem trước"
                onClick={onClose}
                className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>
          )}

          {/* Badges Header */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-md border ${categoryMeta.border} ${categoryMeta.bg} ${categoryMeta.text} px-3 py-1 text-xs font-bold`}>
              <Icon name={categoryMeta.icon} className="text-[14px]" />
              <span>{categoryMeta.label}</span>
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {statusLabels[item.status]}
            </span>
            {item.is_pinned && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                <Icon name="keep" className="text-[14px]" />
                <span>Đã ghim</span>
              </span>
            )}
          </div>

          {/* Article Title */}
          <h2 id="news-preview-title" className="mt-4 text-2xl font-black leading-tight text-slate-900 md:text-3xl">
            {item.title}
          </h2>

          {/* Article Summary */}
          <p className="mt-3 text-base font-medium leading-relaxed text-slate-600 border-l-3 border-blue-500 pl-4 py-1 bg-blue-50/40 rounded-r-xl">
            {item.summary}
          </p>

          {item.image_url ? (
            <a
              href={item.image_url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
            >
              <Icon name="open_in_new" className="text-[14px]" />
              <span>Mở hình ảnh đính kèm gốc</span>
            </a>
          ) : null}

          <hr className="my-6 border-slate-100" />

          {/* Article Full Content */}
          <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
            {item.content || "Chưa có nội dung chi tiết."}
          </div>

          {/* Modal Footer */}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 shadow-xs">
      <div className="flex items-center gap-2">
        <Icon name="error" className="text-[20px] text-rose-600" />
        <span>{message}</span>
      </div>
      <button
        type="button"
        onClick={retry}
        className="rounded-xl border border-rose-300 bg-white px-4 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
      >
        Thử lại
      </button>
    </div>
  );
}

function normalizeCategory(category: string) {
  return ({ "Thông báo": "Thong bao", "Tin tức": "Tin tuc", "Sự kiện": "Su kien" } as Record<string, string>)[category] ?? category;
}

function errorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.status === 403) return "Bạn không có quyền thực hiện thao tác này.";
    return `${error.message}${error.requestId ? ` (${error.requestId})` : ""}`;
  }
  return "Không thể kết nối dịch vụ tin tức.";
}
