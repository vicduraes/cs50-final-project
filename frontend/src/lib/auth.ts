import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Mesma duração do JWT da API (JWT_EXPIRE_MINUTES = 7 dias)
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, account }) {
      // `account` só vem preenchido no momento do login
      if (account?.id_token) {
        try {
          const res = await fetch(`${API_URL}/auth/callback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: account.id_token }),
            cache: "no-store",
          });
          if (!res.ok) throw new Error(`API respondeu ${res.status}`);
          const data = await res.json();
          token.apiToken = data.access_token;
          token.apiTokenExpiresAt = Date.now() + data.expires_in * 1000;
          token.userId = data.user.id;
          delete token.error;
        } catch {
          token.error = "ApiAuthFailed";
        }
      }
      if (token.apiTokenExpiresAt && Date.now() > token.apiTokenExpiresAt) {
        token.error = "TokenExpired";
      }
      return token;
    },
    async session({ session, token }) {
      session.apiToken = token.apiToken;
      session.error = token.error;
      if (session.user) session.user.id = token.userId;
      return session;
    },
  },
};