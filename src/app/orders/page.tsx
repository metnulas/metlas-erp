import DashboardLayout from "@/components/layout/DashboardLayout";
import OrderList from "@/features/orders/components/order-list";
import { Suspense } from "react";
import Loading from "@/shared/components/loading";

export default function OrdersPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<Loading message="Siparişler yükleniyor..." />}>
        <OrderList />
      </Suspense>
    </DashboardLayout>
  );
}
