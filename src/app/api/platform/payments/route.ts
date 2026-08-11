import { NextResponse } from "next/server";
import { requirePermission } from "@/server/auth/authorization";
import { handleApiError } from "@/server/errors/handle-api-error";
import { createPayment, listPayments } from "@/features/platform/services/billing.service";
import { createPaymentSchema } from "@/features/platform/validators/billing.schema";

export async function GET() { try { await requirePermission("payments.view"); return NextResponse.json({ success: true, data: await listPayments() }); } catch (error) { return handleApiError(error); } }
export async function POST(request: Request) { try { const session = await requirePermission("payments.manage"); return NextResponse.json({ success: true, data: await createPayment(createPaymentSchema.parse(await request.json()), session.user.id) }, { status: 201 }); } catch (error) { return handleApiError(error); } }
