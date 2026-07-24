"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/shared/constants/order-status";

export interface OrderRow {
  id: string;
  orderCode: string;
  customer: { id: string; fullName: string; phone: string };
  orderDate: string;
  deliveryDate: string | null;
  status: string;
  totalAmount: number;
  discount: number;
  grandTotal: number;
  notes: string | null;
  items: Array<{ id: string; productName: string; quantity: number; unitPrice: number; total: number }>;
  createdAt: string;
}

interface OrderTableColumnsProps {
  onDelete: (id: string) => void;
}

export function getOrderColumns({ onDelete }: OrderTableColumnsProps): ColumnDef<OrderRow>[] {
  return [
    {
      accessorKey: "orderCode",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sipariş Kodu
          <ArrowUpDown className="ml-2 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.getValue("orderCode")}</span>
      ),
    },
    {
      accessorKey: "customer",
      header: "Müşteri",
      cell: ({ row }) => {
        const customer = row.original.customer;
        return (
          <div>
            <p className="font-medium">{customer.fullName}</p>
            <p className="text-xs text-muted-foreground">{customer.phone}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "orderDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tarih
          <ArrowUpDown className="ml-2 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm">{new Date(row.getValue("orderDate")).toLocaleDateString("tr-TR")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Durum",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_STYLES[status] ?? ""}`}>
            {ORDER_STATUS_LABELS[status] ?? status}
          </span>
        );
      },
    },
    {
      accessorKey: "grandTotal",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Toplam
          <ArrowUpDown className="ml-2 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => {
        const total = parseFloat(row.getValue("grandTotal") as string);
        return (
          <span className="font-medium text-sm">
            {total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">İşlemler</span>,
      cell: ({ row }) => {
        const order = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" className="ml-auto">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Menüyü aç</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                render={<Link href={`/orders/${order.id}`} />}
              >
                <Eye className="size-4" />
                Detay
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href={`/orders/${order.id}/edit`} />}
              >
                <Pencil className="size-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(order.id)}
              >
                <Trash2 className="size-4" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
