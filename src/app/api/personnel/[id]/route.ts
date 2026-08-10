import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenantId } from "@/server/tenancy/tenant-context";
import { handleApiError } from "@/server/errors/handle-api-error";
import { createPersonnelService } from "@/features/personnel/services/personnel.service";
import { personnelIdSchema, updatePersonnelSchema } from "@/features/personnel/validators/personnel.schema";
import { requirePermission } from "@/server/auth/authorization";

const personnelService = createPersonnelService();
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) { try { await requirePermission("personnel:read"); const { id } = personnelIdSchema.parse(await params); return NextResponse.json({ success: true, data: await personnelService.getById(id, await getCurrentTenantId()) }); } catch (error) { return handleApiError(error); } }
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { try { const session = await requirePermission("personnel:write"); const { id } = await params; return NextResponse.json({ success: true, data: await personnelService.update(id, await getCurrentTenantId(), updatePersonnelSchema.parse({ ...(await request.json()), id }), session.user.id) }); } catch (error) { return handleApiError(error); } }
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) { try { const session = await requirePermission("personnel:write"); const { id } = personnelIdSchema.parse(await params); await personnelService.softDelete(id, await getCurrentTenantId(), session.user.id); return NextResponse.json({ success: true, data: { deleted: true } }); } catch (error) { return handleApiError(error); } }
