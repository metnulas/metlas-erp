import { NextRequest, NextResponse } from "next/server";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { AppError } from "@/server/errors/app-error";
import { createVehicleService } from "@/features/vehicles/services/vehicle.service";
import { updateVehicleSchema, vehicleIdSchema } from "@/features/vehicles/validators/vehicle.schema";

const vehicleService = createVehicleService();

function handleApiError(error: unknown) {
  if (error instanceof ZodError) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri", details: error.issues } }, { status: 400 });
  if (error instanceof PrismaClientInitializationError) return NextResponse.json({ success: false, error: { code: "DATABASE_CONNECTION_ERROR", message: "Veritabanı bağlantısı kurulamadı." } }, { status: 503 });
  if (error instanceof Prisma.PrismaClientKnownRequestError) return NextResponse.json({ success: false, error: { code: "DATABASE_ERROR", message: "Araç kaydı veritabanına yazılamadı. Lütfen alanları kontrol edin." } }, { status: 400 });
  if (error instanceof AppError) return NextResponse.json({ success: false, error: { code: error.code, message: error.message } }, { status: error.statusCode });
  return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: error instanceof Error ? error.message : "Bilinmeyen hata" } }, { status: 500 });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = vehicleIdSchema.parse(await params); return NextResponse.json({ success: true, data: await vehicleService.getById(id, getCurrentTenantId()) }); } catch (error) { return handleApiError(error); }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; const input = updateVehicleSchema.parse({ ...(await request.json()), id }); return NextResponse.json({ success: true, data: await vehicleService.update(id, getCurrentTenantId(), input) }); } catch (error) { return handleApiError(error); }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = vehicleIdSchema.parse(await params); await vehicleService.softDelete(id, getCurrentTenantId()); return NextResponse.json({ success: true, data: { deleted: true } }); } catch (error) { return handleApiError(error); }
}
