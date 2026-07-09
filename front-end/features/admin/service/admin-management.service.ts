import { getFrontendEnvConfig } from "../../../config/env.config";
import { getAdminManagementSurfaceByDomain, listAdminManagementSurfaces } from "../data/admin-management.mock";
import type {
  AdminApiEnvelope,
  AdminManagementDomain,
  AdminManagementInventoryItem,
  AdminManagementListResponse,
  AdminManagementRecord,
  AdminManagementSurface,
} from "../types/admin-management.types";

const API_ORIGIN = getFrontendEnvConfig().apiBaseUrl;
const ADMIN_MANAGEMENT_API_BASE = "/api/v1/admin/management";
const REQUEST_TIMEOUT_MS = 5_000;
const DEFAULT_SUPPORTS = { list: false, detail: false, create: false, update: false };

// Admin management CRUD is not verified by code inspection alone. Valid verification includes a real frontend/browser CRUD flow: list/read -> create -> detail -> update -> backend state confirmation.

type AdminApiLogContext = {
  method: "GET" | "POST" | "PATCH";
  path: string;
  startedAt: number;
  status?: number;
  ok?: boolean;
  payloadKeys?: string[];
  error?: unknown;
};

type LoggedAdminApiError = Error & { adminApiLogged?: true };

export function getAdminManagementApiBase() {
  return `${API_ORIGIN}${ADMIN_MANAGEMENT_API_BASE}`;
}

export async function listAdminManagementCatalog() {
  const staticSurfaces = listAdminManagementSurfaces();

  try {
    const inventory = await fetchBackend<AdminManagementInventoryItem[]>(ADMIN_MANAGEMENT_API_BASE);
    const inventoryByDomain = new Map(inventory.map((item) => [item.domain, item]));

    return Promise.all(
      staticSurfaces.map(async (surface) => {
        const inventoryItem = inventoryByDomain.get(surface.domain);

        if (!inventoryItem?.supports?.list) {
          return toBlockedSurface(surface, "Backend inventory chưa khai báo list endpoint cho domain này.");
        }

        return loadSurfaceRecords(surface, inventoryItem.supports);
      }),
    );
  } catch (error) {
    const message = getErrorMessage(error);
    return staticSurfaces.map((surface) => toBlockedSurface(surface, `Không tải được inventory backend ${ADMIN_MANAGEMENT_API_BASE}: ${message}`));
  }
}

export async function getAdminManagementCatalogItem(domain: string) {
  const surface = getAdminManagementSurfaceByDomain(domain);
  if (!surface) return undefined;

  try {
    const inventory = await fetchBackend<AdminManagementInventoryItem[]>(ADMIN_MANAGEMENT_API_BASE);
    const inventoryItem = inventory.find((item) => item.domain === domain);

    if (!inventoryItem?.supports?.list) {
      return toBlockedSurface(surface, "Backend inventory chưa khai báo list endpoint cho domain này.");
    }

    return loadSurfaceRecords(surface, inventoryItem.supports);
  } catch (error) {
    return toBlockedSurface(surface, `Không tải được dữ liệu backend: ${getErrorMessage(error)}`);
  }
}

export async function getAdminManagementRecordDetail(domain: string, id: string) {
  return fetchBackend<Record<string, unknown>>(`${ADMIN_MANAGEMENT_API_BASE}/${domain}/${id}`);
}

export async function createAdminManagementRecord(domain: string, payload: Record<string, unknown>) {
  return mutateBackend<Record<string, unknown>>(`${ADMIN_MANAGEMENT_API_BASE}/${domain}`, "POST", payload);
}

export async function updateAdminManagementRecord(domain: string, id: string, payload: Record<string, unknown>) {
  return mutateBackend<Record<string, unknown>>(`${ADMIN_MANAGEMENT_API_BASE}/${domain}/${id}`, "PATCH", payload);
}

async function loadSurfaceRecords(surface: AdminManagementSurface, supports: NonNullable<AdminManagementSurface["supports"]>): Promise<AdminManagementSurface> {
  try {
    const payload = await fetchBackend<AdminManagementListResponse>(`${ADMIN_MANAGEMENT_API_BASE}/${surface.domain}?limit=20`);
    const items = Array.isArray(payload.items) ? payload.items : [];

    return {
      ...surface,
      supports,
      records: items.map((item) => mapBackendRecord(surface.domain, item)),
      pagination: payload.pagination,
      source: "backend",
      error: undefined,
    };
  } catch (error) {
    return toBlockedSurface(surface, `Endpoint ${ADMIN_MANAGEMENT_API_BASE}/${surface.domain} chưa sẵn sàng hoặc chưa kết nối DB: ${getErrorMessage(error)}`, supports);
  }
}

async function fetchBackend<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    const response = await fetch(`${API_ORIGIN}${path}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await response.text();
    const body = text ? (JSON.parse(text) as AdminApiEnvelope<T>) : undefined;
    if (!response.ok) {
      const responseError = new Error(body?.message ?? `HTTP ${response.status}`);
      logAdminApi({ method: "GET", path, startedAt, status: response.status, ok: response.ok, error: responseError });
      markAdminApiLogged(responseError);
      throw responseError;
    }

    logAdminApi({ method: "GET", path, startedAt, status: response.status, ok: response.ok });

    return (body?.data ?? body) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      const timeoutError = new Error(`timeout sau ${REQUEST_TIMEOUT_MS / 1000}s`);
      logAdminApi({ method: "GET", path, startedAt, error: timeoutError });
      throw timeoutError;
    }
    if (!isAdminApiLogged(error)) {
      logAdminApi({ method: "GET", path, startedAt, error });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function mutateBackend<T>(path: string, method: "POST" | "PATCH", payload: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const startedAt = Date.now();
  const payloadKeys = Object.keys(payload).sort();

  try {
    const response = await fetch(`${API_ORIGIN}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await response.text();
    const body = text ? (JSON.parse(text) as AdminApiEnvelope<T>) : undefined;
    if (!response.ok) {
      const responseError = new Error(body?.message ?? `HTTP ${response.status}`);
      logAdminApi({ method, path, startedAt, status: response.status, ok: response.ok, payloadKeys, error: responseError });
      markAdminApiLogged(responseError);
      throw responseError;
    }

    logAdminApi({ method, path, startedAt, status: response.status, ok: response.ok, payloadKeys });

    return (body?.data ?? body) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      const timeoutError = new Error(`timeout sau ${REQUEST_TIMEOUT_MS / 1000}s`);
      logAdminApi({ method, path, startedAt, payloadKeys, error: timeoutError });
      throw timeoutError;
    }
    if (!isAdminApiLogged(error)) {
      logAdminApi({ method, path, startedAt, payloadKeys, error });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function logAdminApi(context: AdminApiLogContext) {
  const durationMs = Date.now() - context.startedAt;
  const base = {
    scope: "admin-management-api",
    method: context.method,
    url: `${API_ORIGIN}${context.path}`,
    path: context.path,
    durationMs,
    status: context.status,
    ok: context.ok,
    payloadKeys: context.payloadKeys,
  };

  if (context.error) {
    emitAdminApiLog("error", "[admin-management-api] request failed", {
      ...base,
      error: getErrorMessage(context.error),
    });
    return;
  }

  emitAdminApiLog("info", "[admin-management-api] request completed", base);
}

function emitAdminApiLog(level: "info" | "error", message: string, fields: Record<string, unknown>) {
  if (typeof window === "undefined") {
    if (level === "error") {
      console.error(message, fields);
    } else {
      console.info(message, fields);
    }
    return;
  }

  const payload = JSON.stringify({ level, message, fields });
  const blob = new Blob([payload], { type: "application/json" });

  if (navigator.sendBeacon?.("/api/admin-management/log", blob)) {
    return;
  }

  void fetch("/api/admin-management/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

function toBlockedSurface(
  surface: AdminManagementSurface,
  error: string,
  supports: NonNullable<AdminManagementSurface["supports"]> = DEFAULT_SUPPORTS,
): AdminManagementSurface {
  return {
    ...surface,
    records: [],
    supports,
    source: "blocked",
    error,
  };
}

function mapBackendRecord(domain: AdminManagementDomain, item: Record<string, unknown>): AdminManagementRecord {
  const id = stringify(item.id) || "unknown";

  switch (domain) {
    case "students":
      return record(item, id, stringify(item.full_name) || stringify(item.code) || id, [stringify(item.class_name), stringify(item.school_name)].filter(Boolean).join(" · "), "Đang học", stringify(item.updated_at), "Phòng giáo vụ", [`Mã ${stringify(item.code) || "—"}`, `${numberLike(item.account_count)} tài khoản`]);
    case "news":
      return record(item, id, stringify(item.title) || id, stringify(item.summary), boolLabel(item.is_pinned, "Đang ghim", "Tin thường"), stringify(item.updated_at) || stringify(item.published_at), stringify(item.category) || "Truyền thông", [stringify(item.category) || "Chưa phân loại"]);
    case "notifications":
      return record(item, id, stringify(item.title) || id, stringify(item.content), stringify(item.tag) || "Thông báo", stringify(item.updated_at) || stringify(item.sent_at), stringify(item.sender) || "Hệ thống", [boolLabel(item.is_read, "Đã đọc", "Chưa đọc")]);
    case "attendance":
      return record(item, id, stringify(item.student_id) || id, [stringify(item.date), stringify(item.day_name), stringify(item.note)].filter(Boolean).join(" · "), stringify(item.status) || "unknown", stringify(item.date), "Giáo vụ", [stringify(item.morning_check_in) || stringify(item.arrived_at) || "—", stringify(item.afternoon_check_in) || stringify(item.left_at) || "—"]);
    case "tuition":
      return record(item, id, stringify(item.title) || id, `Còn lại ${formatMoney(item.remaining_amount)}`, stringify(item.status) || "unknown", stringify(item.due_date), stringify(item.student_id) || "Tài vụ", [formatMoney(item.amount), `Đã thu ${formatMoney(item.paid_amount)}`]);
    case "grades":
      return record(item, id, stringify(item.subject_name) || stringify(item.subject_id) || id, `HK${stringify(item.semester)} · ${stringify(item.school_year)}`, "Đã lưu", "", stringify(item.teacher_comment) || "Giáo viên", [`TB ${numberLike(item.average_score)}`, `Giữa kỳ ${numberLike(item.midterm_score)}`, `Cuối kỳ ${numberLike(item.final_score)}`]);
    case "timetable":
      return record(item, id, `${stringify(item.period)} · ${stringify(item.subject) || stringify(item.subject_id) || id}`, [stringify(item.day_code), stringify(item.time), stringify(item.room)].filter(Boolean).join(" · "), stringify(item.status) || "Đang áp dụng", stringify(item.date), stringify(item.teacher) || "Phòng đào tạo", [stringify(item.class_name) || "Chưa gán lớp"]);
    case "homeworks":
      return record(item, id, stringify(item.title) || id, [stringify(item.subject), stringify(item.deadline)].filter(Boolean).join(" · "), stringify(item.status) || "pending", stringify(item.assigned_at), stringify(item.teacher) || "Giáo viên", [stringify(item.content).slice(0, 80)]);
    case "meals":
      return record(item, id, `Thực đơn ${stringify(item.date) || id}`, [stringify(item.breakfast), stringify(item.lunch), stringify(item.snack)].filter(Boolean).join(" · "), stringify(item.status) || "unknown", stringify(item.date), "Bếp bán trú", [stringify(item.student_id) || "Tất cả học sinh"]);
    case "events":
      return record(item, id, stringify(item.title) || id, [stringify(item.start_at), stringify(item.location)].filter(Boolean).join(" · "), stringify(item.status) || "unknown", stringify(item.start_at), "Sự kiện", [stringify(item.registration_deadline) ? `Hạn ${stringify(item.registration_deadline)}` : "Chưa có hạn"]);
    case "surveys":
      return record(item, id, stringify(item.title) || id, stringify(item.description), stringify(item.deadline) ? "pending" : "draft", stringify(item.deadline), "Khảo sát", [`${Array.isArray(item.questions) ? item.questions.length : 0} câu hỏi`]);
    case "clubs":
      return record(item, id, stringify(item.name) || id, [stringify(item.schedule), stringify(item.location)].filter(Boolean).join(" · "), stringify(item.status) || "unknown", "", stringify(item.teacher) || "Phụ trách CLB", [formatMoney(item.fee)]);
    case "bus":
      return record(item, id, stringify(item.route_name) || id, [stringify(item.bus_plate), stringify(item.next_stop)].filter(Boolean).join(" · "), "Đang cấu hình", stringify(getNested(item.current_location, "updated_at")), stringify(item.driver_name) || "Điều phối xe", [stringify(item.estimated_arrival_time) || "Chưa có ETA"]);
    case "uniforms":
      return record(item, id, stringify(item.name) || id, stringify(item.category), numberLike(item.stock) === "0" ? "Sắp hết" : "Còn hàng", "", "Kho đồng phục", [formatMoney(item.price), `${numberLike(item.stock)} tồn`, Array.isArray(item.sizes) ? item.sizes.join("/") : ""]);
  }
}

function record(item: Record<string, unknown>, id: string, title: string, subtitle: string, status: string, updatedAt: string, owner: string, metrics: string[]): AdminManagementRecord {
  return {
    id,
    title: title || id,
    subtitle: subtitle || "Không có mô tả từ backend",
    status: status || "unknown",
    updatedAt: formatDate(updatedAt),
    owner: owner || "Chưa gán",
    metrics: metrics.filter(Boolean),
    raw: item,
  };
}

function stringify(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function numberLike(value: unknown) {
  return typeof value === "number" ? String(value) : stringify(value) || "0";
}

function formatMoney(value: unknown) {
  return typeof value === "number" ? `${value.toLocaleString("vi-VN")}đ` : stringify(value) || "0đ";
}

function boolLabel(value: unknown, yes: string, no: string) {
  return value === true ? yes : no;
}

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
}

function getNested(value: unknown, key: string) {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>)[key] : undefined;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Lỗi không xác định";
}

function markAdminApiLogged(error: Error) {
  (error as LoggedAdminApiError).adminApiLogged = true;
}

function isAdminApiLogged(error: unknown) {
  return error instanceof Error && (error as LoggedAdminApiError).adminApiLogged === true;
}
