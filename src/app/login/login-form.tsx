"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@metlas.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", { email: email.trim(), password, redirect: false, callbackUrl });
      if (!result || result.error || result.ok === false) {
        setError("E-posta veya şifre hatalı.");
        return;
      }
      window.location.assign(result.url || callbackUrl);
    } catch {
      setError("Giriş servisine ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate={false} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="space-y-4">
        <label htmlFor="login-email" className="block text-sm font-medium text-slate-200">
          E-posta
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <Input id="login-email" className="h-11 border-white/10 bg-white/5 pl-9 text-white placeholder:text-slate-500" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" autoCapitalize="none" spellCheck={false} />
          </div>
        </label>
        <label htmlFor="login-password" className="block text-sm font-medium text-slate-200">
          Şifre
          <div className="relative mt-2">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <Input id="login-password" className="h-11 border-white/10 bg-white/5 pl-9 text-white placeholder:text-slate-500" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
          </div>
        </label>
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</p>}
      <Button className="mt-6 h-11 w-full" type="submit" disabled={loading}>{loading && <Loader2 className="size-4 animate-spin" />}Giriş Yap</Button>
      <p className="mt-4 text-center text-xs text-slate-500">Demo hesabı: `admin@metlas.local`</p>
    </form>
  );
}
