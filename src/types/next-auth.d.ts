import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: { id: string; tenantId: string; role: string; name?: string | null; email?: string | null };
  }
  interface User {
    tenantId: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    tenantId: string;
    role: string;
  }
}
