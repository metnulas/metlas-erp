import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Loading from "@/shared/components/loading";
import ProductList from "@/features/products/components/product-list";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ürünler | METLAS ERP", description: "Ürün kataloğu ve stok yönetimi" };

export default function ProductsPage() { return <DashboardLayout><Suspense fallback={<Loading message="Ürünler yükleniyor..." />}><ProductList /></Suspense></DashboardLayout>; }
