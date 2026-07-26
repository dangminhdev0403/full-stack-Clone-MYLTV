const ID = /^[A-Za-z0-9_-]+$/;

export function resolveAdminEndpoint(resource: string, segments: string[], method: string): string {
  if (segments.some((segment) => !ID.test(segment))) throw new Error("Unsupported admin endpoint");
  const id = segments[0];
  if (resource === "users") {
    if (segments.length === 0 && ["GET", "POST"].includes(method)) return "/api/v1/users";
    if (segments.length === 1 && id && ["GET", "PATCH"].includes(method)) return `/api/v1/users/${id}`;
    if (segments.length === 2 && id && ["disable", "reset-password"].includes(segments[1]) && method === "POST") return `/api/v1/users/${id}/${segments[1]}`;
  }
  if (resource === "students") {
    if (segments.length === 0 && ["GET", "POST"].includes(method)) return "/api/v1/admin/students";
    if (segments.length === 1 && id && ["GET", "PATCH"].includes(method)) return `/api/v1/admin/students/${id}`;
    if (segments.length === 2 && id && segments[1] === "accounts" && method === "PUT") return `/api/v1/admin/students/${id}/accounts`;
  }
  if (resource === "attendance") {
    if (segments.length === 0 && ["GET", "POST"].includes(method)) return "/api/v1/admin/attendance";
    if (segments.length === 1 && id && ["GET", "PATCH"].includes(method)) return `/api/v1/admin/attendance/${id}`;
  }
  if (resource === "tuition") {
    if (segments.length === 0 && ["GET", "POST"].includes(method)) return "/api/v1/admin/tuition";
    if (segments.length === 1 && id && ["GET", "PATCH"].includes(method)) return `/api/v1/admin/tuition/${id}`;
  }
  if (resource === "news") {
    if (segments.length === 0 && ["GET", "POST"].includes(method)) return "/api/v1/admin/news";
    if (segments.length === 1 && id && ["GET", "PATCH", "DELETE"].includes(method)) return `/api/v1/admin/news/${id}`;
    if (segments.length === 2 && id && ["publish", "hide", "pin", "reorder"].includes(segments[1]) && method === "POST") return `/api/v1/admin/news/${id}/${segments[1]}`;
  }
  if (resource === "notifications") {
    if (segments.length === 0 && ["GET", "POST"].includes(method)) return "/api/v1/admin/notifications";
    if (segments.length === 1 && id && method === "GET") return `/api/v1/notifications/${id}`;
  }
  if (resource === "feedback") {
    if (segments.length === 0 && method === "GET") return "/api/v1/admin/feedback";
    if (segments.length === 1 && id && method === "PATCH") return `/api/v1/admin/feedback/${id}`;
  }
  if (resource === "events") {
    if (segments.length === 0 && ["GET", "POST"].includes(method)) return "/api/v1/admin/events";
    if (segments.length === 1 && id && ["GET", "PATCH", "DELETE"].includes(method)) return `/api/v1/admin/events/${id}`;
  }
  if (resource === "scores") {
    if (segments.length === 0 && method === "POST") return "/api/v1/admin/scores";
    if (segments.length === 1 && id === "reward-discipline" && method === "POST") return "/api/v1/admin/reward-discipline";
  }
  if (resource === "timetable" && segments.length === 0 && method === "POST") {
    return "/api/v1/admin/timetable";
  }
  if (resource === "homeworks" && segments.length === 0 && method === "POST") {
    return "/api/v1/admin/homeworks";
  }
  if (resource === "academic-context" && segments.length === 1 && segments[0] === "current" && method === "GET") {
    return "/api/v1/admin/academic-context/current";
  }
  throw new Error("Unsupported admin endpoint");
}
