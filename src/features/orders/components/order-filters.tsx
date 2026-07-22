"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

const statuses = [
  { value: "", label: "Tümü" },
  { value: "PENDING", label: "Beklemede" },
  { value: "CONFIRMED", label: "Onaylandı" },
  { value: "DELIVERING", label: "Teslimatta" },
  { value: "DELIVERED", label: "Teslim" },
  { value: "CANCELLED", label: "İptal" },
];

interface OrderFiltersProps {
  search: string;
  status: string;
}

export default function OrderFilters({ search, status }: OrderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set("page", "1");
      router.push(`/orders?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/orders");
  }, [router]);

  const hasFilters = search || status;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative max-w-xs flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Sipariş ara..."
          defaultValue={search}
          onChange={(e) => updateParam("search", e.target.value)}
          className="h-9 pl-9"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {statuses.map((s) => (
          <Button
            key={s.value}
            variant={status === s.value || (!status && s.value === "") ? "default" : "outline"}
            size="sm"
            onClick={() => updateParam("status", s.value)}
          >
            {s.label}
          </Button>
        ))}
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="size-4" />
          Temizle
        </Button>
      )}
    </div>
  );
}
