import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { handleApiError } from "@/server/errors/handle-api-error";
import { createProductService } from "@/features/products/services/product.service";
import { createProductSchema, productQuerySchema } from "@/features/products/validators/product.schema";
import { requirePermission } from "@/server/auth/authorization";

const productService = createProductService();


export async function GET(request: NextRequest) {
  try {
    await requirePermission("product:read");
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
    const data = await productService.list(await getCurrentTenantId(), query);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("product:write");
    const input = createProductSchema.parse(await request.json());
    const product = await productService.create(await getCurrentTenantId(), input);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
