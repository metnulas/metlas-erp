import { NextResponse } from "next/server";
import { requirePermission } from "@/server/auth/authorization";
import { handleApiError } from "@/server/errors/handle-api-error";
import { refundPayment } from "@/features/platform/services/billing.service";
import { refundPaymentSchema } from "@/features/platform/validators/billing.schema";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) { try { const session = await requirePermission("payments.manage"); const { id } = await params; const input = refundPaymentSchema.parse(await request.json()); return NextResponse.json({ success: true, data: await refundPayment(id, input.amount, session.user.id) }); } catch (error) { return handleApiError(error); } }
