"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function verify(event: React.FormEvent) { event.preventDefault(); setError(""); const response = await fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }); const result = await response.json(); if (!response.ok) { setError(result.error?.message ?? "E-posta doğrulanamadı"); return; } setMessage("E-posta doğrulandı. Giriş sayfasına yönlendiriliyorsunuz."); window.setTimeout(() => window.location.assign("/login?verified=1"), 900); }
  async function resend(event: React.FormEvent) { event.preventDefault(); setError(""); const response = await fetch("/api/auth/resend-verification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); const result = await response.json(); if (!response.ok) { setError(result.error?.message ?? "Doğrulama e-postası gönderilemedi"); return; } setMessage(result.data.verificationUrl ? `Geliştirme doğrulama bağlantısı: ${result.data.verificationUrl}` : "Doğrulama e-postası tekrar gönderildi."); }
  return <main className="grid min-h-screen place-items-center bg-slate-950 px-4"><div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.06] p-7 text-white shadow-2xl"><h1 className="text-2xl font-bold">E-postanızı doğrulayın</h1><p className="mt-2 text-sm text-slate-400">Hesabınızı kullanmaya başlamadan önce e-posta adresinizi doğrulayın.</p><form onSubmit={verify} className="mt-6 space-y-3"><Input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Doğrulama tokenı" aria-label="Doğrulama tokenı" required /><Button className="w-full" type="submit">E-postayı doğrula</Button></form><div className="my-6 border-t border-white/10" /><form onSubmit={resend} className="space-y-3"><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="E-posta adresiniz" aria-label="E-posta adresiniz" required /><Button className="w-full" variant="outline" type="submit">Doğrulama e-postasını tekrar gönder</Button></form>{message && <p className="mt-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</p>}{error && <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}<Link href="/login" className="mt-6 block text-center text-sm text-sky-300">Giriş sayfasına dön</Link></div></main>;
}
