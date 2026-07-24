"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-4">
      <p className="text-sm text-muted-foreground">Sayfa {page} / {totalPages}</p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Önceki sayfa"><ChevronLeft className="size-4" /> Önceki</Button>
        <Button size="sm" variant="outline" onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Sonraki sayfa">Sonraki <ChevronRight className="size-4" /></Button>
      </div>
    </div>
  );
}
