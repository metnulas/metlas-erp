import DashboardLayout from "@/components/layout/DashboardLayout";
import { requirePermission } from "@/server/auth/authorization";
import { getRole, listPermissions } from "@/features/roles/services/role.service";
import RoleEditor from "@/features/roles/components/RoleEditor";

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermission("roles.manage");
  const { id } = await params;
  const [role, permissions] = await Promise.all([getRole(id, session.user.tenantId), listPermissions(session.user.tenantId)]);
  return <DashboardLayout><div className="space-y-6"><div><h1 className="text-3xl font-bold tracking-tight">Rol Düzenle</h1><p className="mt-2 text-sm text-muted-foreground">{role.name} rolünün permission setini yönetin.</p></div><RoleEditor role={role} permissions={permissions} /></div></DashboardLayout>;
}
