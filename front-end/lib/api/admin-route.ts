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
    if (segments.length === 2 && id && segments[1] === "attendance" && method === "GET") return `/api/v1/admin/students/${id}/attendance`;
    if (segments.length === 2 && id && segments[1] === "scores" && method === "GET") return `/api/v1/admin/students/${id}/scores`;
    if (segments.length === 2 && id && segments[1] === "bus-route" && method === "GET") return `/api/v1/admin/students/${id}/bus-route`;
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
    if (segments.length === 1 && id && ["GET", "PATCH"].includes(method)) return `/api/v1/admin/notifications/${id}`;
  }
  if (resource === "feedback") {
    if (segments.length === 0 && method === "GET") return "/api/v1/admin/feedback";
    if (segments.length === 1 && id && ["GET", "PATCH"].includes(method)) return `/api/v1/admin/feedback/${id}`;
  }
  if (resource === "events") {
    if (segments.length === 0 && ["GET", "POST"].includes(method)) return "/api/v1/admin/events";
    if (segments.length === 1 && id && ["GET", "PATCH", "DELETE"].includes(method)) return `/api/v1/admin/events/${id}`;
  }
  if (resource === "scores") {
    if (segments.length === 0 && ["GET", "POST"].includes(method)) return "/api/v1/admin/scores";
    if (segments.length === 1 && id === "reward-discipline" && method === "POST") return "/api/v1/admin/reward-discipline";
  }
  if (resource === "timetable" && segments.length === 0 && ["GET", "POST"].includes(method)) {
    return "/api/v1/admin/timetable";
  }
  if (resource === "audit-logs" && segments.length === 0 && method === "GET") {
    return "/api/v1/admin/audit-logs";
  }
  if (resource === "homeworks") {
    if (segments.length === 0 && ["GET", "POST"].includes(method)) return "/api/v1/admin/homeworks";
    if (segments.length === 1 && id && ["GET", "PATCH"].includes(method)) return `/api/v1/admin/homeworks/${id}`;
    if (segments.length === 2 && id && segments[1] === "archive" && method === "POST") return `/api/v1/admin/homeworks/${id}/archive`;
  }
  if (resource === "academic-context") {
    if (segments.length === 1 && segments[0] === "current" && method === "GET") {
      return "/api/v1/admin/academic-context/current";
    }
    if (segments.length === 1 && segments[0] === "years" && ["GET", "POST"].includes(method)) {
      return "/api/v1/admin/academic-context/years";
    }
    if (segments.length === 2 && segments[0] === "years" && ["PUT", "PATCH"].includes(method)) {
      return `/api/v1/admin/academic-context/years/${segments[1]}`;
    }
    if (segments.length === 3 && segments[0] === "years" && segments[2] === "set-current" && ["POST", "PUT"].includes(method)) {
      return `/api/v1/admin/academic-context/years/${segments[1]}/set-current`;
    }
    if (segments.length === 1 && segments[0] === "semesters" && ["GET", "POST"].includes(method)) {
      return "/api/v1/admin/academic-context/semesters";
    }
    if (segments.length === 2 && segments[0] === "semesters" && ["PUT", "PATCH"].includes(method)) {
      return `/api/v1/admin/academic-context/semesters/${segments[1]}`;
    }
    if (segments.length === 3 && segments[0] === "semesters" && segments[2] === "set-current" && ["POST", "PUT"].includes(method)) {
      return `/api/v1/admin/academic-context/semesters/${segments[1]}/set-current`;
    }
  }
  if (resource === "academic-structure") {
    if (segments.length === 1 && segments[0] === "grade-levels" && ["GET", "POST"].includes(method)) {
      return "/api/v1/admin/academic-structure/grade-levels";
    }
    if (segments.length === 2 && segments[0] === "grade-levels" && ["PUT", "PATCH"].includes(method)) {
      return `/api/v1/admin/academic-structure/grade-levels/${segments[1]}`;
    }
    if (segments.length === 1 && segments[0] === "classes" && ["GET", "POST"].includes(method)) {
      return "/api/v1/admin/academic-structure/classes";
    }
    if (segments.length === 2 && segments[0] === "classes" && ["PUT", "PATCH"].includes(method)) {
      return `/api/v1/admin/academic-structure/classes/${segments[1]}`;
    }
    if (segments.length === 3 && segments[0] === "classes" && segments[2] === "roster" && method === "GET") {
      return `/api/v1/admin/academic-structure/classes/${segments[1]}/roster`;
    }
    if (segments.length === 3 && segments[0] === "classes" && segments[2] === "enrollments" && method === "POST") {
      return `/api/v1/admin/academic-structure/classes/${segments[1]}/enrollments`;
    }
    if (segments.length === 5 && segments[0] === "classes" && segments[2] === "enrollments" && segments[4] === "deactivate" && method === "POST") {
      return `/api/v1/admin/academic-structure/classes/${segments[1]}/enrollments/${segments[3]}/deactivate`;
    }
    if (segments.length === 1 && segments[0] === "transfers" && method === "POST") {
      return "/api/v1/admin/academic-structure/transfers";
    }
    if (segments.length === 1 && segments[0] === "promotions" && method === "POST") {
      return "/api/v1/admin/academic-structure/promotions";
    }
  }
  if (resource === "roles") {
    if (segments.length === 0 && ["GET", "POST"].includes(method)) return "/api/v1/admin/roles";
    if (segments.length === 1 && id && ["GET", "PATCH"].includes(method)) return `/api/v1/admin/roles/${id}`;
    if (segments.length === 2 && id && segments[1] === "status" && method === "PATCH") return `/api/v1/admin/roles/${id}/status`;
    if (segments.length === 2 && id && segments[1] === "permissions" && method === "PUT") return `/api/v1/admin/roles/${id}/permissions`;
  }
  if (resource === "accounts") {
    if (segments.length === 2 && id && segments[1] === "roles" && method === "PUT") return `/api/v1/admin/accounts/${id}/roles`;
  }
  if (resource === "services") {
    if (segments.length === 1 && segments[0] === "meals" && method === "GET") return "/api/v1/services/meals";
    if (segments.length === 2 && segments[0] === "meals" && segments[1] === "register" && method === "POST") return "/api/v1/services/meals/register";
    if (segments.length === 1 && segments[0] === "bus" && method === "GET") return "/api/v1/services/bus-tracking";
    if (segments.length === 1 && segments[0] === "clubs" && method === "GET") return "/api/v1/services/clubs";
    if (segments.length === 3 && segments[0] === "clubs" && segments[2] === "register" && method === "POST") return `/api/v1/services/clubs/${segments[1]}/register`;
    if (segments.length === 1 && segments[0] === "surveys" && method === "GET") return "/api/v1/services/surveys";
    if (segments.length === 3 && segments[0] === "surveys" && segments[2] === "submit" && method === "POST") return `/api/v1/services/surveys/${segments[1]}/submit`;
    if (segments.length === 1 && segments[0] === "uniforms" && method === "GET") return "/api/v1/services/uniforms";
    if (segments.length === 2 && segments[0] === "uniforms" && segments[1] === "orders" && method === "POST") return "/api/v1/services/uniforms/orders";
  }
  throw new Error("Unsupported admin endpoint");
}
