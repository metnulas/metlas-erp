import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth-password";
import { getPermissionSnapshot } from "@/server/auth/permission-resolver";
import { getServerEnvironment } from "@/lib/env";
import { recordAudit } from "@/server/audit/audit-log";

const secureCookies = process.env.NODE_ENV === "production";
const environment = getServerEnvironment();

export const authOptions: NextAuthOptions = {
  secret: environment.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60, updateAge: 24 * 60 * 60 },
  jwt: { maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  cookies: {
    sessionToken: { name: "next-auth.session-token", options: { httpOnly: true, sameSite: "lax", path: "/", secure: secureCookies } },
    callbackUrl: { name: "next-auth.callback-url", options: { sameSite: "lax", path: "/", secure: secureCookies } },
    csrfToken: { name: "next-auth.csrf-token", options: { httpOnly: true, sameSite: "lax", path: "/", secure: secureCookies } },
  },
  providers: [CredentialsProvider({ name: "credentials", credentials: { email: { label: "E-posta", type: "email" }, password: { label: "Şifre", type: "password" } }, async authorize(credentials) {
    if (!credentials?.email || !credentials.password) return null;
     const user = await prisma.user.findUnique({ where: { email: String(credentials.email).trim().toLowerCase() }, include: { tenant: { select: { isActive: true, subscriptionStatus: true, trialEndsAt: true, onboardingCompletedAt: true } } } });
    const passwordMatches = user ? await verifyPassword(String(credentials.password), user.passwordHash) : false;
     if (!user || !user.isActive || user.deletedAt || !passwordMatches || (user.tenantId && !user.tenant?.isActive)) return null;
     const snapshot = await getPermissionSnapshot(user.id, user.tenantId);
      return { id: user.id, name: user.name, email: user.email, tenantId: user.tenantId, role: user.role, permissions: snapshot.permissions, permissionVersion: snapshot.version, mustChangePassword: user.mustChangePassword, emailVerified: Boolean(user.emailVerifiedAt), onboardingCompleted: Boolean(user.tenant?.onboardingCompletedAt), subscriptionStatus: user.tenant?.subscriptionStatus ?? null, trialEndsAt: user.tenant?.trialEndsAt?.toISOString() ?? null, isGlobalAdmin: user.tenantId === null, impersonatingTenantId: null };
  } })],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
       if (user) { token.userId = user.id; token.tenantId = user.tenantId; token.role = user.role; token.permissions = user.permissions; token.permissionVersion = user.permissionVersion; token.mustChangePassword = user.mustChangePassword; token.emailVerified = Boolean(user.emailVerified); token.onboardingCompleted = user.onboardingCompleted; token.subscriptionStatus = user.subscriptionStatus; token.trialEndsAt = user.trialEndsAt; token.isGlobalAdmin = user.isGlobalAdmin; token.impersonatingTenantId = user.impersonatingTenantId; }
      else if (trigger === "update" && token.userId && token.isGlobalAdmin && session && "impersonatingTenantId" in session) {
        const requestedTenantId = typeof session.impersonatingTenantId === "string" ? session.impersonatingTenantId : null;
        const previousTenantId = typeof token.impersonatingTenantId === "string" ? token.impersonatingTenantId : null;
        if (requestedTenantId) {
          const tenant = await prisma.tenant.findFirst({ where: { id: requestedTenantId, isActive: true }, select: { id: true } });
          if (!tenant) return token;
        }
        token.tenantId = requestedTenantId;
        token.impersonatingTenantId = requestedTenantId;
        token.permissionVersion = 0;
        token.permissions = (await getPermissionSnapshot(token.userId, requestedTenantId)).permissions;
        await recordAudit({ tenantId: requestedTenantId ?? previousTenantId, actorId: token.userId, action: requestedTenantId ? "IMPERSONATION_START" : "IMPERSONATION_END", entityType: "Tenant", entityId: requestedTenantId ?? previousTenantId ?? "GLOBAL", metadata: { globalAdmin: true, previousTenantId, requestedTenantId } });
      }
      else if (token.userId) {
        const currentUser = await prisma.user.findUnique({ where: { id: token.userId }, select: { isActive: true, deletedAt: true, tenantId: true, permissionVersion: true, mustChangePassword: true, emailVerifiedAt: true, tenant: { select: { isActive: true, subscriptionStatus: true, trialEndsAt: true, onboardingCompletedAt: true } } } });
        const impersonatedTenant = token.isGlobalAdmin && token.tenantId
          ? await prisma.tenant.findUnique({ where: { id: token.tenantId }, select: { isActive: true } })
          : null;
        if (!currentUser?.isActive || currentUser.deletedAt || ((!token.isGlobalAdmin && currentUser.tenantId !== token.tenantId) || (token.isGlobalAdmin && currentUser.tenantId !== null)) || (!token.isGlobalAdmin && token.tenantId && !currentUser.tenant?.isActive) || (token.isGlobalAdmin && token.tenantId && !impersonatedTenant?.isActive)) return { ...token, userId: "", permissions: [], permissionVersion: 0 };
        if (currentUser.permissionVersion !== token.permissionVersion) {
          const snapshot = await getPermissionSnapshot(token.userId, token.tenantId ?? currentUser.tenantId);
          token.permissions = snapshot.permissions;
          token.permissionVersion = snapshot.version;
        }
        token.mustChangePassword = currentUser.mustChangePassword;
        token.emailVerified = Boolean(currentUser.emailVerifiedAt);
        token.onboardingCompleted = Boolean(currentUser.tenant?.onboardingCompletedAt);
        token.subscriptionStatus = currentUser.tenant?.subscriptionStatus ?? null;
        token.trialEndsAt = currentUser.tenant?.trialEndsAt?.toISOString() ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { session.user.id = token.userId; session.user.tenantId = token.tenantId; session.user.role = token.role; session.user.permissions = token.permissions ?? []; session.user.permissionVersion = token.permissionVersion ?? 0; session.user.mustChangePassword = token.mustChangePassword ?? false; session.user.emailVerified = token.emailVerified ?? false; session.user.onboardingCompleted = token.onboardingCompleted ?? false; session.user.subscriptionStatus = token.subscriptionStatus ?? null; session.user.trialEndsAt = token.trialEndsAt ?? null; session.user.isGlobalAdmin = token.isGlobalAdmin ?? false; session.user.impersonatingTenantId = token.impersonatingTenantId ?? null; }
      return session;
    },
  },
};
