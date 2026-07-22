import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "METLAS ERP",
  description: "Su dağıtım yönetim sistemi",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const themeScript = `(() => { const savedTheme = localStorage.getItem("metlas-theme"); const isDark = savedTheme ? savedTheme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; document.documentElement.classList.toggle("dark", isDark); })()`;

  return (
    <html lang="tr" className="h-full antialiased font-sans">
      <body className="flex min-h-full flex-col">
        <Script id="metlas-theme" strategy="beforeInteractive">{themeScript}</Script>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
