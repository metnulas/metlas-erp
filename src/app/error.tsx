"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep the production fallback intentionally quiet; detailed errors stay server-side.
  }, []);
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><div className="w-full max-w-md rounded-[20px] border border-slate-200 bg-white p-8 text-center shadow-[0_18px_50px_-30px_rgba(15,23,42,0.4)]"><AlertTriangle className="mx-auto size-10 text-amber-500" /><h1 className="mt-4 text-xl font-semibold text-slate-950">Bir sorun oluştu</h1><p className="mt-2 text-sm text-slate-500">Veriler yüklenirken beklenmeyen bir hata oluştu. Tekrar deneyin.</p><Button className="mt-6" onClick={() => reset()}><RefreshCw className="size-4" /> Tekrar dene</Button></div></main>;
}
