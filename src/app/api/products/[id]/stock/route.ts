import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/server/errors/handle-api-error";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { createProductService } from "@/features/products/services/product.service";
import { productIdSchema, stockAdjustmentSchema } from "@/features/products/validators/product.schema";
import { requirePermission } from "@/server/auth/authorization";

const productService = createProductService();

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("stock:write");
    const { id } = productIdSchema.parse(await params);
    const input = stockAdjustmentSchema.parse(await request.json());
    const product = await productService.adjustStock(id, await getCurrentTenantId(), input);
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return handleApiError(error);
  }
}
