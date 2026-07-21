import SalesChart from "@/components/dashboard/SalesChart";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Truck, Users, Wallet } from "lucide-react";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Bugünkü Sipariş" value="152" icon={<ShoppingCart size={36} />} />
        <StatCard title="Aktif Müşteri" value="1.284" icon={<Users size={36} />} />
        <StatCard title="Araç Sayısı" value="18" icon={<Truck size={36} />} />
        <StatCard title="Bugünkü Ciro" value="₺48.920" icon={<Wallet size={36} />} />
      </div>
      <section className="mt-8 rounded-2xl border bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold">Satış Grafiği</h2>
        <SalesChart />
        <div className="mt-6">
          <Button>Yeni sipariş</Button>
        </div>
      </section>
    </DashboardLayout>
  );
}
