import { NextResponse } from "next/server";
import { requirePermission } from "@/server/auth/authorization";
import { handleApiError } from "@/server/errors/handle-api-error";
import { listSubscriptions, upsertTenantSubscription } from "@/features/platform/services/subscription.service";
import { subscriptionSchema } from "@/features/platform/validators/subscription.schema";

export async function GET() { try { await requirePermission("subscriptions.view"); return NextResponse.json({ success: true, data: await listSubscriptions() }); } catch (error) { return handleApiError(error); } }
export async function POST(request: Request) { try { const session = await requirePermission("subscriptions.manage"); return NextResponse.json({ success: true, data: await upsertTenantSubscription(subscriptionSchema.parse(await request.json()), session.user.id) }); } catch (error) { return handleApiError(error); } }
