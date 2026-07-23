import { NextRequest, NextResponse } from "next/server";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { AppError } from "@/server/errors/app-error";
import { createDeliveryService } from "@/features/deliveries/services/delivery.service";
import { deliveryQuerySchema } from "@/features/deliveries/validators/delivery.schema";

const deliveryService = createDeliveryService();
function handleApiError(error: unknown) {
  if (error instanceof ZodError) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri", details: error.issues } }, { status: 400 });
  if (error instanceof PrismaClientInitializationError) return NextResponse.json({ success: false, error: { code: "DATABASE_CONNECTION_ERROR", message: "Veritabanı bağlantısı kurulamadı." } }, { status: 503 });
  if (error instanceof AppError) return NextResponse.json({ success: false, error: { code: error.code, message: error.message } }, { status: error.statusCode });
  return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: error instanceof Error ? error.message : "Bilinmeyen hata" } }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = deliveryQuerySchema.parse({ date: searchParams.get("date") ?? undefined, status: searchParams.get("status") ?? undefined, includeUnscheduled: searchParams.get("includeUnscheduled") ?? false });
    return NextResponse.json({ success: true, data: await deliveryService.list(await getCurrentTenantId(), query) });
  } catch (error) { return handleApiError(error); }
}
