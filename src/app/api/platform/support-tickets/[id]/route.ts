import { NextResponse } from "next/server";
import { requirePermission } from "@/server/auth/authorization";
import { handleApiError } from "@/server/errors/handle-api-error";
import { addSupportMessage, updateSupportTicket } from "@/features/platform/services/support.service";
import { supportMessageSchema, updateSupportTicketSchema } from "@/features/platform/validators/support.schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { try { const session = await requirePermission("platform.support.manage"); const { id } = await params; return NextResponse.json({ success: true, data: await updateSupportTicket(id, updateSupportTicketSchema.parse(await request.json()), session.user.id) }); } catch (error) { return handleApiError(error); } }
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) { try { const session = await requirePermission("platform.support.manage"); const { id } = await params; const input = supportMessageSchema.parse(await request.json()); return NextResponse.json({ success: true, data: await addSupportMessage(id, input.body, input.isInternal, session.user.id) }); } catch (error) { return handleApiError(error); } }
