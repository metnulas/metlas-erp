import type { ReactNode } from "react";

type StatCardProps = { title: string; value: string; icon: ReactNode };

export default function StatCard({ title, value, icon }: StatCardProps) {
  return <div className="rounded-2xl bg-white p-6 shadow transition hover:shadow-lg"><div className="flex items-start justify-between gap-4"><p className="text-gray-500">{title}</p><span className="text-blue-600">{icon}</span></div><h2 className="mt-3 text-4xl font-bold text-slate-800">{value}</h2></div>;
}
