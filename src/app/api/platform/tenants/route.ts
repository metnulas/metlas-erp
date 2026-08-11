import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/server/errors/handle-api-error";
import { requirePermission } from "@/server/auth/authorization";
import { createPlatformTenant, listPlatformTenants } from "@/features/platform/services/tenant.service";
import { createTenantSchema } from "@/features/platform/validators/tenant.schema";

export async function GET() { try { await requirePermission("platform.view"); return NextResponse.json({ success: true, data: await listPlatformTenants() }); } catch (error) { return handleApiError(error); } }
export async function POST(request: NextRequest) { try { await requirePermission("tenants.manage"); const input = createTenantSchema.parse(await request.json()); return NextResponse.json({ success: true, data: await createPlatformTenant(input.name) }, { status: 201 }); } catch (error) { return handleApiError(error); } }
