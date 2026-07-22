"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import OrderForm from "@/features/orders/components/order-form";
import Loading from "@/shared/components/loading";
import { toast } from "sonner";
import type { Order, OrderItem } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type OrderWithItems = Order & { items: OrderItem[] };

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${params.id}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error?.message ?? "Sipariş bulunamadı");
        }

        setOrder(result.data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Bilinmeyen hata";
        toast.error(message);
        router.push("/orders");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading message="Sipariş yükleniyor..." />
      </DashboardLayout>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" render={<Link href={`/orders/${order.id}`} />}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Siparişi Düzenle</h1>
            <p className="text-sm text-muted-foreground">{order.orderCode} numaralı siparişi güncelleyin.</p>
          </div>
        </div>
        <OrderForm initialData={order} mode="edit" />
      </div>
    </DashboardLayout>
  );
}
