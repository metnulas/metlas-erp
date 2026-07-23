import { notFound } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CustomerDetail from "@/features/customers/components/customer-detail";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { createCustomerService } from "@/features/customers/services/customer.service";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

async function CustomerContent({ id }: { id: string }) {
  const tenantId = await getCurrentTenantId();
  const customerService = createCustomerService();
  const customer = await customerService.getById(id, tenantId);

  return <CustomerDetail customer={customer} />;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;

  let exists = false;
  try {
    const tenantId = await getCurrentTenantId();
    const customerService = createCustomerService();
    await customerService.getById(id, tenantId);
    exists = true;
  } catch {
    notFound();
  }

  if (!exists) {
    notFound();
  }

  return (
    <DashboardLayout>
      <CustomerContent id={id} />
    </DashboardLayout>
  );
}
