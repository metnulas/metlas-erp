"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CustomerForm from "@/features/customers/components/customer-form";
import Loading from "@/shared/components/loading";
import { toast } from "sonner";
import type { Customer } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const response = await fetch(`/api/customers/${params.id}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error?.message ?? "Müşteri bulunamadı");
        }

        setCustomer(result.data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Bilinmeyen hata";
        toast.error(message);
        router.push("/customers");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCustomer();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading message="Müşteri yükleniyor..." />
      </DashboardLayout>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" render={<Link href={`/customers/${customer.id}`} />}>
              <ArrowLeft className="size-4" />
            </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Müşteriyi Düzenle</h1>
            <p className="text-sm text-muted-foreground">{customer.fullName} bilgilerini güncelleyin.</p>
          </div>
        </div>
        <CustomerForm initialData={customer} mode="edit" />
      </div>
    </DashboardLayout>
  );
}
