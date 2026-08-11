"use client";

import dynamic from "next/dynamic";
import type { RouteOrder } from "./RouteCenter";

const RouteCenter = dynamic(() => import("./RouteCenter"), {
  ssr: false,
  loading: () => <section className="min-h-[520px] animate-pulse rounded-[20px] border border-slate-200 bg-slate-100" aria-label="Rota haritası yükleniyor" />,
});

export default function RouteCenterClient({ orders }: { orders: RouteOrder[] }) {
  return <RouteCenter orders={orders} />;
}
