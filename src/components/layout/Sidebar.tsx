"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { BarChart3, BriefcaseBusiness, ClipboardCheck, ClipboardList, History, LayoutDashboard, Package, PanelLeftClose, PanelLeftOpen, ReceiptText, Truck, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Müşteriler", icon: Users, href: "/customers" },
  { label: "Siparişler", icon: ReceiptText, href: "/orders" },
  { label: "Ürünler", icon: Package, href: "/products" },
  { label: "Araçlar", icon: Truck, href: "/vehicles" },
  { label: "Personeller", icon: BriefcaseBusiness, href: "/personnel" },
  { label: "Dağıtım", icon: ClipboardList, href: "/deliveries" },
  { label: "Raporlar", icon: BarChart3, href: "/reports" },
  { label: "Geçmiş Rotalar", icon: History, href: "/route-histories" },
  { label: "Denetim", icon: ClipboardCheck, href: "/audit-logs" },
];

type SidebarProps = { isMobileMenuOpen: boolean; isCollapsed: boolean; onClose: () => void; onToggleCollapse: () => void };

export default function Sidebar({ isMobileMenuOpen, isCollapsed, onClose, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
    if (!isMobileMenuOpen) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen, onClose]);

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <>
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Menüyü kapat"
            className="fixed inset-0 z-[1100] border-0 bg-slate-900/25 p-0 backdrop-blur-[2px] transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}
       <aside
         style={{ backgroundImage: "linear-gradient(180deg, rgba(196,217,235,0.72), rgba(196,217,235,0.84)), url('/sidebar-wallpaper-final.png')", backgroundPosition: "center", backgroundSize: "cover" }}
        role="dialog"
        aria-modal={isMobileMenuOpen}
        aria-label="Ana navigasyon"
      >
         <div className={`mb-8 flex items-start gap-2 px-1 ${isCollapsed ? "justify-center" : "justify-between"}`}>
           <div className={isCollapsed ? "w-12" : "min-w-0 flex-1"}>
             <Image src="/metlas-logo.png" alt="METLAS ERP" width={230} height={110} className={`${isCollapsed ? "h-12 w-12" : "h-24 w-full"} rounded-xl object-cover object-center shadow-sm`} priority unoptimized />
              {!isCollapsed && <p className="mt-3 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#315774]">İş Yönetim Platformu</p>}
           </div>
          <Button
            ref={closeButtonRef}
            aria-label="Menüyü kapat"
             className="size-8 text-[#315774] hover:bg-white/70 hover:text-slate-900 lg:hidden"
            onClick={onClose}
            size="icon"
            variant="ghost"
          >
            <X className="size-5" />
          </Button>
           <Button aria-label={isCollapsed ? "Menüyü genişlet" : "Menüyü daralt"} className="hidden size-8 text-[#315774] hover:bg-white/70 hover:text-slate-900 lg:inline-flex" onClick={onToggleCollapse} size="icon" variant="ghost">
            {isCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </Button>
        </div>
        <nav aria-label="Ana menü" className="space-y-1">
          {navigationItems.map(({ label, icon: Icon, href }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                href={href}
                key={label}
                  className={`flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors ${isCollapsed ? "justify-center px-2" : "gap-3 px-3"} ${isActive ? "bg-white/90 text-[#1c5d91] shadow-sm ring-1 ring-white" : "hover:bg-white/55 hover:text-[#17324d]"}`}
                 onClick={onClose}
                 title={isCollapsed ? label : undefined}
               >
                 <Icon className="size-4" />
                 {!isCollapsed && label}
              </Link>
            );
          })}
        </nav>
         <div className={`mt-auto rounded-xl border border-white/70 bg-white/45 p-4 ${isCollapsed ? "flex justify-center" : ""}`}>
            {isCollapsed ? <span className="text-xs font-bold text-[#17324d]">M</span> : <>
            <p className="text-xs font-medium text-[#17324d]">METLAS ERP v1.0</p>
            <p className="mt-1 text-xs leading-5 text-[#315774]">Tüm operasyonlarınız tek ekranda.</p>
           </>}
        </div>
      </aside>
    </>
  );
}
