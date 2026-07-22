import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { createCustomerService } from "@/features/customers/services/customer.service";
import { customerQuerySchema, createCustomerSchema } from "@/features/customers/validators/customer.schema";
import type { ApiResponse } from "@/shared/types";

const customerService = createCustomerService();

export async function GET(request: NextRequest) {
  try {
    const tenantId = getCurrentTenantId();
    const { searchParams } = new URL(request.url);

    const query = customerQuerySchema.parse({
      page: searchParams.get("page") ?? 1,
      pageSize: searchParams.get("pageSize") ?? 20,
      search: searchParams.get("search") ?? undefined,
      isActive: searchParams.get("isActive") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      sort: searchParams.get("sort") ?? "createdAt",
      order: searchParams.get("order") ?? "desc",
    });

    const result = await customerService.list(tenantId, query);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Geçersiz sorgu parametreleri", details: error.issues },
        },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getCurrentTenantId();
    const body = await request.json();
    const input = createCustomerSchema.parse(body);

    const customer = await customerService.create(tenantId, input);

    const response: ApiResponse<typeof customer> = {
      success: true,
      data: customer,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Geçersiz veri", details: error.issues },
        },
        { status: 400 }
      );
    }

    if (error && typeof error === "object" && "code" in error) {
      const appError = error as { code: string; statusCode: number; message: string };
      return NextResponse.json(
        { success: false, error: { code: appError.code, message: appError.message } },
        { status: appError.statusCode }
      );
    }

    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}
