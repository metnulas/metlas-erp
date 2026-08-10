import type { ReactNode } from "react";

type StatCardProps = { title: string; value: string; icon: ReactNode };

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-5 shadow-[0_18px_50px_-30px_black] transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_22px_60px_-28px_oklch(0.78_0.16_190_/_35%)] sm:p-6">
      <div className="absolute -right-8 -top-10 size-28 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />
      <div className="relative flex items-start justify-between gap-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</p><span className="grid size-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform duration-200 group-hover:rotate-6 group-hover:scale-105">{icon}</span></div>
      <h2 className="relative mt-6 text-3xl font-bold tracking-[-0.04em] text-card-foreground sm:text-4xl">{value}</h2>
      <p className="relative mt-2 text-xs text-muted-foreground">Canlı operasyon verisi</p>
    </article>
  );
}
