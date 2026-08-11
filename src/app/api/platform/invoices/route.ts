import { NextResponse } from "next/server";
import { requirePermission } from "@/server/auth/authorization";
import { handleApiError } from "@/server/errors/handle-api-error";
import { generateInvoice, listInvoices } from "@/features/platform/services/billing.service";
import { generateInvoiceSchema } from "@/features/platform/validators/billing.schema";

export async function GET() { try { await requirePermission("invoices.view"); return NextResponse.json({ success: true, data: await listInvoices() }); } catch (error) { return handleApiError(error); } }
export async function POST(request: Request) { try { const session = await requirePermission("invoices.manage"); return NextResponse.json({ success: true, data: await generateInvoice(generateInvoiceSchema.parse(await request.json()), session.user.id) }, { status: 201 }); } catch (error) { return handleApiError(error); } }
