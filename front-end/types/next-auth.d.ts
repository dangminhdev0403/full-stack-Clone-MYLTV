import type { DefaultSession } from "next-auth";
import type { AuthAccount } from "@/features/auth/service/auth-api";

declare module "next-auth" {
  interface Session {
    user: AuthAccount & DefaultSession["user"];
    error?: "RefreshAccessTokenError";
  }

  interface User {
    account: AuthAccount;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    account?: AuthAccount;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    error?: "RefreshAccessTokenError";
  }
}
