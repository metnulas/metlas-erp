"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-destructive">Beklenmeyen hata</p>
        <h1 className="mt-2 text-2xl font-bold">Sayfa yüklenemedi</h1>
        <p className="mt-2 text-sm text-muted-foreground">İşlem tamamlanamadı. Tekrar deneyin.</p>
        <Button className="mt-6 w-full sm:w-auto" onClick={() => reset()}>Tekrar dene</Button>
      </section>
    </main>
  );
}
