import type { Order, OrderItem, Customer } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft, Package, Calendar, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import DeliveryAssignment from "@/features/deliveries/components/delivery-assignment";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/shared/constants/order-status";

interface OrderDetailProps {
  order: Order & { items: OrderItem[]; customer: Pick<Customer, "id" | "fullName" | "phone">; vehicle: { id: string; plate: string; code: string; type: string } | null; personnel: { id: string; fullName: string; employeeCode: string; phone: string } | null };
}

export default function OrderDetail({ order }: OrderDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" render={<Link href="/orders" />}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{order.orderCode}</h1>
            <p className="text-sm text-muted-foreground">{order.customer.fullName}</p>
          </div>
        </div>
        <Button render={<Link href={`/orders/${order.id}/edit`} />}>
          <Pencil className="size-4" />
          Düzenle
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-border/70 bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Sipariş Bilgileri</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Sipariş Kodu</p>
                <p className="font-mono font-medium">{order.orderCode}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Durum</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_STYLES[order.status] ?? ""}`}>
                  {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-4" />
                  <p className="text-sm">Sipariş Tarihi</p>
                </div>
                <p className="text-sm font-medium">{new Date(order.orderDate).toLocaleDateString("tr-TR")}</p>
              </div>
              {order.deliveryDate && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4" />
                    <p className="text-sm">Teslim Tarihi</p>
                  </div>
                  <p className="text-sm font-medium">{new Date(order.deliveryDate).toLocaleDateString("tr-TR")}</p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border/70 bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Sipariş Ürünleri</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <Package className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x {Number(item.unitPrice).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-sm">
                    {Number(item.total).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {order.notes && (
            <section className="rounded-xl border border-border/70 bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                <FileText className="size-5" />
                Notlar
              </h2>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{order.notes}</p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-border/70 bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Müşteri Bilgisi</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Ad Soyad</p>
                <Link href={`/customers/${order.customer.id}`} className="text-sm font-medium text-primary hover:underline">
                  {order.customer.fullName}
                </Link>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefon</p>
                <p className="text-sm font-medium">{order.customer.phone}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border/70 bg-card p-6">
            <DeliveryAssignment
              orderId={order.id}
              initialVehicleId={order.vehicle?.id}
              initialPersonnelId={order.personnel?.id}
              initialDate={order.deliveryDate}
              initialNotes={order.deliveryNotes}
              initialStatus={order.status}
            />
          </section>

          <section className="rounded-xl border border-border/70 bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Finansal Özet</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Ara Toplam</p>
                <p className="text-sm font-medium">
                  {Number(order.totalAmount).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                </p>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">İndirim</p>
                  <p className="text-sm font-medium text-red-500">
                    -{Number(order.discount).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                  </p>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <p className="text-sm font-semibold">Genel Toplam</p>
                <p className="text-lg font-bold text-primary">
                  {Number(order.grandTotal).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Oluşturma</p>
                <p className="mt-1 text-sm font-medium">
                  {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Son Güncelleme</p>
                <p className="mt-1 text-sm font-medium">
                  {new Date(order.updatedAt).toLocaleDateString("tr-TR")}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
