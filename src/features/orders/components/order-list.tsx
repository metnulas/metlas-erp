"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ReceiptText, Plus } from "lucide-react";
import DataTable from "@/shared/components/data-table";
import EmptyState from "@/shared/components/empty-state";
import OrderFilters from "./order-filters";
import { getOrderColumns, type OrderRow } from "./order-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/shared/constants/order-status";

interface OrderListData {
  data: OrderRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function OrderList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 20);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const sort = searchParams.get("sort") ?? "createdAt";
  const order = searchParams.get("order") ?? "desc";

  const [data, setData] = useState<OrderListData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function loadData() {
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));
        params.set("sort", sort);
        params.set("order", order);
        if (search) params.set("search", search);
        if (status) params.set("status", status);

        const response = await fetch(`/api/orders?${params.toString()}`, {
          signal: controller.signal,
        });
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error?.message ?? "Veri yüklenemedi");
        }

        setData(result.data);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        const message = error instanceof Error ? error.message : "Bilinmeyen hata";
        toast.error(message);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      controller.abort();
    };
  }, [page, pageSize, search, status, sort, order]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(newPage));
      router.push(`/orders?${params.toString()}`);
    },
    [router, searchParams]
  );

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    params.set("sort", sort);
    params.set("order", order);
    if (search) params.set("search", search);
    if (status) params.set("status", status);

    try {
      const response = await fetch(`/api/orders?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch {
      // silent
    }
  }, [page, pageSize, search, status, sort, order]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Bu siparişi silmek istediğinizden emin misiniz?")) return;

      try {
        const response = await fetch(`/api/orders/${id}`, { method: "DELETE" });
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error?.message ?? "Silme başarısız");
        }

        toast.success("Sipariş silindi");
        fetchData();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Bilinmeyen hata";
        toast.error(message);
      }
    },
    [fetchData]
  );

  const columns = getOrderColumns({ onDelete: handleDelete });
  const renderMobileOrderCard = (order: OrderRow) => {
    return (
      <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><Link href={`/orders/${order.id}`} className="block truncate font-mono text-sm font-semibold hover:text-primary">{order.orderCode}</Link><p className="mt-1 truncate text-sm text-muted-foreground">{order.customer.fullName}</p></div>
           <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${ORDER_STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground"}`}>{ORDER_STATUS_LABELS[order.status] ?? order.status}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-muted/40 p-3"><p className="text-[11px] text-muted-foreground">Sipariş tarihi</p><p className="mt-1 text-sm font-semibold">{new Date(order.orderDate).toLocaleDateString("tr-TR")}</p></div>
          <div className="rounded-xl bg-muted/40 p-3"><p className="text-[11px] text-muted-foreground">Genel toplam</p><p className="mt-1 truncate text-sm font-semibold text-primary">{Number(order.grandTotal).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</p></div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>{order.items.length} kalem</span><span>{order.customer.phone}</span></div>
        <div className="mt-4 flex gap-2"><Button className="min-w-0 flex-1" size="sm" render={<Link href={`/orders/${order.id}`} />}>Detay</Button><Button className="min-w-0 flex-1" size="sm" variant="outline" render={<Link href={`/orders/${order.id}/edit`} />}>Düzenle</Button><Button size="icon-sm" variant="ghost" aria-label={`${order.orderCode} siparişini sil`} onClick={() => handleDelete(order.id)}><span aria-hidden="true">×</span></Button></div>
      </article>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Siparişler</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tüm siparişlerinizi buradan yönetin.
          </p>
        </div>
        <Button render={<Link href="/orders/new" />}>
          <Plus className="size-4" />
          Yeni Sipariş
        </Button>
      </div>

      <OrderFilters search={search} status={status} />

      {data && data.data.length === 0 && !isLoading ? (
        <EmptyState
          icon={<ReceiptText className="size-8" />}
          title="Sipariş bulunamadı"
          description="Henüz sipariş eklenmemiş veya filtrelere uygun kayıt yok."
          action={
            <Button render={<Link href="/orders/new" />}>
              <Plus className="size-4" />
              Yeni Sipariş Oluştur
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={(data?.data as OrderRow[]) ?? []}
          isLoading={isLoading}
          searchKey="orderCode"
          searchPlaceholder="Kod ile filtrele..."
          page={data?.page ?? 1}
          total={data?.total ?? 0}
          totalPages={data?.totalPages ?? 0}
          onPageChange={handlePageChange}
          renderMobileCard={renderMobileOrderCard}
          emptyTitle="Sipariş bulunamadı"
          emptyDescription="Filtreleri değiştirmeyi deneyin."
        />
      )}
    </div>
  );
}
