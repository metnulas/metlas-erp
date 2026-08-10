import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { handleApiError } from "@/server/errors/handle-api-error";
import { createProductService } from "@/features/products/services/product.service";
import { productIdSchema, updateProductSchema } from "@/features/products/validators/product.schema";
import { requirePermission } from "@/server/auth/authorization";

const productService = createProductService();


export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("products.view");
    const { id } = productIdSchema.parse(await params);
    const product = await productService.getById(id, await getCurrentTenantId());
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("products.edit");
    const { id } = await params;
    const input = updateProductSchema.parse({ ...(await request.json()), id });
    const product = await productService.update(id, await getCurrentTenantId(), input, session.user.id);
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("products.delete");
    const { id } = productIdSchema.parse(await params);
    await productService.softDelete(id, await getCurrentTenantId(), session.user.id);
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
