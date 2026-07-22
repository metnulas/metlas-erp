"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import OrderForm from "@/features/orders/components/order-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewOrderPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" render={<Link href="/orders" />}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Yeni Sipariş</h1>
            <p className="text-sm text-muted-foreground">Yeni bir sipariş kaydı oluşturun.</p>
          </div>
        </div>
        <OrderForm mode="create" />
      </div>
    </DashboardLayout>
  );
}
