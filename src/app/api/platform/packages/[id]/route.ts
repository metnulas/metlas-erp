import { NextResponse } from "next/server";
import { requirePermission } from "@/server/auth/authorization";
import { handleApiError } from "@/server/errors/handle-api-error";
import { deletePackage, updatePackage } from "@/features/platform/services/subscription.service";
import { packageUpdateSchema } from "@/features/platform/validators/subscription.schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { try { const session = await requirePermission("packages.manage"); const { id } = await params; return NextResponse.json({ success: true, data: await updatePackage(id, packageUpdateSchema.parse(await request.json()), session.user.id) }); } catch (error) { return handleApiError(error); } }
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) { try { const session = await requirePermission("packages.manage"); const { id } = await params; return NextResponse.json({ success: true, data: await deletePackage(id, session.user.id) }); } catch (error) { return handleApiError(error); } }
