export type AdminManagementDomain =
  | "students"
  | "news"
  | "notifications"
  | "attendance"
  | "tuition"
  | "grades"
  | "timetable"
  | "homeworks"
  | "meals"
  | "events"
  | "surveys"
  | "clubs"
  | "bus"
  | "uniforms";

export type AdminCrudAction = "create" | "read" | "update" | "delete" | "publish" | "sync";

export type AdminContractEndpoint = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  androidPurpose: string;
};

export type AdminFieldSpec = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "datetime" | "boolean" | "select" | "textarea";
  required?: boolean;
  options?: string[];
  contractKey?: string;
};

export type AdminManagementRecord = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  updatedAt: string;
  owner: string;
  metrics: string[];
  raw?: Record<string, unknown>;
};

export type AdminManagementSurface = {
  domain: AdminManagementDomain;
  title: string;
  shortTitle: string;
  href: string;
  icon: string;
  description: string;
  androidEndpoints: AdminContractEndpoint[];
  backendDependency: string;
  crudActions: AdminCrudAction[];
  fields: AdminFieldSpec[];
  records: AdminManagementRecord[];
  supports?: {
    list: boolean;
    detail: boolean;
    create: boolean;
    update: boolean;
  };
  source?: "backend" | "blocked";
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
};

export type AdminManagementInventoryItem = {
  domain: AdminManagementDomain;
  androidEndpoints: string[];
  basePath: string;
  supports: AdminManagementSurface["supports"];
};

export type AdminManagementListResponse = {
  items?: Record<string, unknown>[];
  pagination?: AdminManagementSurface["pagination"];
};

export type AdminApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};
