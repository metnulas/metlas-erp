import DashboardLayout from "@/components/layout/DashboardLayout";
import { requirePermission } from "@/server/auth/authorization";
import { listRoles } from "@/features/roles/services/role.service";
import UserCreateForm from "@/features/roles/components/UserCreateForm";

export default async function NewUserPage() {
  const session = await requirePermission("users.manage");
  const roles = session.user.tenantId ? await listRoles(session.user.tenantId) : [];
  return <DashboardLayout><div className="space-y-6"><div><h1 className="text-3xl font-bold tracking-tight">Yeni Kullanıcı</h1><p className="mt-2 text-sm text-muted-foreground">Kullanıcı hesabını oluşturun ve rollerini belirleyin.</p></div><UserCreateForm roles={roles} /></div></DashboardLayout>;
}
