import Link from "next/link";
import { ShieldX } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return <DashboardLayout>
    <div className="grid min-h-[60vh] place-items-center rounded-2xl border border-border/70 bg-card p-8 text-center shadow-sm">
      <div>
        <ShieldX className="mx-auto size-12 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold">Erişim yetkiniz yok</h1>
        <p className="mt-2 text-sm text-muted-foreground">Bu sayfayı görüntülemek için gerekli role sahip değilsiniz.</p>
        <Button className="mt-6" render={<Link href="/" />}>Dashboard sayfasına dön</Button>
      </div>
    </div>
  </DashboardLayout>;
}
