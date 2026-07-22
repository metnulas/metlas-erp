import { getServerEnvironment } from "@/lib/env";

/**
 * Auth.js entegrasyonu tamamlanana kadar yalnızca yerel geliştirme tenant'ını döndürür.
 * Bu fonksiyon daha sonra oturumdaki tenant kimliğini okuyacak tek geçiş noktasıdır.
 */
export function getCurrentTenantId(): string {
  return getServerEnvironment().METLAS_DEFAULT_TENANT_ID;
}
