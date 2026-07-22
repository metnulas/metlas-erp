import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { createCustomerService } from "@/features/customers/services/customer.service";
import { customerIdSchema, updateCustomerSchema } from "@/features/customers/validators/customer.schema";
import type { ApiResponse } from "@/shared/types";
import { AppError } from "@/server/errors/app-error";

const customerService = createCustomerService();

function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri", details: error.issues } },
      { status: 400 }
    );
  }

  if (error instanceof PrismaClientInitializationError) {
    return NextResponse.json(
      { success: false, error: { code: "DATABASE_CONNECTION_ERROR", message: "Veritabanı bağlantısı kurulamadı." } },
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = getCurrentTenantId();
    const { id } = await params;
    const { id: validId } = customerIdSchema.parse({ id });

    const customer = await customerService.getById(validId, tenantId);

    const response: ApiResponse<typeof customer> = {
      success: true,
      data: customer,
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = getCurrentTenantId();
    const { id } = await params;
    const body = await request.json();
    const input = updateCustomerSchema.parse({ ...body, id });

    const customer = await customerService.update(id, tenantId, input);

    const response: ApiResponse<typeof customer> = {
      success: true,
      data: customer,
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = getCurrentTenantId();
    const { id } = await params;
    const { id: validId } = customerIdSchema.parse({ id });

    await customerService.softDelete(validId, tenantId);

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
