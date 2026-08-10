import { notFound } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CustomerDetail from "@/features/customers/components/customer-detail";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { createCustomerService } from "@/features/customers/services/customer.service";
import { createAccountEntryService } from "@/features/customers/services/account-entry.service";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;

  async function loadCustomer() {
    const tenantId = await getCurrentTenantId();
    const customerService = createCustomerService();
    try {
      const customer = await customerService.getById(id, tenantId);
      const [orders, accountEntries] = await Promise.all([customerService.getOrderHistory(id, tenantId), createAccountEntryService().list(id, tenantId, { page: 1, pageSize: 10 })]);
      return { customer, orders, accountEntries: accountEntries.data };
    } catch {
      notFound();
    }
  }

  const { customer, orders, accountEntries } = await loadCustomer();
  return <DashboardLayout><CustomerDetail customer={customer} orders={orders} accountEntries={accountEntries} /></DashboardLayout>;
}
