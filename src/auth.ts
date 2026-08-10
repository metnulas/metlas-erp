import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth-password";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  cookies: {
    sessionToken: { name: "next-auth.session-token", options: { httpOnly: true, sameSite: "lax", path: "/", secure: false } },
    callbackUrl: { name: "next-auth.callback-url", options: { sameSite: "lax", path: "/", secure: false } },
    csrfToken: { name: "next-auth.csrf-token", options: { httpOnly: true, sameSite: "lax", path: "/", secure: false } },
  },
  providers: [CredentialsProvider({ name: "credentials", credentials: { email: { label: "E-posta", type: "email" }, password: { label: "Şifre", type: "password" } }, async authorize(credentials) {
    if (!credentials?.email || !credentials.password) return null;
    const user = await prisma.user.findUnique({ where: { email: String(credentials.email).trim().toLowerCase() } });
    const passwordMatches = user ? await verifyPassword(String(credentials.password), user.passwordHash) : false;
    if (!user || !user.isActive || !passwordMatches) return null;
    return { id: user.id, name: user.name, email: user.email, tenantId: user.tenantId, role: user.role };
  } })],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.userId = user.id; token.tenantId = user.tenantId; token.role = user.role; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { session.user.id = token.userId; session.user.tenantId = token.tenantId; session.user.role = token.role; }
      return session;
    },
  },
};
