import { NextResponse } from "next/server";
import { requirePermission } from "@/server/auth/authorization";
import { handleApiError } from "@/server/errors/handle-api-error";
import { getInvoice } from "@/features/platform/services/billing.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) { try { await requirePermission("invoices.view"); const { id } = await params; return NextResponse.json({ success: true, data: await getInvoice(id) }); } catch (error) { return handleApiError(error); } }
