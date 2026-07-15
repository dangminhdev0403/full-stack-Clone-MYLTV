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
  throw new Error("Unsupported admin endpoint");
}
