import Link from "next/link";
import { AdminShell, Icon } from "./admin-shell";
import { AdminManagementCrudClient } from "./admin-management-crud-client";
import { getAdminManagementCatalogItem, getAdminManagementRecordDetail, listAdminManagementCatalog } from "../service/admin-management.service";
import type { AdminFieldSpec, AdminManagementSurface } from "../types/admin-management.types";

const domainLabels: Record<string, string> = {
  students: "Học sinh",
  news: "Tin tức",
  notifications: "Thông báo",
  attendance: "Chuyên cần",
  tuition: "Học phí",
  grades: "Sổ điểm",
  timetable: "Thời khóa biểu",
  homeworks: "Bài tập",
  meals: "Suất ăn",
  events: "Sự kiện",
  surveys: "Khảo sát",
  clubs: "CLB",
  bus: "Tuyến xe",
  uniforms: "Đồng phục",
};

export async function AdminManagementOverviewPage() {
  const surfaces = await listAdminManagementCatalog();
  const apiReadyCount = surfaces.filter((surface) => surface.source === "backend").length;
  const blockedCount = surfaces.length - apiReadyCount;
  const serviceSurfaceCount = surfaces.filter((surface) => surface.href.startsWith("/admin/services")).length;

  return (
    <AdminShell
      activeHref="/admin/management"
      title="Bản đồ CRUD quản trị"
      subtitle="Các bề mặt quản trị đọc inventory và dữ liệu thật từ /api/v1/admin/management. Auth/login không thuộc phạm vi màn hình này."
    >
      <section className="grid gap-5 md:grid-cols-3">
        <SummaryCard icon="dataset" label="Domain backend" value={String(surfaces.length)} note="Inventory /api/v1/admin/management" />
        <SummaryCard icon="cloud_done" label="Đang đọc API" value={String(apiReadyCount)} note="List endpoint trả dữ liệu thật" />
        <SummaryCard icon="error" label="Bị chặn" value={String(blockedCount)} note={`${serviceSurfaceCount} domain dịch vụ trong phạm vi ưu tiên`} />
      </section>

      <section className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#191b23]">Trạng thái tích hợp backend</h2>
            <p className="mt-2 max-w-[80ch] text-sm leading-6 text-[#505f76]">
              Frontend không render dữ liệu CRUD mẫu như dữ liệu thật. Mỗi domain gọi backend management inventory rồi gọi list endpoint tương ứng;
              nếu backend hoặc DB chưa sẵn sàng, màn hình hiển thị blocker cụ thể thay vì fallback về mock records.
            </p>
          </div>
          <span className="rounded-full bg-[#dbe1ff] px-3 py-1 text-xs font-bold text-[#004ac6]">API-backed</span>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {surfaces.map((surface) => (
          <SurfaceCard key={surface.domain} surface={surface} />
        ))}
      </section>
    </AdminShell>
  );
}

export async function AdminManagementDomainPage({ domain }: { domain: string }) {
  const surface = await getAdminManagementCatalogItem(domain);

  if (!surface) {
    return (
      <AdminShell activeHref="/admin/management" title="Chưa có domain" subtitle="Domain quản trị này chưa được khai báo trong service contract layer.">
        <Link className="inline-flex min-h-10 items-center rounded-lg bg-[#004ac6] px-4 text-sm font-bold text-white" href="/admin/management">
          Quay lại bản đồ CRUD
        </Link>
      </AdminShell>
    );
  }

  return (
    <AdminShell activeHref={surface.href} title={surface.title} subtitle={surface.description}>
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <AdminManagementCrudClient initialSurface={surface} />
        </div>

        <aside className="space-y-5">
          <section className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[#191b23]">API Android được cấp dữ liệu</h2>
            <div className="mt-4 space-y-3">
              {surface.androidEndpoints.map((endpoint) => (
                <div key={`${endpoint.method}-${endpoint.path}`} className="rounded-lg border border-[#e1e2ed] bg-[#f8fafc] p-3">
                  <p className="font-mono text-xs font-bold text-[#004ac6]">{endpoint.method} {endpoint.path}</p>
                  <p className="mt-1 text-sm text-[#505f76]">{endpoint.androidPurpose}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[#191b23]">Trường CRUD theo contract</h2>
            <div className="mt-4 space-y-2">
              {surface.fields.map((field) => (
                <FieldSpec key={field.key} field={field} />
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#ffdbcd] bg-[#fff7ed] p-5 shadow-sm">
            <Icon name="warning" className="text-[28px] text-[#9a3412]" />
            <h2 className="mt-3 text-lg font-bold text-[#191b23]">Phụ thuộc backend</h2>
            <p className="mt-2 text-sm leading-6 text-[#505f76]">{surface.error ?? surface.backendDependency}</p>
          </section>
        </aside>
      </section>
    </AdminShell>
  );
}

export async function AdminManagementRecordDetailPage({ domain, id }: { domain: string; id: string }) {
  const surface = await getAdminManagementCatalogItem(domain);

  if (!surface) {
    return (
      <AdminShell activeHref="/admin/management" title="Chưa có domain" subtitle="Domain quản trị này chưa được khai báo trong service contract layer.">
        <Link className="inline-flex min-h-10 items-center rounded-lg bg-[#004ac6] px-4 text-sm font-bold text-white" href="/admin/management">
          Quay lại bản đồ CRUD
        </Link>
      </AdminShell>
    );
  }

  let detail: Record<string, unknown> | undefined;
  let detailError = surface.error;

  if (surface.supports?.detail) {
    try {
      detail = await getAdminManagementRecordDetail(domain, id);
    } catch (error) {
      detailError = error instanceof Error ? error.message : "Không tải được chi tiết bản ghi";
    }
  }

  return (
    <AdminShell activeHref={surface.href} title={`Chi tiết ${surface.shortTitle}`} subtitle={`Bản ghi ${id} từ /api/v1/admin/management/${domain}/${id}`}>
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <article className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#505f76]">{domain}</p>
                <h2 className="mt-1 text-2xl font-bold text-[#191b23]">{id}</h2>
                <p className="mt-2 text-sm leading-6 text-[#505f76]">Chi tiết đọc trực tiếp từ backend; không fallback sang dữ liệu mock nếu endpoint/DB lỗi.</p>
              </div>
              <Link href={surface.href} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#c3c6d7] px-4 text-sm font-bold text-[#505f76] hover:bg-[#e1e2ed] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]">
                Quay lại danh sách
              </Link>
            </div>
          </article>

          {detailError ? <ApiBlocker message={`Endpoint chi tiết chưa sẵn sàng: ${detailError}`} /> : null}

          {detail ? (
            <article className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-[#191b23]">Payload backend</h2>
              <dl className="mt-5 grid gap-3 md:grid-cols-2">
                {Object.entries(detail).map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-[#f8fafc] p-3">
                    <dt className="font-mono text-xs font-bold text-[#505f76]">{key}</dt>
                    <dd className="mt-1 break-words text-sm font-semibold text-[#191b23]">{formatDetailValue(value)}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ) : null}
        </div>

        <aside className="space-y-5">
          <section className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[#191b23]">Trường cập nhật</h2>
            <div className="mt-4 space-y-2">
              {surface.fields.map((field) => (
                <FieldSpec key={field.key} field={field} />
              ))}
            </div>
          </section>
          <FormPreview title={`Cập nhật ${surface.shortTitle.toLowerCase()}`} icon="edit" fields={surface.fields} enabled={Boolean(surface.supports?.update && surface.source === "backend" && detail)} note="Có thể cập nhật từ danh sách bằng nút Sửa sau khi detail backend sẵn sàng." />
        </aside>
      </section>
    </AdminShell>
  );
}

function FormPreview({ title, icon, fields, enabled, note }: { title: string; icon: string; fields: AdminFieldSpec[]; enabled: boolean; note: string }) {
  return (
    <article className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#191b23]"><Icon name={icon} className="text-[22px] text-[#004ac6]" />{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#505f76]">{note}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${enabled ? "bg-green-50 text-[#166534]" : "bg-[#ededf9] text-[#505f76]"}`}>{enabled ? "API ready" : "Chưa bật"}</span>
      </div>
      <div className="grid gap-3">
        {fields.slice(0, 5).map((field) => (
          <label key={field.key} className="grid gap-1 text-sm font-semibold text-[#191b23]">
            <span>{field.label}{field.required ? " *" : ""}</span>
            <input className="h-10 rounded-lg border border-[#c3c6d7] bg-[#f8fafc] px-3 text-sm outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#b4c5ff] disabled:cursor-not-allowed disabled:opacity-60" placeholder={field.contractKey ?? field.key} disabled />
          </label>
        ))}
      </div>
    </article>
  );
}

function ApiBlocker({ message }: { message: string }) {
  return (
    <div className="border-b border-[#ffdbcd] bg-[#fff7ed] p-5">
      <div className="flex gap-3">
        <Icon name="error" className="text-[24px] text-[#9a3412]" />
        <div>
          <h3 className="font-bold text-[#191b23]">Chưa thể hiển thị dữ liệu thật</h3>
          <p className="mt-1 text-sm leading-6 text-[#505f76]">{message}</p>
        </div>
      </div>
    </div>
  );
}

function SurfaceCard({ surface }: { surface: AdminManagementSurface }) {
  return (
    <article className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-[#dbe1ff] text-[#004ac6]">
          <Icon name={surface.icon} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-[#191b23]">{surface.title}</h2>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${surface.source === "backend" ? "bg-green-50 text-[#166534]" : "bg-[#ffdbcd] text-[#9a3412]"}`}>{surface.source === "backend" ? "API" : "Blocked"}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-[#505f76]">{surface.error ?? surface.description}</p>
              {surface.pagination ? <p className="mt-1 text-xs text-[#737686]">Tổng backend: {surface.pagination.total}</p> : null}
            </div>
            <Link className="shrink-0 rounded-lg px-3 py-2 text-sm font-bold text-[#004ac6] hover:bg-[#dbe1ff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b4c5ff]" href={surface.href}>
              Mở CRUD
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {surface.androidEndpoints.map((endpoint) => (
              <span key={`${endpoint.method}-${endpoint.path}`} className="rounded-full bg-[#f8fafc] px-3 py-1 font-mono text-xs font-bold text-[#505f76]">
                {endpoint.method} {endpoint.path}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function FieldSpec({ field }: { field: AdminFieldSpec }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-[#f8fafc] p-3">
      <div>
        <p className="text-sm font-bold text-[#191b23]">{field.label}{field.required ? " *" : ""}</p>
        <p className="mt-1 font-mono text-xs text-[#505f76]">{field.contractKey ?? field.key}</p>
      </div>
      <span className="rounded bg-[#ededf9] px-2 py-1 text-xs font-bold text-[#505f76]">{field.type}</span>
    </div>
  );
}

function SummaryCard({ icon, label, value, note }: { icon: string; label: string; value: string; note: string }) {
  return (
    <article className="rounded-xl border border-[#c3c6d7] bg-white p-5 shadow-sm">
      <div className="mb-4 grid size-10 place-items-center rounded-lg bg-[#dbe1ff] text-[#004ac6]"><Icon name={icon} /></div>
      <p className="text-sm font-medium text-[#505f76]">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-[-0.02em] text-[#191b23]">{value}</p>
      <p className="mt-1 text-xs text-[#737686]">{note}</p>
    </article>
  );
}

function formatDetailValue(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export { domainLabels };
