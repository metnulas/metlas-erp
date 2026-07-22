import DashboardLayout from "@/components/layout/DashboardLayout";
import CustomerList from "@/features/customers/components/customer-list";
import { Suspense } from "react";
import Loading from "@/shared/components/loading";

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<Loading message="Müşteriler yükleniyor..." />}>
        <CustomerList />
      </Suspense>
    </DashboardLayout>
  );
}
