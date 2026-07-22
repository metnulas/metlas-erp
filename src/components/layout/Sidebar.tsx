"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { BarChart3, BriefcaseBusiness, LayoutDashboard, Package, ReceiptText, Truck, Users, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Müşteriler", icon: Users, href: "/customers" },
  { label: "Siparişler", icon: ReceiptText, href: "/orders" },
  { label: "Ürünler", icon: Package, href: "/products" },
  { label: "Araçlar", icon: Truck, href: "#" },
  { label: "Personeller", icon: BriefcaseBusiness, href: "#" },
  { label: "Kasa", icon: Wallet, href: "#" },
  { label: "Raporlar", icon: BarChart3, href: "#" },
];

type SidebarProps = { isMobileMenuOpen: boolean; onClose: () => void };

export default function Sidebar({ isMobileMenuOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <>
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Menüyü kapat"
          className="fixed inset-0 z-40 border-0 bg-slate-950/60 p-0 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-slate-950 px-4 py-5 text-slate-300 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 font-bold text-slate-950 shadow-lg shadow-cyan-500/20">M</div>
            <div>
              <h1 className="text-base font-bold tracking-wide text-white">METLAS ERP</h1>
              <p className="text-xs text-slate-500">İş Yönetim Platformu</p>
            </div>
          </div>
          <Button
            aria-label="Menüyü kapat"
            className="size-8 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onClose}
            size="icon"
            variant="ghost"
          >
            <X className="size-5" />
          </Button>
        </div>
        <nav aria-label="Ana menü" className="space-y-1">
          {navigationItems.map(({ label, icon: Icon, href }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                href={href}
                key={label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 ring-1 ring-cyan-400/15" : "hover:bg-white/5 hover:text-white"}`}
                onClick={onClose}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium text-white">METLAS ERP v1.0</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Tüm operasyonlarınız tek ekranda.</p>
        </div>
      </aside>
    </>
  );
}
