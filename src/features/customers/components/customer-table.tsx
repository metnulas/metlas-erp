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

export interface CustomerRow {
  id: string;
  customerCode: string;
  fullName: string;
  phone: string;
  email: string | null;
  city: string | null;
  district: string | null;
  balance: number;
  depositBottleCount: number;
  emptyBottleCount: number;
  isActive: boolean;
  createdAt: string;
  partner: { id: string; name: string; code: string } | null;
}

interface CustomerTableColumnsProps {
  onDelete: (id: string) => void;
}

export function getCustomerColumns({ onDelete }: CustomerTableColumnsProps): ColumnDef<CustomerRow>[] {
  return [
    {
      accessorKey: "customerCode",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Kod
          <ArrowUpDown className="ml-2 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.getValue("customerCode")}</span>
      ),
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ad Soyad
          <ArrowUpDown className="ml-2 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.getValue("fullName")}</p>
          {row.original.email && (
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          )}
        </div>
      ),
    },
    {
      id: "partner",
      header: "Bayilik",
      cell: ({ row }) => {
        const partner = row.original.partner;
        if (!partner) return <span className="text-muted-foreground">Bayi seçilmemiş</span>;
        const hue = [...partner.id].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 360;
        return <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: `hsl(${hue} 85% 92%)`, color: `hsl(${hue} 55% 30%)` }}>{partner.name}</span>;
      },
    },
    {
      accessorKey: "phone",
      header: "Telefon",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("phone")}</span>
      ),
    },
    {
      accessorKey: "city",
      header: "Şehir",
      cell: ({ row }) => {
        const city = row.getValue("city") as string | null;
        const district = row.original.district;
        if (!city) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-sm">
            {city}{district ? `, ${district}` : ""}
          </span>
        );
      },
    },
    {
      accessorKey: "balance",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bakiye
          <ArrowUpDown className="ml-2 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => {
        const balance = parseFloat(row.getValue("balance") as string);
        return (
          <span className={`font-medium text-sm ${balance > 0 ? "text-emerald-600" : balance < 0 ? "text-red-500" : ""}`}>
            {balance.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
          </span>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Durum",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              isActive
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                : "bg-gray-50 text-gray-600 ring-1 ring-gray-500/20"
            }`}
          >
            {isActive ? "Aktif" : "Pasif"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">İşlemler</span>,
      cell: ({ row }) => {
        const customer = row.original;
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
                render={<Link href={`/customers/${customer.id}`} />}
              >
                <Eye className="size-4" />
                Detay
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href={`/customers/${customer.id}/edit`} />}
              >
                <Pencil className="size-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(customer.id)}
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
