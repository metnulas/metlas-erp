import DashboardLayout from "@/components/layout/DashboardLayout";
import { requirePermission } from "@/server/auth/authorization";
import { listPermissions } from "@/features/roles/services/role.service";
import RoleEditor from "@/features/roles/components/RoleEditor";

export default async function NewRolePage() {
  const session = await requirePermission("roles.manage");
  return <DashboardLayout><div className="space-y-6"><div><h1 className="text-3xl font-bold tracking-tight">Yeni Rol Oluştur</h1><p className="mt-2 text-sm text-muted-foreground">Rol bilgilerini ve kategori bazlı permission setini tanımlayın.</p></div><RoleEditor permissions={await listPermissions(session.user.tenantId)} /></div></DashboardLayout>;
}
