"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const salesData = [
  { gun: "Pazartesi", satis: 35 },
  { gun: "Salı", satis: 52 },
  { gun: "Çarşamba", satis: 48 },
  { gun: "Perşembe", satis: 75 },
  { gun: "Cuma", satis: 90 },
  { gun: "Cumartesi", satis: 110 },
  { gun: "Pazar", satis: 80 },
];

export default function SalesChart() {
  return <div className="mt-6 h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={salesData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="gun" /><YAxis /><Tooltip /><Line type="monotone" dataKey="satis" stroke="#2563eb" strokeWidth={3} /></LineChart></ResponsiveContainer></div>;
}
