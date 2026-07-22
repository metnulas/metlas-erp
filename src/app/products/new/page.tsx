import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import ProductForm from "@/features/products/components/product-form";

export default function NewProductPage() { return <DashboardLayout><div className="space-y-6"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" render={<Link href="/products" />}><ArrowLeft className="size-4" /></Button><div><h1 className="text-2xl font-bold tracking-tight">Yeni Ürün</h1><p className="text-sm text-muted-foreground">Ürün kataloğuna yeni bir kayıt ekleyin.</p></div></div><ProductForm mode="create" /></div></DashboardLayout>; }
