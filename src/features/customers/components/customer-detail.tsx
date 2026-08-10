import type { Customer, CustomerAccountEntry } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft, Phone, Mail, MapPin, Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/shared/constants/order-status";
import type { CustomerOrderHistoryItem } from "../repositories/customer.repository";
import RepeatOrderButton from "./repeat-order-button";
import AccountEntryPanel from "./account-entry-panel";

interface CustomerDetailProps {
  customer: Customer;
  orders: CustomerOrderHistoryItem[];
  accountEntries: CustomerAccountEntry[];
}

export default function CustomerDetail({ customer, orders, accountEntries }: CustomerDetailProps) {
  const latestOrder = orders[0];
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" render={<Link href="/customers" />}>
              <ArrowLeft className="size-4" />
            </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{customer.fullName}</h1>
            <p className="text-sm text-muted-foreground">{customer.customerCode}</p>
          </div>
        </div>
        <Button render={<Link href={`/customers/${customer.id}/edit`} />}>
            <Pencil className="size-4" />
            Düzenle
          </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
        <RepeatOrderButton customerId={customer.id} items={(latestOrder?.items ?? []).map((item) => ({ productId: item.productId, productName: item.productName, quantity: item.quantity, unitPrice: Number(item.unitPrice), notes: item.notes }))} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <AccountEntryPanel customerId={customer.id} initialEntries={accountEntries} />
          <section className="rounded-xl border border-border/70 bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">İletişim Bilgileri</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="size-4 text-muted-foreground" />
                <span className="text-sm">{customer.phone}</span>
                {customer.phone2 && (
                  <span className="text-sm text-muted-foreground">/ {customer.phone2}</span>
                )}
              </div>
              {customer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="text-sm">{customer.email}</span>
                </div>
              )}
              {(customer.city || customer.district || customer.address) && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                  <div className="text-sm">
                    {customer.address && <p>{customer.address}</p>}
                    {(customer.city || customer.district) && (
                      <p className="text-muted-foreground">
                        {customer.district}{customer.district && customer.city ? ", " : ""}{customer.city}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border/70 bg-card p-6">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Sipariş Geçmişi</h2><p className="mt-1 text-sm text-muted-foreground">Son 50 sipariş</p></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{orders.length}</span></div>
            {orders.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">Bu müşteriye ait sipariş bulunmuyor.</p> : <div className="mt-4 divide-y divide-border/70">{orders.map((order) => <Link key={order.id} href={`/orders/${order.id}`} className="block py-3 transition-colors hover:text-primary"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-sm font-semibold">{order.orderCode}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(order.orderDate).toLocaleDateString("tr-TR")} · {order.items.length} kalem</p></div><div className="text-right"><span className={`rounded-full px-2 py-1 text-[11px] font-medium ${ORDER_STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground"}`}>{ORDER_STATUS_LABELS[order.status] ?? order.status}</span><p className="mt-1 text-sm font-semibold">{Number(order.grandTotal).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</p></div></div>{order.deliveryNotes && <p className="mt-2 text-xs text-muted-foreground">Teslimat notu: {order.deliveryNotes}</p>}</Link>)}</div>}
          </section>

          <section className="rounded-xl border border-border/70 bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Şişe Envanteri</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="size-4" />
                  <span className="text-sm">Depozito Şişe</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{customer.depositBottleCount}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="size-4" />
                  <span className="text-sm">Boş Şişe</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{customer.emptyBottleCount}</p>
              </div>
            </div>
          </section>

          {customer.notes && (
            <section className="rounded-xl border border-border/70 bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Notlar</h2>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{customer.notes}</p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-border/70 bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Finansal Özet</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Cari Bakiye</p>
                <p className={`text-2xl font-bold ${
                  Number(customer.balance) > 0
                    ? "text-emerald-600"
                    : Number(customer.balance) < 0
                      ? "text-red-500"
                      : ""
                }`}>
                  {Number(customer.balance).toLocaleString("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                  })}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Durum</p>
                <span
                  className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    customer.isActive
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                      : "bg-gray-50 text-gray-600 ring-1 ring-gray-500/20"
                  }`}
                >
                  {customer.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Kayıt Tarihi</p>
                <p className="mt-1 text-sm font-medium">
                  {new Date(customer.createdAt).toLocaleDateString("tr-TR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Son Güncelleme</p>
                <p className="mt-1 text-sm font-medium">
                  {new Date(customer.updatedAt).toLocaleDateString("tr-TR")}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
