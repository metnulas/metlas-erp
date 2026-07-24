import DashboardLayout from "@/components/layout/DashboardLayout";
import OrderList from "@/features/orders/components/order-list";
import { Suspense } from "react";
import Loading from "@/shared/components/loading";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Siparişler | METLAS ERP", description: "Siparişleri ve teslimat akışını yönetin" };

export default function OrdersPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<Loading message="Siparişler yükleniyor..." />}>
        <OrderList />
      </Suspense>
    </DashboardLayout>
  );
}
