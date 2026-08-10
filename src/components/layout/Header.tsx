"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type HeaderProps = { onMenuClick: () => void };

export default function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const [isDark, setIsDark] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = () => {
    const nextThemeIsDark = !isDark;
    setIsDark(nextThemeIsDark);
    document.documentElement.classList.toggle("dark", nextThemeIsDark);
    window.localStorage.setItem("metlas-theme", nextThemeIsDark ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-30 flex h-[4.5rem] shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 shadow-[0_14px_35px_-28px_rgba(15,23,42,0.55)] backdrop-blur-2xl sm:px-6 lg:px-10">
      <Button aria-label="Menüyü aç" className="lg:hidden" onClick={onMenuClick} size="icon" variant="ghost"><Menu /></Button>
        <div className="relative hidden max-w-xl flex-1 sm:block">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label="Genel arama" className="h-11 rounded-xl border-slate-200/70 bg-slate-100/75 pl-10 shadow-none transition-all placeholder:text-slate-400 focus-visible:border-blue-500/60 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-500/10" placeholder="Müşteri, sipariş veya araç ara..." />
      </div>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <Button className="border border-border/70 bg-card/60 hover:bg-accent" aria-label={isDark ? "Aydınlık temaya geç" : "Karanlık temaya geç"} onClick={toggleTheme} size="icon" variant="ghost">{isDark ? <Sun /> : <Moon />}</Button>
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="Kullanıcı menüsünü aç" className="ml-1 inline-flex items-center gap-2 rounded-lg p-1 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
            <Avatar className="bg-primary text-primary-foreground"><AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">{(session?.user?.name ?? "M").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
            <span className="hidden text-left sm:block"><span className="block text-sm font-semibold leading-4">{session?.user?.name ?? "Kullanıcı"}</span><span className="block text-xs text-muted-foreground">{session?.user?.role ?? ""}</span></span>
            <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
             <DropdownMenuGroup><DropdownMenuLabel>Hesabım</DropdownMenuLabel></DropdownMenuGroup><DropdownMenuSeparator />
             <DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: "/login" })}><LogOut /> Çıkış yap</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
