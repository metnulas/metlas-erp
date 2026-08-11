import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: { id: string; tenantId: string | null; role: string; permissions: string[]; permissionVersion: number; mustChangePassword: boolean; emailVerified: boolean; onboardingCompleted: boolean; subscriptionStatus: string | null; trialEndsAt: string | null; isGlobalAdmin: boolean; impersonatingTenantId: string | null; name?: string | null; email?: string | null };
  }
  interface User {
    tenantId: string | null;
    role: string;
    permissions: string[];
    permissionVersion: number;
    mustChangePassword: boolean;
    emailVerified: boolean;
    subscriptionStatus: string | null;
    trialEndsAt: string | null;
    onboardingCompleted: boolean;
    isGlobalAdmin: boolean;
    impersonatingTenantId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    tenantId: string | null;
    role: string;
    permissions: string[];
    permissionVersion: number;
    mustChangePassword: boolean;
    emailVerified: boolean;
    subscriptionStatus: string | null;
    trialEndsAt: string | null;
    onboardingCompleted: boolean;
    isGlobalAdmin: boolean;
    impersonatingTenantId: string | null;
  }
}
