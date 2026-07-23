import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth-password";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [CredentialsProvider({ name: "credentials", credentials: { email: { label: "E-posta", type: "email" }, password: { label: "Şifre", type: "password" } }, async authorize(credentials) {
    if (!credentials?.email || !credentials.password) return null;
    const user = await prisma.user.findUnique({ where: { email: String(credentials.email).trim().toLowerCase() } });
    if (!user || !user.isActive || !(await verifyPassword(String(credentials.password), user.passwordHash))) return null;
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
