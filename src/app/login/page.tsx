import LoginForm from "./login-form";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Giriş | METLAS ERP", description: "METLAS ERP operasyon paneline giriş" };

export default function LoginPage() { return <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-8"><div className="w-full max-w-md"><div className="mb-8 text-center"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-xl font-bold text-slate-950 shadow-lg shadow-cyan-500/20">M</div><h1 className="mt-5 text-2xl font-bold tracking-tight text-white">METLAS ERP</h1><p className="mt-2 text-sm text-slate-400">Operasyon yönetim panelinize giriş yapın.</p></div><Suspense fallback={<div className="h-80 rounded-2xl border border-white/10 bg-white/[0.06]" />}><LoginForm /></Suspense></div></main>; }
