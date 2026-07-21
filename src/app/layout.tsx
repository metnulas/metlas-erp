import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "METLAS ERP",
  description: "Su dağıtım yönetim sistemi",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className="h-full antialiased font-sans">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
