import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { createCustomerService } from "@/features/customers/services/customer.service";
import { customerIdSchema, updateCustomerSchema } from "@/features/customers/validators/customer.schema";
import type { ApiResponse } from "@/shared/types";

const customerService = createCustomerService();

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
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz ID" } },
        { status: 400 }
      );
    }

    if (error && typeof error === "object" && "statusCode" in error) {
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
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Geçersiz veri", details: error.issues },
        },
        { status: 400 }
      );
    }

    if (error && typeof error === "object" && "statusCode" in error) {
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
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz ID" } },
        { status: 400 }
      );
    }

    if (error && typeof error === "object" && "statusCode" in error) {
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
