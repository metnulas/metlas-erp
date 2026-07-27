import { notFound } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CustomerDetail from "@/features/customers/components/customer-detail";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { createCustomerService } from "@/features/customers/services/customer.service";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;

  async function loadCustomer() {
    const tenantId = await getCurrentTenantId();
    const customerService = createCustomerService();
    try {
      return { customer: await customerService.getById(id, tenantId), orders: await customerService.getOrderHistory(id, tenantId) };
    } catch {
      notFound();
    }
  }

  const { customer, orders } = await loadCustomer();
  return <DashboardLayout><CustomerDetail customer={customer} orders={orders} /></DashboardLayout>;
}
