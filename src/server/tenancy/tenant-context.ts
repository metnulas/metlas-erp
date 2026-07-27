import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { AppError } from "@/server/errors/app-error";

/** Returns the tenant from the authenticated session as the single tenancy entry point. */
export async function getCurrentTenantId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (session?.user?.tenantId) return session.user.tenantId;
  throw new AppError("Oturum açmanız gerekiyor", 401, "UNAUTHENTICATED");
}
