"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import CustomerForm from "@/features/customers/components/customer-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewCustomerPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" render={<Link href="/customers" />}>
              <ArrowLeft className="size-4" />
            </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Yeni Müşteri</h1>
            <p className="text-sm text-muted-foreground">Yeni bir müşteri kaydı oluşturun.</p>
          </div>
        </div>
        <CustomerForm mode="create" />
      </div>
    </DashboardLayout>
  );
}
