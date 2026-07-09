export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export function ok<T>(data: T, message = 'OK'): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export type Pagination = {
  page: number;
  limit: number;
  total: number;
};

export function pagination(
  page: number,
  limit: number,
  total: number,
): Pagination {
  return { page, limit, total };
}
