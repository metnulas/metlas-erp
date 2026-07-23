import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { AppError } from "@/server/errors/app-error";
import { createPersonnelService } from "@/features/personnel/services/personnel.service";
import { createPersonnelSchema, personnelQuerySchema } from "@/features/personnel/validators/personnel.schema";
import { requirePermission } from "@/server/auth/authorization";

const personnelService = createPersonnelService();
function handleApiError(error: unknown) {
  if (error instanceof ZodError) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Geçersiz veri", details: error.issues } }, { status: 400 });
  if (error instanceof PrismaClientInitializationError) return NextResponse.json({ success: false, error: { code: "DATABASE_CONNECTION_ERROR", message: "Veritabanı bağlantısı kurulamadı." } }, { status: 503 });
  if (error instanceof Prisma.PrismaClientKnownRequestError) return NextResponse.json({ success: false, error: { code: "DATABASE_ERROR", message: "Personel kaydı veritabanına yazılamadı." } }, { status: 400 });
  if (error instanceof AppError) return NextResponse.json({ success: false, error: { code: error.code, message: error.message } }, { status: error.statusCode });
  return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: error instanceof Error ? error.message : "Bilinmeyen hata" } }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try { const { searchParams } = new URL(request.url); const query = personnelQuerySchema.parse({ page: searchParams.get("page") ?? 1, pageSize: searchParams.get("pageSize") ?? 20, search: searchParams.get("search") ?? undefined, position: searchParams.get("position") ?? undefined, status: searchParams.get("status") ?? undefined, sort: searchParams.get("sort") ?? "createdAt", order: searchParams.get("order") ?? "desc" }); return NextResponse.json({ success: true, data: await personnelService.list(await getCurrentTenantId(), query) }); } catch (error) { return handleApiError(error); }
}
export async function POST(request: NextRequest) { try { await requirePermission("personnel:write"); return NextResponse.json({ success: true, data: await personnelService.create(await getCurrentTenantId(), createPersonnelSchema.parse(await request.json())) }, { status: 201 }); } catch (error) { return handleApiError(error); } }
