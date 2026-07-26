"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AdminShell } from "@/features/admin-shell";
import {
  useFeedbackDetailQuery,
  useFeedbackQuery,
  useUpdateFeedbackStatusMutation,
} from "../hooks/use-feedback";
import type { FeedbackStatus } from "../service/feedback.client";

export function FeedbackPage() {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions ?? [];
  const canManage =
    session?.user?.role === "super_admin" ||
    permissions.includes("communication.feedback.manage");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [updateError, setUpdateError] = useState("");

  const listQuery = useFeedbackQuery({
    page,
    page_size: 10,
    ...(query ? { q: query } : {}),
    ...(status ? { status: status as FeedbackStatus } : {}),
  });
  const detailQuery = useFeedbackDetailQuery(selectedId, {
    enabled: Boolean(selectedId),
  });
  const updateMutation = useUpdateFeedbackStatusMutation();
  const items = listQuery.data?.items ?? [];

  const updateStatus = (id: string, nextStatus: FeedbackStatus) => {
    setFeedback("");
    setUpdateError("");
    updateMutation.mutate(
      { id, status: nextStatus },
      {
        onSuccess: () => setFeedback("Đã cập nhật trạng thái phản hồi."),
        onError: () =>
          setUpdateError("Không thể cập nhật trạng thái phản hồi."),
      },
    );
  };

  return (
    <AdminShell
      title="Phản hồi"
      subtitle="Tiếp nhận và xử lý phản hồi từ phụ huynh, học sinh."
      activeHref="/admin/feedback"
    >
      <form
        className="flex flex-wrap gap-3 rounded-2xl border bg-white p-4"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setQuery(searchInput.trim());
        }}
      >
        <label className="flex-1">
          Tìm phản hồi
          <input
            aria-label="Tìm phản hồi"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="ml-2 rounded-lg border px-3 py-2"
          />
        </label>
        <label>
          Lọc trạng thái
          <select
            aria-label="Lọc trạng thái"
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            className="ml-2 rounded-lg border px-3 py-2"
          >
            <option value="">Tất cả</option>
            <option value="new">Mới</option>
            <option value="in_progress">Đang xử lý</option>
            <option value="resolved">Đã giải quyết</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-white"
        >
          Tìm kiếm
        </button>
      </form>

      {feedback ? (
        <p role="status" className="rounded-lg bg-emerald-50 p-3 text-emerald-800">
          {feedback}
        </p>
      ) : null}
      {updateError ? (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">
          {updateError}
        </p>
      ) : null}

      {listQuery.isPending ? (
        <p role="status">Đang tải phản hồi...</p>
      ) : listQuery.isError ? (
        <div role="alert">
          Không thể tải phản hồi.
          <button type="button" onClick={() => void listQuery.refetch()}>
            Thử lại
          </button>
        </div>
      ) : items.length === 0 ? (
        <p>Chưa có phản hồi phù hợp.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border bg-white p-5">
              <h2 className="font-bold">{item.title}</h2>
              <p>{item.content}</p>
              <button
                type="button"
                aria-label={`Xem chi tiết ${item.title}`}
                onClick={() => setSelectedId(item.id)}
              >
                Xem chi tiết
              </button>
              {canManage ? (
                <label className="ml-4">
                  Trạng thái
                  <select
                    aria-label="Cập nhật trạng thái"
                    value={item.status}
                    disabled={updateMutation.isPending}
                    onChange={(event) =>
                      updateStatus(item.id, event.target.value as FeedbackStatus)
                    }
                  >
                    <option value="new">Mới</option>
                    <option value="in_progress">Đang xử lý</option>
                    <option value="resolved">Đã giải quyết</option>
                  </select>
                </label>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {selectedId ? (
        <aside className="rounded-2xl border bg-white p-5">
          {detailQuery.isPending ? (
            <p role="status">Đang tải chi tiết...</p>
          ) : detailQuery.isError ? (
            <p role="alert">Không thể tải chi tiết.</p>
          ) : detailQuery.data ? (
            <>
              <h2>{detailQuery.data.title}</h2>
              <p>{detailQuery.data.content}</p>
            </>
          ) : null}
        </aside>
      ) : null}

      {listQuery.data ? (
        <nav aria-label="Phân trang phản hồi" className="flex gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
          >
            Trang trước
          </button>
          <span>Trang {page}</span>
          <button
            type="button"
            disabled={!listQuery.data.has_next}
            onClick={() => setPage((value) => value + 1)}
          >
            Trang sau
          </button>
        </nav>
      ) : null}
    </AdminShell>
  );
}
