import type { ReactNode } from "react";

type StatCardProps = { title: string; value: string; icon: ReactNode };

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <article className="group rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
      <div className="flex items-start justify-between gap-4"><p className="text-sm font-medium text-muted-foreground">{title}</p><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">{icon}</span></div>
      <h2 className="mt-5 text-3xl font-bold tracking-tight text-card-foreground sm:text-4xl">{value}</h2>
      <p className="mt-2 text-xs text-muted-foreground">Güncel operasyon verisi</p>
    </article>
  );
}
