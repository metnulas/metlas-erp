"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users, Plus } from "lucide-react";
import DataTable from "@/shared/components/data-table";
import EmptyState from "@/shared/components/empty-state";
import CustomerFilters from "./customer-filters";
import { getCustomerColumns, type CustomerRow } from "./customer-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CustomerListData {
  data: Array<{
    id: string;
    customerCode: string;
    fullName: string;
    phone: string;
    email: string | null;
    city: string | null;
    district: string | null;
    balance: { toString(): string };
    depositBottleCount: number;
    emptyBottleCount: number;
    isActive: boolean;
    createdAt: string;
    partner: { id: string; name: string; code: string } | null;
  }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function CustomerList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 20);
  const search = searchParams.get("search") ?? "";
  const isActive = searchParams.get("isActive") ?? "";
  const sort = searchParams.get("sort") ?? "createdAt";
  const order = searchParams.get("order") ?? "desc";

  const [data, setData] = useState<CustomerListData | null>(null);
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
        if (isActive) params.set("isActive", isActive);

        const response = await fetch(`/api/customers?${params.toString()}`, {
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
  }, [page, pageSize, search, isActive, sort, order]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(newPage));
      router.push(`/customers?${params.toString()}`);
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
    if (isActive) params.set("isActive", isActive);

    try {
      const response = await fetch(`/api/customers?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch {
      // silent
    }
  }, [page, pageSize, search, isActive, sort, order]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Bu müşteriyi silmek istediğinizden emin misiniz?")) return;

      try {
        const response = await fetch(`/api/customers/${id}`, { method: "DELETE" });
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error?.message ?? "Silme başarısız");
        }

        toast.success("Müşteri silindi");
        fetchData();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Bilinmeyen hata";
        toast.error(message);
      }
    },
    [fetchData]
  );

  const columns = getCustomerColumns({ onDelete: handleDelete });

  const renderMobileCustomerCard = (customer: CustomerRow) => {
    const balance = Number(customer.balance);
    return (
      <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-xs text-muted-foreground">{customer.customerCode}</p>
            <Link href={`/customers/${customer.id}`} className="mt-1 block truncate text-base font-semibold hover:text-primary">
              {customer.fullName}
            </Link>
            <p className="mt-1 truncate text-sm text-muted-foreground">{customer.phone}</p>
            {customer.partner && <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">{customer.partner.name}</span>}
          </div>
          <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${customer.isActive ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
            {customer.isActive ? "Aktif" : "Pasif"}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-muted/40 p-3"><p className="text-[11px] text-muted-foreground">Bakiye</p><p className={`mt-1 truncate text-sm font-semibold ${balance > 0 ? "text-emerald-600" : balance < 0 ? "text-destructive" : ""}`}>{balance.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</p></div>
          <div className="rounded-xl bg-muted/40 p-3"><p className="text-[11px] text-muted-foreground">Konum</p><p className="mt-1 truncate text-sm font-semibold">{customer.city || customer.district || "-"}</p></div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="min-w-0 flex-1" size="sm" render={<Link href={`/customers/${customer.id}`} />}>Detay</Button>
          <Button className="min-w-0 flex-1" size="sm" variant="outline" render={<Link href={`/customers/${customer.id}/edit`} />}>Düzenle</Button>
          <Button size="icon-sm" variant="ghost" aria-label={`${customer.fullName} müşterisini sil`} onClick={() => handleDelete(customer.id)}><span aria-hidden="true">×</span></Button>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Müşteriler</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tüm müşterilerinizi buradan yönetin.
          </p>
        </div>
        <Button render={<Link href="/customers/new" />}>
          <Plus className="size-4" />
          Yeni Müşteri
        </Button>
      </div>

      <CustomerFilters search={search} isActive={isActive} />

      {data && data.data.length === 0 && !isLoading ? (
        <EmptyState
          icon={<Users className="size-8" />}
          title="Müşteri bulunamadı"
          description="Henüz müşteri eklenmemiş veya filtrelere uygun kayıt yok."
          action={
            <Button render={<Link href="/customers/new" />}>
              <Plus className="size-4" />
              Yeni Müşteri Ekle
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={(data?.data as CustomerRow[]) ?? []}
          isLoading={isLoading}
          searchKey="fullName"
          searchPlaceholder="İsim ile filtrele..."
          page={data?.page ?? 1}
          total={data?.total ?? 0}
          totalPages={data?.totalPages ?? 0}
          onPageChange={handlePageChange}
          renderMobileCard={renderMobileCustomerCard}
          emptyTitle="Müşteri bulunamadı"
          emptyDescription="Filtreleri değiştirmeyi deneyin."
        />
      )}
    </div>
  );
}
