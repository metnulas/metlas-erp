import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: { id: string; tenantId: string | null; role: string; permissions: string[]; permissionVersion: number; name?: string | null; email?: string | null };
  }
  interface User {
    tenantId: string | null;
    role: string;
    permissions: string[];
    permissionVersion: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    tenantId: string | null;
    role: string;
    permissions: string[];
    permissionVersion: number;
  }
}
