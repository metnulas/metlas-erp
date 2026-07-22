import { NextRequest, NextResponse } from "next/server";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { AppError } from "@/server/errors/app-error";
import { createProductService } from "@/features/products/services/product.service";
import { createProductSchema, productQuerySchema } from "@/features/products/validators/product.schema";

const productService = createProductService();

function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri", details: error.issues } }, { status: 400 });
  }
  if (error instanceof PrismaClientInitializationError) {
    return NextResponse.json({ success: false, error: { code: "DATABASE_CONNECTION_ERROR", message: "Veritabanı bağlantısı kurulamadı." } }, { status: 503 });
  }
  if (error instanceof AppError) {
    return NextResponse.json({ success: false, error: { code: error.code, message: error.message } }, { status: error.statusCode });
  }
  const message = error instanceof Error ? error.message : "Bilinmeyen hata";
  return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message } }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = productQuerySchema.parse({
      page: searchParams.get("page") ?? 1,
      pageSize: searchParams.get("pageSize") ?? 20,
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      isActive: searchParams.get("isActive") ?? undefined,
      lowStock: searchParams.get("lowStock") ?? undefined,
      sort: searchParams.get("sort") ?? "createdAt",
      order: searchParams.get("order") ?? "desc",
    });
    const data = await productService.list(getCurrentTenantId(), query);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = createProductSchema.parse(await request.json());
    const product = await productService.create(getCurrentTenantId(), input);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
