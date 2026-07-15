import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry(failureCount, error) {
          const status = error && typeof error === "object" && "status" in error ? error.status : undefined;
          return status !== 401 && failureCount < 2;
        },
        staleTime: 30_000,
      },
      mutations: { retry: false },
    },
  });
}
