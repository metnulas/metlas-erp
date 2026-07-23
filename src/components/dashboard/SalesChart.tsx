"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function SalesChart({ data }: { data: Array<{ gun: string; satis: number }> }) {
  return <div className="mt-6 h-72 sm:h-80"><ResponsiveContainer height="100%" width="100%"><LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="currentColor" strokeDasharray="3 3" className="text-border" vertical={false} /><XAxis axisLine={false} dataKey="gun" tick={{ fill: "currentColor", fontSize: 12 }} tickLine={false} className="text-muted-foreground" /><YAxis allowDecimals={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 12 }} tickLine={false} className="text-muted-foreground" /><Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--card-foreground)" }} cursor={{ stroke: "var(--primary)", strokeDasharray: "4 4" }} /><Line activeDot={{ r: 5 }} dataKey="satis" dot={false} name="Sipariş" stroke="var(--primary)" strokeWidth={3} type="monotone" /></LineChart></ResponsiveContainer></div>;
}
