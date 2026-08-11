import DashboardLayout from "@/components/layout/DashboardLayout";
import ChangePasswordForm from "./change-password-form";

export default function ChangePasswordPage() {
  return <DashboardLayout><div className="mx-auto max-w-xl space-y-6"><div><h1 className="text-3xl font-bold tracking-tight">Şifrenizi güncelleyin</h1><p className="mt-2 text-sm text-muted-foreground">Güvenliğiniz için platformu kullanmadan önce yeni bir şifre belirleyin.</p></div><ChangePasswordForm /></div></DashboardLayout>;
}
