import { NextResponse } from "next/server";
import { requirePermission } from "@/server/auth/authorization";
import { handleApiError } from "@/server/errors/handle-api-error";
import { createSupportTicket, listSupportTickets } from "@/features/platform/services/support.service";
import { createSupportTicketSchema } from "@/features/platform/validators/support.schema";

export async function GET() { try { await requirePermission("platform.support.manage"); return NextResponse.json({ success: true, data: await listSupportTickets() }); } catch (error) { return handleApiError(error); } }
export async function POST(request: Request) { try { const session = await requirePermission("platform.support.manage"); return NextResponse.json({ success: true, data: await createSupportTicket(createSupportTicketSchema.parse(await request.json()), session.user.id) }, { status: 201 }); } catch (error) { return handleApiError(error); } }
