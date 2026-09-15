"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  BriefcaseBusiness,
  ClipboardCheck,
  CreditCard,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Settings2,
  Shapes,
  Truck,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    label: "Giriş",
    icon: LayoutDashboard,
    href: "/",
    permission: "dashboard.view",
  },
  {
    label: "Müşteriler",
    icon: Users,
    href: "/customers",
    permission: "customers.view",
  },
  {
    label: "Siparişler",
    icon: ReceiptText,
    href: "/orders",
    permission: "orders.view",
  },
  {
    label: "Ürünler",
    icon: Package,
    href: "/products",
    permission: "products.view",
  },
  {
    label: "Finans",
    icon: WalletCards,
    href: "/finance",
    permission: "finance.view",
  },
  {
    label: "Araçlar",
    icon: Truck,
    href: "/vehicles",
    permission: "vehicles.view",
  },
  {
    label: "Personeller",
    icon: BriefcaseBusiness,
    href: "/personnel",
    permission: "personnel.view",
  },
  {
    label: "Denetim",
    icon: ClipboardCheck,
    href: "/audit-logs",
    permission: "audit.view",
  },
];

const authorizationNavigationItems = [
  { label: "Roller", icon: Settings2, href: "/roles", permission: "roles.view" },
  { label: "Kullanıcılar", icon: Users, href: "/users", permission: "users.view" },
];

const platformNavigationItems = [
  {
    label: "Genel Bakış",
    icon: LayoutDashboard,
    href: "/platform",
    permission: "platform.view",
  },
  {
    label: "Abonelikler",
    icon: CreditCard,
    href: "/platform/subscriptions",
    permission: "subscriptions.view",
  },
  {
    label: "Paketler",
    icon: Shapes,
    href: "/platform/packages",
    permission: "packages.view",
  },
  {
    label: "Faturalar",
    icon: FileText,
    href: "/platform/invoices",
    permission: "invoices.view",
  },
  {
    label: "Ödemeler",
    icon: WalletCards,
    href: "/platform/payments",
    permission: "payments.view",
  },
  {
    label: "Audit Log",
    icon: ClipboardCheck,
    href: "/platform/audit-logs",
    permission: "platform.audit.view",
  },
  {
    label: "Sistem Ayarları",
    icon: Settings2,
    href: "/platform/settings",
    permission: "settings.manage",
  },
  {
    label: "Destek Talepleri",
    icon: LifeBuoy,
    href: "/platform/support",
    permission: "platform.support.manage",
  },
];

type SidebarProps = {
  isMobileMenuOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
};

export default function Sidebar({
  isMobileMenuOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const permissions = session?.user.permissions ?? [];
  const isGlobalPlatform = Boolean(
    session?.user.isGlobalAdmin && !session?.user.tenantId,
  );
  const canManageAuthorization =
    !isGlobalPlatform &&
    permissions.includes("roles.view") &&
    permissions.includes("users.view");
  const isCompact = isCollapsed && !isMobileMenuOpen;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = sidebarRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
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
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-[1200] flex flex-col overflow-hidden border-r border-blue-300/25 bg-[#0f172a] px-4 py-3 text-sky-50 shadow-[12px_0_35px_-18px_rgba(4,25,48,0.72)] transition-[width,transform] duration-300 ease-in-out lg:translate-x-0 ${isCompact ? "w-24" : "w-80"} ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal={isMobileMenuOpen}
        aria-label="Ana navigasyon"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 scale-110 bg-[url('/sidebar-wallpaper-final.png')] bg-cover bg-center opacity-45 blur-[5px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.68),rgba(30,58,138,0.78))]"
        />
        <Button
          aria-label={isCompact ? "Menüyü genişlet" : "Menüyü daralt"}
          className="absolute right-0 top-1/2 z-30 hidden h-20 w-7 translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/45 bg-[#0b5278]/90 p-0 text-cyan-50 shadow-[0_8px_22px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl hover:bg-[#0d6b98] lg:inline-flex"
          onClick={onToggleCollapse}
          size="icon"
          variant="ghost"
        >
          {isCompact ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
        <div className="relative z-10 flex min-h-full flex-col">
          <div
            className={`relative mb-2 flex items-start gap-2 ${isCompact ? "justify-center" : "justify-between"}`}
          >
            <div
              className={
                isCompact
                  ? "size-16 overflow-hidden rounded-2xl bg-white/15 shadow-[0_10px_24px_-15px_rgba(0,0,0,0.85)]"
                  : "min-w-0 flex-1"
              }
            >
              {isCompact ? (
                <Image
                  src="/metlas-logo.png"
                  alt="METLAS"
                  width={360}
                  height={240}
                  className="relative left-[-70px] top-[-80px] h-[240px] w-[360px] max-w-none shrink-0"
                  priority
                  unoptimized
                />
              ) : (
                <Image
                  src="/metlas-logo.png"
                  alt="METLAS ERP"
                  width={600}
                  height={300}
                  className="-mt-2 h-32 w-full scale-[1.1] object-contain object-center drop-shadow-[0_14px_18px_rgba(0,0,0,0.55)]"
                  priority
                  unoptimized
                />
              )}
            </div>
            <Button
              ref={closeButtonRef}
              aria-label="Menüyü kapat"
              className="size-8 text-cyan-50 hover:bg-white/15 hover:text-white lg:hidden"
              onClick={onClose}
              size="icon"
              variant="ghost"
            >
              <X className="size-5" />
            </Button>
          </div>
          <nav
            aria-label="Ana menü"
            className={isCompact ? "space-y-1" : "space-y-0.5"}
          >
            {(isGlobalPlatform ? platformNavigationItems : navigationItems)
              .filter(({ permission }) => permissions.includes(permission))
              .map(({ label, icon: Icon, href }) => {
                const isActive =
                  href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <Link
                    href={href}
                    key={label}
                    className={`relative flex h-10 items-center rounded-2xl border text-sm font-medium transition-all ${isCompact ? "justify-center px-2.5" : "gap-3 px-3"} ${isActive ? "border-blue-300/45 bg-blue-600/70 text-white shadow-[0_8px_22px_-14px_rgba(96,165,250,0.9)] backdrop-blur-xl before:absolute before:left-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-blue-200" : "border-transparent text-sky-100/80 hover:translate-x-[3px] hover:border-white/15 hover:bg-white/12 hover:text-white hover:backdrop-blur-xl"}`}
                    onClick={onClose}
                    title={isCompact ? label : undefined}
                  >
                    <Icon
                      className={isCompact ? "size-5 stroke-[2.2]" : "size-4"}
                    />
                    {!isCompact && label}
                  </Link>
                );
              })}
          </nav>
          {canManageAuthorization && (
            <div className="mt-3 border-t border-white/15 pt-2">
              {!isCompact && (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/70">
                  Yetkilendirme
                </p>
              )}
              <nav
                aria-label="Yetkilendirme menüsü"
                className={isCompact ? "space-y-1" : "space-y-0.5"}
              >
                {authorizationNavigationItems
                  .filter(({ permission }) => permissions.includes(permission))
                  .map(({ label, icon: Icon, href }) => {
                    const isActive = pathname.startsWith(href);
                    return (
                      <Link
                        href={href}
                        key={label}
                        className={`relative flex h-10 items-center rounded-2xl border text-sm font-medium transition-all ${isCompact ? "justify-center px-2.5" : "gap-3 px-3"} ${isActive ? "border-blue-300/45 bg-blue-600/70 text-white shadow-[0_8px_22px_-14px_rgba(96,165,250,0.9)] backdrop-blur-xl before:absolute before:left-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-blue-200" : "border-transparent text-sky-100/80 hover:translate-x-[3px] hover:border-white/15 hover:bg-white/12 hover:text-white hover:backdrop-blur-xl"}`}
                        onClick={onClose}
                        title={isCompact ? label : undefined}
                      >
                        <Icon className={isCompact ? "size-5 stroke-[2.2]" : "size-4"} />
                        {!isCompact && label}
                      </Link>
                    );
                  })}
              </nav>
            </div>
          )}
          <div
            className={`mt-auto rounded-2xl border border-white/20 bg-white/10 p-3 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.65)] backdrop-blur-xl ${isCompact ? "flex justify-center" : ""}`}
          >
            {isCompact ? (
              <span className="text-xs font-bold text-cyan-100">M</span>
            ) : (
              <>
                <p className="text-xs font-medium text-cyan-50">
                  METLAS ERP v1.0
                </p>
                <p className="mt-1 text-xs leading-5 text-sky-100/70">
                  Tüm operasyonlarınız tek ekranda.
                </p>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
