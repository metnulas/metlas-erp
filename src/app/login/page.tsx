import LoginForm from "./login-form";
import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Giriş | METLAS ERP", description: "METLAS ERP operasyon paneline giriş" };

export default function LoginPage() { return <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-8"><div className="w-full max-w-md"><div className="mb-8 text-center"><Image src="/metlas-logo.png" alt="METLAS ERP" width={420} height={180} className="mx-auto h-auto w-full max-w-sm rounded-2xl object-cover object-center shadow-2xl" priority unoptimized /><p className="mt-4 text-sm text-slate-400">Operasyon yönetim panelinize giriş yapın.</p></div><Suspense fallback={<div className="h-80 rounded-2xl border border-white/10 bg-white/[0.06]" />}><LoginForm /></Suspense><p className="mt-5 text-center text-sm text-slate-400">Firmanız yok mu? <Link className="font-semibold text-blue-300 hover:text-blue-200" href="/register">Ücretsiz kayıt olun</Link></p></div></main>; }
