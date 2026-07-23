import { notFound } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProductDetail from "@/features/products/components/product-detail";
import { createProductService } from "@/features/products/services/product.service";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) { const product = await createProductService().getById((await params).id, await getCurrentTenantId()).catch(() => null); if (!product) notFound(); const serializedProduct = { ...product, salePrice: Number(product.salePrice), purchasePrice: Number(product.purchasePrice), depositAmount: Number(product.depositAmount) }; return <DashboardLayout><ProductDetail product={serializedProduct} /></DashboardLayout>; }
