import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { AppError } from "@/server/errors/app-error";

/**
 * Auth.js entegrasyonu tamamlanana kadar yalnızca yerel geliştirme tenant'ını döndürür.
 * Bu fonksiyon daha sonra oturumdaki tenant kimliğini okuyacak tek geçiş noktasıdır.
 */
export async function getCurrentTenantId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (session?.user?.tenantId) return session.user.tenantId;
  throw new AppError("Oturum açmanız gerekiyor", 401, "UNAUTHENTICATED");
}
