"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface CustomerFiltersProps {
  search: string;
  isActive: string;
}

export default function CustomerFilters({ search, isActive }: CustomerFiltersProps) {
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
      router.push(`/customers?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/customers");
  }, [router]);

  const hasFilters = search || isActive;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative max-w-xs flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Müşteri ara..."
          defaultValue={search}
          onChange={(e) => updateParam("search", e.target.value)}
          className="h-9 pl-9"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={isActive === "" || !isActive ? "default" : "outline"}
          size="sm"
          onClick={() => updateParam("isActive", "")}
        >
          Tümü
        </Button>
        <Button
          variant={isActive === "true" ? "default" : "outline"}
          size="sm"
          onClick={() => updateParam("isActive", "true")}
        >
          Aktif
        </Button>
        <Button
          variant={isActive === "false" ? "default" : "outline"}
          size="sm"
          onClick={() => updateParam("isActive", "false")}
        >
          Pasif
        </Button>
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
