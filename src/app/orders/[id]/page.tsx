import { notFound } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import OrderDetail from "@/features/orders/components/order-detail";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { createOrderService } from "@/features/orders/services/order.service";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

async function OrderContent({ id }: { id: string }) {
  const tenantId = getCurrentTenantId();
  const orderService = createOrderService();
  const order = await orderService.getById(id, tenantId);

  return <OrderDetail order={order} />;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  let exists = false;
  try {
    const tenantId = getCurrentTenantId();
    const orderService = createOrderService();
    await orderService.getById(id, tenantId);
    exists = true;
  } catch {
    notFound();
  }

  if (!exists) {
    notFound();
  }

  return (
    <DashboardLayout>
      <OrderContent id={id} />
    </DashboardLayout>
  );
}
