"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

type SearchResult = { tenants: { id: string; name: string; slug: string }[]; users: { id: string; name: string; email: string; tenant: { id: string; name: string } | null }[]; orders: { id: string; orderCode: string; status: string; grandTotal: number; tenant: { id: string; name: string }; customer: { fullName: string; phone: string } }[]; customers: { id: string; customerCode: string; fullName: string; phone: string; tenant: { id: string; name: string } }[] };

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  useEffect(() => {
    if (query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const response = await fetch(`/api/platform/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
      if (response.ok) setResults((await response.json()).data);
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);
  const hasResults = results && Object.values(results).some((items) => items.length > 0);
  function changeQuery(value: string) { setQuery(value); if (value.trim().length < 2) setResults(null); }
  return <div className="relative hidden max-w-xl flex-1 sm:block"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Global arama" className="h-11 rounded-xl border-slate-200/70 bg-slate-100/75 pl-10 shadow-none transition-all placeholder:text-slate-400 focus-visible:border-blue-500/60 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-500/10" placeholder="Tenant, kullanıcı, sipariş, müşteri veya telefon ara..." value={query} onChange={(event) => changeQuery(event.target.value)} />{hasResults && <div className="absolute inset-x-0 top-14 z-50 max-h-[28rem] overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-xl"><section>{results.tenants.map((item) => <Link key={item.id} href="/platform" className="block rounded-xl px-3 py-2 hover:bg-muted"><span className="text-xs text-primary">Tenant</span><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.slug}</p></Link>)}</section>{results.users.map((item) => <Link key={item.id} href="/platform" className="block rounded-xl px-3 py-2 hover:bg-muted"><span className="text-xs text-primary">Kullanıcı</span><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.email} · {item.tenant?.name ?? "Global"}</p></Link>)}{results.orders.map((item) => <Link key={item.id} href="/platform" className="block rounded-xl px-3 py-2 hover:bg-muted"><span className="text-xs text-primary">Sipariş</span><p className="text-sm font-medium">{item.orderCode} · {item.customer.fullName}</p><p className="text-xs text-muted-foreground">{item.tenant.name} · {item.grandTotal.toLocaleString("tr-TR")} TL</p></Link>)}{results.customers.map((item) => <Link key={item.id} href="/platform" className="block rounded-xl px-3 py-2 hover:bg-muted"><span className="text-xs text-primary">Müşteri</span><p className="text-sm font-medium">{item.fullName}</p><p className="text-xs text-muted-foreground">{item.customerCode} · {item.phone} · {item.tenant.name}</p></Link>)}</div>}</div>;
}
