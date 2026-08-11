import Image from "next/image";
import type { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = { title: "Kayıt Ol | METLAS ERP", description: "Firmanız için METLAS ERP hesabı oluşturun" };

export default function RegisterPage() {
  return <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-8"><div className="w-full max-w-md"><div className="mb-7 text-center"><Image src="/metlas-logo.png" alt="METLAS ERP" width={420} height={180} className="mx-auto h-auto w-full max-w-sm rounded-2xl object-cover object-center shadow-2xl" priority unoptimized /><p className="mt-4 text-sm text-slate-400">Firmanız için operasyon merkezinizi oluşturun.</p></div><RegisterForm /></div></main>;
}
