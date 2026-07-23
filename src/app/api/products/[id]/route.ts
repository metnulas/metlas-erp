import { NextRequest, NextResponse } from "next/server";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { AppError } from "@/server/errors/app-error";
import { createProductService } from "@/features/products/services/product.service";
import { productIdSchema, updateProductSchema } from "@/features/products/validators/product.schema";
import { requirePermission } from "@/server/auth/authorization";

const productService = createProductService();

function handleApiError(error: unknown) {
  if (error instanceof ZodError) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri", details: error.issues } }, { status: 400 });
  if (error instanceof PrismaClientInitializationError) return NextResponse.json({ success: false, error: { code: "DATABASE_CONNECTION_ERROR", message: "Veritabanı bağlantısı kurulamadı." } }, { status: 503 });
  if (error instanceof AppError) return NextResponse.json({ success: false, error: { code: error.code, message: error.message } }, { status: error.statusCode });
  const message = error instanceof Error ? error.message : "Bilinmeyen hata";
  return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message } }, { status: 500 });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = productIdSchema.parse(await params);
    const product = await productService.getById(id, await getCurrentTenantId());
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("product:write");
    const { id } = await params;
    const input = updateProductSchema.parse({ ...(await request.json()), id });
    const product = await productService.update(id, await getCurrentTenantId(), input);
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("product:write");
    const { id } = productIdSchema.parse(await params);
    await productService.softDelete(id, await getCurrentTenantId());
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
