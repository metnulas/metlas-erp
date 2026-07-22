import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { createOrderService } from "@/features/orders/services/order.service";
import { orderQuerySchema, createOrderSchema } from "@/features/orders/validators/order.schema";
import type { ApiResponse } from "@/shared/types";
import { AppError } from "@/server/errors/app-error";

const orderService = createOrderService();

export async function GET(request: NextRequest) {
  try {
    const tenantId = getCurrentTenantId();
    const { searchParams } = new URL(request.url);

    const query = orderQuerySchema.parse({
      page: searchParams.get("page") ?? 1,
      pageSize: searchParams.get("pageSize") ?? 20,
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      customerId: searchParams.get("customerId") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      sort: searchParams.get("sort") ?? "createdAt",
      order: searchParams.get("order") ?? "desc",
    });

    const result = await orderService.list(tenantId, query);

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

    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "DATABASE_CONNECTION_ERROR", message: "Veritabanı bağlantısı kurulamadı." },
        },
        { status: 503 }
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
    const input = createOrderSchema.parse(body);

    const order = await orderService.create(tenantId, input);

    const response: ApiResponse<typeof order> = {
      success: true,
      data: order,
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

    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "DATABASE_CONNECTION_ERROR", message: "Veritabanı bağlantısı kurulamadı." },
        },
        { status: 503 }
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }

    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}
