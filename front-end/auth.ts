import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { credentialsSchema, login, logout } from "@/features/auth/service/auth-api";
import { refreshAuthTokenSingleFlight, tokenNeedsRefresh } from "@/lib/auth/token-refresh";
import { createPublicSession } from "@/lib/auth/session-view";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { username: {}, password: { type: "password" } },
      async authorize(credentials) {
        const result = await login(credentialsSchema.parse(credentials));
        return {
          id: result.account.id,
          name: result.account.display_name,
          account: result.account,
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
          accessTokenExpiresAt: Date.now() + result.expires_in * 1000,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.account = user.account;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpiresAt = user.accessTokenExpiresAt;
        delete token.error;
        return token;
      }

      if (!tokenNeedsRefresh(token)) return token;
      return (await refreshAuthTokenSingleFlight(token)) ?? {
        ...token,
        accessToken: undefined,
        refreshToken: undefined,
        error: "RefreshAccessTokenError",
      };
    },
    session({ session, token }) {
      return createPublicSession(session, token);
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return new URL(url).origin === baseUrl ? url : `${baseUrl}/admin`;
    },
  },
  events: {
    async signOut(message) {
      if ("token" in message && message.token?.accessToken) {
        await logout(message.token.accessToken).catch(() => undefined);
      }
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
