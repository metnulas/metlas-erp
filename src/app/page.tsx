import SalesChart from "@/components/dashboard/SalesChart";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Plus, ShoppingCart, Truck, Users, Wallet } from "lucide-react";

export default function Home() {
  return (
    <DashboardLayout>
      <section className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-1 text-sm font-medium text-primary">22 Temmuz 2026, Çarşamba</p><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Operasyon özeti</h1><p className="mt-1 text-sm text-muted-foreground">İşletmenizin güncel performansını buradan takip edin.</p></div><Button className="h-10 px-4" size="lg"><Plus /> Yeni sipariş</Button></section>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4"><StatCard title="Bugünkü Sipariş" value="152" icon={<ShoppingCart size={22} />} /><StatCard title="Aktif Müşteri" value="1.284" icon={<Users size={22} />} /><StatCard title="Araç Sayısı" value="18" icon={<Truck size={22} />} /><StatCard title="Bugünkü Ciro" value="₺48.920" icon={<Wallet size={22} />} /></div>
      <section className="mt-6 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:mt-8 sm:p-6 lg:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-muted-foreground">Haftalık görünüm</p><h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Satış grafiği</h2></div><Button size="sm" variant="outline">Detaylar <ArrowUpRight /></Button></div><SalesChart /></section>
    </DashboardLayout>
  );
}
