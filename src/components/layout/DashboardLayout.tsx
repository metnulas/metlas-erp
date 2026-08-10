"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

type DashboardLayoutProps = { children: ReactNode };

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed((collapsed) => !collapsed)} onClose={handleClose} />
      <div className={`min-w-0 transition-[padding] duration-300 ${isSidebarCollapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="mx-auto w-full max-w-[1680px] p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
