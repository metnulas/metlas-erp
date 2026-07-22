import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/server/errors/app-error";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { createProductService } from "@/features/products/services/product.service";
import { productIdSchema, stockAdjustmentSchema } from "@/features/products/validators/product.schema";

const productService = createProductService();

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = productIdSchema.parse(await params);
    const input = stockAdjustmentSchema.parse(await request.json());
    const product = await productService.adjustStock(id, getCurrentTenantId(), input);
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz stok verisi", details: error.issues } }, { status: 400 });
    if (error instanceof AppError) return NextResponse.json({ success: false, error: { code: error.code, message: error.message } }, { status: error.statusCode });
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message } }, { status: 500 });
  }
}
