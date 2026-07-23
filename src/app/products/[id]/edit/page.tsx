import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import ProductForm from "@/features/products/components/product-form";
import { createProductService } from "@/features/products/services/product.service";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) { const product = await createProductService().getById((await params).id, await getCurrentTenantId()).catch(() => null); if (!product) notFound(); const serializedProduct = { ...product, salePrice: Number(product.salePrice), purchasePrice: Number(product.purchasePrice), depositAmount: Number(product.depositAmount) }; return <DashboardLayout><div className="space-y-6"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" render={<Link href={`/products/${product.id}`} />}><ArrowLeft className="size-4" /></Button><div><h1 className="text-2xl font-bold tracking-tight">Ürün Düzenle</h1><p className="text-sm text-muted-foreground">Ürün bilgilerini güncelleyin.</p></div></div><ProductForm mode="edit" initialData={serializedProduct} /></div></DashboardLayout>; }
