import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

export function createPublicSession(session: Session, token: JWT): Session {
  if (token.account) session.user = { ...session.user, ...token.account };
  if (token.error) session.error = token.error;
  return session;
}
