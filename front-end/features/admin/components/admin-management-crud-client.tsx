"use client";

import { useCallback, useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { Icon } from "./admin-shell";
import {
  createAdminManagementRecord,
  getAdminManagementCatalogItem,
  getAdminManagementRecordDetail,
  updateAdminManagementRecord,
} from "../service/admin-management.service";
import type { AdminFieldSpec, AdminManagementRecord, AdminManagementSurface } from "../types/admin-management.types";

type FormMode = "create" | "update";
type FormValues = Record<string, string | boolean>;

type DetailState = {
  record: AdminManagementRecord;
  payload?: Record<string, unknown>;
  loading: boolean;
  error?: string;
};

export function AdminManagementCrudClient({ initialSurface }: { initialSurface: AdminManagementSurface }) {
  const [surface, setSurface] = useState(initialSurface);
  const [listLoading, setListLoading] = useState(false);
  const [listMessage, setListMessage] = useState<string | undefined>();
  const [listError, setListError] = useState(surface.error);
  const [formState, setFormState] = useState<{ mode: FormMode; record?: AdminManagementRecord } | null>(null);
  const [detailState, setDetailState] = useState<DetailState | null>(null);

  const canCreate = Boolean(surface.supports?.create && surface.source === "backend");
  const canUpdate = Boolean(surface.supports?.update && surface.source === "backend");
  const canDetail = Boolean(surface.supports?.detail && surface.source === "backend");

  const refreshList = useCallback(async () => {
    setListLoading(true);
    setListError(undefined);
    setListMessage(undefined);

    try {
      const nextSurface = await getAdminManagementCatalogItem(surface.domain);
      if (!nextSurface) {
        setListError("Domain quản trị này chưa được khai báo trong service contract layer.");
        return;
      }

      setSurface(nextSurface);
      setListError(nextSurface.error);
      if (!nextSurface.error) {
        setListMessage("Đã làm mới danh sách từ backend.");
      }
    } catch (error) {
      setListError(getErrorMessage(error));
    } finally {
      setListLoading(false);
    }
  }, [surface.domain]);

  const openDetail = useCallback(
    async (record: AdminManagementRecord) => {
      if (!canDetail) {
        setDetailState({
          record,
          payload: record.raw,
          loading: false,
          error: surface.error ?? "Backend chưa bật endpoint chi tiết cho domain này.",
        });
        return;
      }

      setDetailState({ record, payload: record.raw, loading: true });
      try {
        const payload = await getAdminManagementRecordDetail(surface.domain, record.id);
        setDetailState({ record, payload, loading: false });
      } catch (error) {
        setDetailState({ record, payload: record.raw, loading: false, error: getErrorMessage(error) });
      }
    },
    [canDetail, surface.domain, surface.error],
  );

  const openUpdate = useCallback((record: AdminManagementRecord) => {
    if (!canUpdate) return;
    setFormState({ mode: "update", record });
  }, [canUpdate]);

  const handleSave = useCallback(
    async (mode: FormMode, values: Record<string, unknown>, record?: AdminManagementRecord) => {
      if (mode === "create") {
        await createAdminManagementRecord(surface.domain, values);
      } else if (record) {
        await updateAdminManagementRecord(surface.domain, record.id, values);
      }

      const nextSurface = await getAdminManagementCatalogItem(surface.domain);
      if (nextSurface) {
        setSurface(nextSurface);
        setListError(nextSurface.error);
      }

      const activeDetail = detailState;
      if (record && activeDetail?.record.id === record.id) {
        try {
          const payload = await getAdminManagementRecordDetail(surface.domain, record.id);
          setDetailState({ record: activeDetail.record, payload, loading: false });
        } catch (error) {
          setDetailState({ record: activeDetail.record, payload: activeDetail.payload, loading: false, error: getErrorMessage(error) });
        }
      }

      setListMessage(mode === "create" ? "Đã tạo mới và làm mới danh sách." : "Đã cập nhật và làm mới danh sách.");
    },
    [detailState, surface.domain],
  );

  return (
    <section className="rounded-xl border border-[#c3c6d7] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#c3c6d7] p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#505f76]">Dữ liệu quản trị từ backend</p>
          <h2 className="mt-1 text-xl font-bold text-[#191b23]">{surface.shortTitle}</h2>
          <p className="mt-1 text-sm text-[#505f76]">
            {surface.source === "backend" ? `${surface.records.length} bản ghi từ /api/v1/admin/management/${surface.domain}` : "Backend endpoint chưa sẵn sàng"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#c3c6d7] bg-[#ededf9] px-4 text-sm font-bold text-[#191b23] transition hover:bg-[#e1e2ed] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={listLoading}
            onClick={refreshList}
            type="button"
          >
            <Icon name="sync" className="text-[18px]" />
            {listLoading ? "Đang làm mới" : "Làm mới"}
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-4 text-sm font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canCreate}
            onClick={() => setFormState({ mode: "create" })}
            title={canCreate ? "Tạo mới" : surface.error ?? "Backend chưa bật create endpoint"}
            type="button"
          >
            <Icon name="add" className="text-[18px]" />
            Tạo mới
          </button>
        </div>
      </div>

      {listError ? <ApiBlocker message={listError} onRetry={refreshList} retrying={listLoading} /> : null}
      {listMessage && !listError ? <InlineMessage tone="success" message={listMessage} /> : null}
      {listLoading ? <LoadingState /> : null}
      {!listLoading && !listError && surface.records.length === 0 ? <EmptyState domain={surface.shortTitle} canCreate={canCreate} onCreate={() => setFormState({ mode: "create" })} /> : null}

      <div className="divide-y divide-[#e1e2ed]">
        {surface.records.map((record) => (
          <RecordCard
            key={record.id}
            record={record}
            canOpenDetail={canDetail}
            canUpdate={canUpdate}
            onOpenDetail={() => openDetail(record)}
            onUpdate={() => openUpdate(record)}
          />
        ))}
      </div>

      {!canCreate || !canUpdate || !canDetail ? (
        <div className="border-t border-[#e1e2ed] bg-[#f8fafc] p-4 text-sm text-[#505f76]">
          Một số thao tác bị khóa khi backend không khai báo hỗ trợ hoặc endpoint đang lỗi. Dùng Làm mới để kiểm tra lại trạng thái API.
        </div>
      ) : null}

      {formState ? (
        <CrudFormDialog
          fields={surface.fields}
          mode={formState.mode}
          record={formState.record}
          surfaceTitle={surface.shortTitle}
          onClose={() => setFormState(null)}
          onSave={handleSave}
        />
      ) : null}

      {detailState ? <DetailDialog detailState={detailState} onClose={() => setDetailState(null)} onEdit={canUpdate ? () => setFormState({ mode: "update", record: detailState.record }) : undefined} /> : null}
    </section>
  );
}

function RecordCard({
  record,
  canOpenDetail,
  canUpdate,
  onOpenDetail,
  onUpdate,
}: {
  record: AdminManagementRecord;
  canOpenDetail: boolean;
  canUpdate: boolean;
  onOpenDetail: () => void;
  onUpdate: () => void;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenDetail();
    }
  };

  return (
    <article
      className="cursor-pointer p-5 transition hover:bg-[#f3f3fe] focus-within:bg-[#f3f3fe]"
      onClick={onOpenDetail}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Xem chi tiết ${record.title}`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#505f76]">{record.id}</p>
          <h3 className="mt-1 text-lg font-bold text-[#191b23]">{record.title}</h3>
          <p className="mt-1 text-sm leading-6 text-[#505f76]">{record.subtitle}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {record.metrics.map((metric) => (
              <span key={metric} className="rounded-full bg-[#dbe1ff] px-3 py-1 text-xs font-bold text-[#004ac6]">{metric}</span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-bold text-[#004ac6] hover:bg-[#dbe1ff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canOpenDetail}
              onClick={(event) => {
                event.stopPropagation();
                onOpenDetail();
              }}
              type="button"
            >
              Chi tiết
            </button>
            <button
              className="inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-bold text-[#004ac6] hover:bg-[#dbe1ff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canUpdate}
              onClick={(event) => {
                event.stopPropagation();
                onUpdate();
              }}
              type="button"
            >
              Sửa
            </button>
          </div>
        </div>
        <div className="text-left md:text-right">
          <StatusPill status={record.status} />
          <p className="mt-3 text-xs text-[#505f76]">Cập nhật: {record.updatedAt}</p>
          <p className="mt-1 text-xs text-[#505f76]">Phụ trách: {record.owner}</p>
        </div>
      </div>
    </article>
  );
}

function CrudFormDialog({
  fields,
  mode,
  record,
  surfaceTitle,
  onClose,
  onSave,
}: {
  fields: AdminFieldSpec[];
  mode: FormMode;
  record?: AdminManagementRecord;
  surfaceTitle: string;
  onClose: () => void;
  onSave: (mode: FormMode, values: Record<string, unknown>, record?: AdminManagementRecord) => Promise<void>;
}) {
  const initialValues = useMemo(() => buildInitialValues(fields, record), [fields, record]);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const title = mode === "create" ? `Tạo mới ${surfaceTitle.toLowerCase()}` : `Sửa ${surfaceTitle.toLowerCase()}`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateValues(fields, values);
    setFieldErrors(errors);
    setSubmitError(undefined);

    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await onSave(mode, normalizePayload(fields, values), record);
      onClose();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#191b23]/60 p-4" role="presentation">
      <form aria-label={title} className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl" onSubmit={handleSubmit}>
        <div className="flex items-start justify-between gap-3 border-b border-[#e1e2ed] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#191b23]">{title}</h2>
            <p className="mt-1 text-sm text-[#505f76]">Các trường có dấu * là bắt buộc. Dữ liệu sẽ được gửi trực tiếp tới backend.</p>
          </div>
          <button aria-label="Đóng hộp thoại" className="grid size-10 place-items-center rounded-lg text-[#505f76] hover:bg-[#e1e2ed] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <FormField
              key={field.key}
              field={field}
              error={fieldErrors[field.key]}
              value={values[field.key]}
              onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))}
            />
          ))}
        </div>

        {submitError ? <InlineMessage tone="error" message={submitError} /> : null}

        <div className="mt-5 flex flex-col-reverse gap-2 border-t border-[#e1e2ed] pt-4 sm:flex-row sm:justify-end">
          <button className="min-h-10 rounded-lg border border-[#c3c6d7] px-4 text-sm font-bold text-[#505f76] hover:bg-[#e1e2ed] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]" disabled={submitting} onClick={onClose} type="button">
            Hủy
          </button>
          <button className="min-h-10 rounded-lg bg-[#004ac6] px-4 text-sm font-bold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff] disabled:cursor-not-allowed disabled:opacity-50" disabled={submitting} type="submit">
            {submitting ? "Đang lưu" : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({ field, value, error, onChange }: { field: AdminFieldSpec; value: string | boolean | undefined; error?: string; onChange: (value: string | boolean) => void }) {
  const id = `admin-crud-${field.key}`;
  const commonClass = "min-h-11 rounded-lg border border-[#c3c6d7] bg-[#f8fafc] px-3 text-sm text-[#191b23] outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#b4c5ff]";

  return (
    <label className={`grid gap-2 text-sm font-semibold text-[#191b23] ${field.type === "textarea" ? "md:col-span-2" : ""}`} htmlFor={id}>
      <span>{field.label}{field.required ? " *" : ""}</span>
      {field.type === "textarea" ? (
        <textarea className={`${commonClass} min-h-28 py-3`} id={id} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} />
      ) : field.type === "select" ? (
        <select className={commonClass} id={id} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)}>
          <option value="">Chọn {field.label.toLowerCase()}</option>
          {(field.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : field.type === "boolean" ? (
        <span className="flex min-h-11 items-center gap-3 rounded-lg border border-[#c3c6d7] bg-[#f8fafc] px-3">
          <input checked={Boolean(value)} className="size-5 accent-[#004ac6]" id={id} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
          <span className="text-sm text-[#505f76]">Bật {field.label.toLowerCase()}</span>
        </span>
      ) : (
        <input className={commonClass} id={id} type={inputTypeFor(field.type)} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} />
      )}
      <span className="font-mono text-xs font-medium text-[#737686]">{field.contractKey ?? field.key}</span>
      {error ? <span className="text-sm font-semibold text-[#ba1a1a]">{error}</span> : null}
    </label>
  );
}

function DetailDialog({ detailState, onClose, onEdit }: { detailState: DetailState; onClose: () => void; onEdit?: () => void }) {
  const payload = detailState.payload ?? detailState.record.raw;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-[#191b23]/60" role="presentation">
      <aside aria-label={`Chi tiết ${detailState.record.title}`} className="h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-[#e1e2ed] pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#505f76]">{detailState.record.id}</p>
            <h2 className="mt-1 text-xl font-bold text-[#191b23]">{detailState.record.title}</h2>
            <p className="mt-1 text-sm text-[#505f76]">{detailState.record.subtitle}</p>
          </div>
          <button aria-label="Đóng chi tiết" className="grid size-10 place-items-center rounded-lg text-[#505f76] hover:bg-[#e1e2ed] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {onEdit ? (
            <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-4 text-sm font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]" onClick={onEdit} type="button">
              <Icon name="edit" className="text-[18px]" />
              Sửa
            </button>
          ) : null}
          <StatusPill status={detailState.record.status} />
        </div>

        {detailState.loading ? <LoadingState /> : null}
        {detailState.error ? <InlineMessage tone="error" message={`Không tải được chi tiết backend: ${detailState.error}`} /> : null}

        {payload ? (
          <dl className="mt-5 grid gap-3 md:grid-cols-2">
            {Object.entries(payload).map(([key, value]) => (
              <div key={key} className="rounded-lg bg-[#f8fafc] p-3">
                <dt className="font-mono text-xs font-bold text-[#505f76]">{key}</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-[#191b23]">{formatDetailValue(value)}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </aside>
    </div>
  );
}

function ApiBlocker({ message, onRetry, retrying }: { message: string; onRetry: () => void; retrying: boolean }) {
  return (
    <div className="border-b border-[#ffdbcd] bg-[#fff7ed] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <Icon name="error" className="text-[24px] text-[#9a3412]" />
          <div>
            <h3 className="font-bold text-[#191b23]">Chưa thể hiển thị dữ liệu thật</h3>
            <p className="mt-1 text-sm leading-6 text-[#505f76]">{message}</p>
          </div>
        </div>
        <button className="min-h-10 rounded-lg border border-[#ffdbcd] px-4 text-sm font-bold text-[#9a3412] hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#fed7aa] disabled:cursor-not-allowed disabled:opacity-50" disabled={retrying} onClick={onRetry} type="button">
          {retrying ? "Đang thử lại" : "Thử lại"}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ domain, canCreate, onCreate }: { domain: string; canCreate: boolean; onCreate: () => void }) {
  return (
    <div className="p-8 text-center">
      <Icon name="inbox" className="text-[36px] text-[#737686]" />
      <h3 className="mt-3 text-lg font-bold text-[#191b23]">Chưa có {domain.toLowerCase()}</h3>
      <p className="mx-auto mt-1 max-w-[52ch] text-sm text-[#505f76]">Backend trả danh sách rỗng. Bạn có thể tạo bản ghi mới nếu endpoint create đã sẵn sàng.</p>
      <button className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-4 text-sm font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff] disabled:cursor-not-allowed disabled:opacity-50" disabled={!canCreate} onClick={onCreate} type="button">
        <Icon name="add" className="text-[18px]" />
        Tạo mới
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="border-b border-[#e1e2ed] p-5" aria-live="polite">
      <div className="h-4 w-40 animate-pulse rounded bg-[#e1e2ed]" />
      <div className="mt-3 h-3 w-full max-w-md animate-pulse rounded bg-[#ededf9]" />
    </div>
  );
}

function InlineMessage({ tone, message }: { tone: "success" | "error"; message: string }) {
  const toneClass = tone === "success" ? "border-green-200 bg-green-50 text-[#166534]" : "border-[#ffdbcd] bg-[#fff7ed] text-[#9a3412]";
  return <p className={`m-5 rounded-lg border px-4 py-3 text-sm font-semibold ${toneClass}`} role={tone === "error" ? "alert" : "status"}>{message}</p>;
}

function StatusPill({ status }: { status: string }) {
  const warning = ["partial", "late", "pending", "Sắp hết", "Chờ gửi", "Bản nháp", "blocked"].some((item) => status.includes(item));
  const good = ["paid", "present", "open", "Đã", "Còn hàng", "Đang học", "served"].some((item) => status.includes(item));
  const tone = warning ? "bg-[#ffdbcd] text-[#9a3412]" : good ? "bg-green-50 text-[#166534]" : "bg-[#dbe1ff] text-[#004ac6]";

  return <span className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{status}</span>;
}

function buildInitialValues(fields: AdminFieldSpec[], record?: AdminManagementRecord): FormValues {
  return Object.fromEntries(
    fields.map((field) => {
      const rawValue = readPayloadValue(record?.raw, field.contractKey ?? field.key);
      if (field.type === "boolean") return [field.key, Boolean(rawValue)];
      if ((rawValue === undefined || rawValue === null || rawValue === "") && field.type === "select" && !field.required) {
        return [field.key, field.options?.[0] ?? ""];
      }
      return [field.key, rawValue === undefined || rawValue === null ? "" : String(rawValue)];
    }),
  );
}

function validateValues(fields: AdminFieldSpec[], values: FormValues) {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (!field.required) continue;
    const value = values[field.key];
    if (field.type === "boolean") continue;
    if (!String(value ?? "").trim()) {
      errors[field.key] = `Vui lòng nhập ${field.label.toLowerCase()}.`;
    }
  }
  return errors;
}

function normalizePayload(fields: AdminFieldSpec[], values: FormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const field of fields) {
    const key = field.contractKey ?? field.key;
    const value = values[field.key];

    if (field.type === "boolean") {
      payload[key] = Boolean(value);
      continue;
    }

    const text = String(value ?? "").trim();
    if (!text && !field.required) continue;
    payload[key] = field.type === "number" ? Number(text) : text;
  }

  return payload;
}

function readPayloadValue(payload: Record<string, unknown> | undefined, key: string) {
  if (!payload) return undefined;
  if (key in payload) return payload[key];
  return key.split(".").reduce<unknown>((current, part) => {
    if (typeof current !== "object" || current === null) return undefined;
    return (current as Record<string, unknown>)[part];
  }, payload);
}

function inputTypeFor(type: AdminFieldSpec["type"]) {
  if (type === "number") return "number";
  if (type === "date") return "date";
  if (type === "datetime") return "datetime-local";
  return "text";
}

function formatDetailValue(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Lỗi không xác định";
}
