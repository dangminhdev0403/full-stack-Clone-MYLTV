"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { useState } from "react";

export function useLogout() {
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await clearClientStateAndSignOut(queryClient);
  }

  return { logout, isLoggingOut };
}

export async function clearClientStateAndSignOut(queryClient: QueryClient) {
  await queryClient.cancelQueries();
  queryClient.clear();
  await signOut({ callbackUrl: "/login" });
}
