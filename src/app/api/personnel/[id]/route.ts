import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { AppError } from "@/server/errors/app-error";
import { createPersonnelService } from "@/features/personnel/services/personnel.service";
import { personnelIdSchema, updatePersonnelSchema } from "@/features/personnel/validators/personnel.schema";
import { requirePermission } from "@/server/auth/authorization";

const personnelService = createPersonnelService();
function handleApiError(error: unknown) {
  if (error instanceof ZodError) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri", details: error.issues } }, { status: 400 });
  if (error instanceof PrismaClientInitializationError) return NextResponse.json({ success: false, error: { code: "DATABASE_CONNECTION_ERROR", message: "Veritabanı bağlantısı kurulamadı." } }, { status: 503 });
  if (error instanceof Prisma.PrismaClientKnownRequestError) return NextResponse.json({ success: false, error: { code: "DATABASE_ERROR", message: "Personel kaydı veritabanına yazılamadı." } }, { status: 400 });
  if (error instanceof AppError) return NextResponse.json({ success: false, error: { code: error.code, message: error.message } }, { status: error.statusCode });
  return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: error instanceof Error ? error.message : "Bilinmeyen hata" } }, { status: 500 });
}
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) { try { const { id } = personnelIdSchema.parse(await params); return NextResponse.json({ success: true, data: await personnelService.getById(id, await getCurrentTenantId()) }); } catch (error) { return handleApiError(error); } }
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { try { await requirePermission("personnel:write"); const { id } = await params; return NextResponse.json({ success: true, data: await personnelService.update(id, await getCurrentTenantId(), updatePersonnelSchema.parse({ ...(await request.json()), id })) }); } catch (error) { return handleApiError(error); } }
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) { try { await requirePermission("personnel:write"); const { id } = personnelIdSchema.parse(await params); await personnelService.softDelete(id, await getCurrentTenantId()); return NextResponse.json({ success: true, data: { deleted: true } }); } catch (error) { return handleApiError(error); } }
