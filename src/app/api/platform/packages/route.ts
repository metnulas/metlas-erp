import { NextResponse } from "next/server";
import { requirePermission } from "@/server/auth/authorization";
import { handleApiError } from "@/server/errors/handle-api-error";
import { createPackage, listPackages } from "@/features/platform/services/subscription.service";
import { packageSchema } from "@/features/platform/validators/subscription.schema";

export async function GET() { try { await requirePermission("packages.view"); return NextResponse.json({ success: true, data: await listPackages() }); } catch (error) { return handleApiError(error); } }
export async function POST(request: Request) { try { const session = await requirePermission("packages.manage"); const input = packageSchema.parse(await request.json()); return NextResponse.json({ success: true, data: await createPackage(input, session.user.id) }, { status: 201 }); } catch (error) { return handleApiError(error); } }
