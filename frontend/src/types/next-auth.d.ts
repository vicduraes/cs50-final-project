import type { DefaultSession } from "next-auth";

type AuthError = "ApiAuthFailed" | "TokenExpired";

declare module "next-auth" {
  interface Session {
    apiToken?: string;
    error?: AuthError;
    user: { id?: string } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    apiToken?: string;
    apiTokenExpiresAt?: number;
    userId?: string;
    error?: AuthError;
  }
}