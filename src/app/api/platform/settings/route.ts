import { NextResponse } from "next/server";
import { requirePermission } from "@/server/auth/authorization";
import { handleApiError } from "@/server/errors/handle-api-error";
import { listPlatformSettings, updatePlatformSettings } from "@/features/platform/services/settings.service";
import { updateSettingsSchema } from "@/features/platform/validators/settings.schema";

export async function GET() { try { await requirePermission("settings.manage"); return NextResponse.json({ success: true, data: await listPlatformSettings() }); } catch (error) { return handleApiError(error); } }
export async function PUT(request: Request) { try { const session = await requirePermission("settings.manage"); return NextResponse.json({ success: true, data: await updatePlatformSettings(updateSettingsSchema.parse(await request.json()), session.user.id) }); } catch (error) { return handleApiError(error); } }
