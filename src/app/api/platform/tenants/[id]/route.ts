import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";
import { deletePlatformTenant, updatePlatformTenant } from "@/features/platform/services/tenant.service";
import { tenantIdSchema, updateTenantSchema } from "@/features/platform/validators/tenant.schema";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { try { await requirePermission("tenants.manage"); const { id } = tenantIdSchema.parse(await params); return NextResponse.json({ success: true, data: await updatePlatformTenant(id, updateTenantSchema.parse(await request.json())) }); } catch (error) { return handleApiError(error); } }
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) { try { await requirePermission("tenants.manage"); const { id } = tenantIdSchema.parse(await params); return NextResponse.json({ success: true, data: await deletePlatformTenant(id) }); } catch (error) { return handleApiError(error); } }
