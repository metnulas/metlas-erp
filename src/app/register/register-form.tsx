"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fields = [
  ["companyName", "Firma adı", "text", Building2, "organization"],
  ["companySlug", "Firma kısa adı", "text", Building2, "organization"],
  ["fullName", "Yetkili ad soyad", "text", UserRound, "name"],
  ["email", "E-posta", "email", Mail, "email"],
  ["phone", "Telefon", "tel", Phone, "tel"],
] as const;

type FormState = { companyName: string; companySlug: string; fullName: string; email: string; phone: string; password: string; passwordConfirmation: string; kvkkAccepted: boolean; termsAccepted: boolean };

export default function RegisterForm() {
  const [form, setForm] = useState<FormState>({ companyName: "", companySlug: "", fullName: "", email: "", phone: "", password: "", passwordConfirmation: "", kvkkAccepted: false, termsAccepted: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  function update(key: keyof FormState, value: string | boolean) { setForm((current) => ({ ...current, [key]: value })); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (loading) return; setError(""); setLoading(true);
    try {
      const response = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Kayıt oluşturulamadı");
      window.location.assign(result.data.verificationUrl ?? `/login?registered=1&email=${encodeURIComponent(form.email)}`);
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Kayıt oluşturulamadı"); setLoading(false); }
  }
  return <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-7"><div className="space-y-4">{fields.map(([key, label, type, Icon, autoComplete]) => <label key={key} htmlFor={`register-${key}`} className="block text-sm font-medium text-slate-200">{label}<div className="relative mt-2"><Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" /><Input id={`register-${key}`} className="h-11 border-white/10 bg-white/5 pl-9 text-white placeholder:text-slate-500" type={type} value={form[key]} onChange={(event) => update(key, event.target.value)} required autoComplete={autoComplete} /></div></label>)}<label htmlFor="register-password" className="block text-sm font-medium text-slate-200">Şifre<div className="relative mt-2"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" /><Input id="register-password" className="h-11 border-white/10 bg-white/5 pl-9 text-white" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} required minLength={8} autoComplete="new-password" /></div><span className="mt-1 block text-xs font-normal text-slate-500">Büyük/küçük harf, rakam ve özel karakter içermelidir.</span></label><label htmlFor="register-password-confirmation" className="block text-sm font-medium text-slate-200">Şifre tekrar<div className="relative mt-2"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" /><Input id="register-password-confirmation" className="h-11 border-white/10 bg-white/5 pl-9 text-white" type="password" value={form.passwordConfirmation} onChange={(event) => update("passwordConfirmation", event.target.value)} required autoComplete="new-password" /></div></label><label className="flex items-start gap-2 text-xs text-slate-400"><input type="checkbox" checked={form.kvkkAccepted} onChange={(event) => update("kvkkAccepted", event.target.checked)} /> KVKK metnini okudum ve kabul ediyorum.</label><label className="flex items-start gap-2 text-xs text-slate-400"><input type="checkbox" checked={form.termsAccepted} onChange={(event) => update("termsAccepted", event.target.checked)} /> Kullanım koşullarını kabul ediyorum.</label></div>{error && <p role="alert" className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}<Button type="submit" className="mt-6 h-11 w-full" disabled={loading || !form.kvkkAccepted || !form.termsAccepted}>{loading ? "Hesap oluşturuluyor..." : "14 gün ücretsiz başla"}</Button><p className="mt-4 text-center text-xs text-slate-500">Zaten hesabınız var mı? <Link href="/login" className="text-sky-300 hover:text-sky-200">Giriş yapın</Link></p></form>;
}
