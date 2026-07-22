import type { Customer } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft, Phone, Mail, MapPin, Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CustomerDetailProps {
  customer: Customer;
}

export default function CustomerDetail({ customer }: CustomerDetailProps) {
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
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
