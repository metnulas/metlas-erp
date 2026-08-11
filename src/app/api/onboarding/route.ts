import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { handleApiError } from "@/server/errors/handle-api-error";
import { onboardingSchema } from "@/features/auth/validators/onboarding.schema";

export async function GET() { try { const session = await getServerSession(authOptions); if (!session?.user?.tenantId) return NextResponse.json({ success: false, error: { code: "TENANT_REQUIRED", message: "Tenant oturumu gerekli" } }, { status: 401 }); const tenant = await prisma.tenant.findUnique({ where: { id: session.user.tenantId }, select: { name: true, phone: true, address: true, taxNumber: true, logoUrl: true, onboardingStep: true, onboardingCompletedAt: true } }); return NextResponse.json({ success: true, data: tenant }); } catch (error) { return handleApiError(error); } }
export async function PUT(request: Request) { try { const session = await getServerSession(authOptions); if (!session?.user?.tenantId) return NextResponse.json({ success: false, error: { code: "TENANT_REQUIRED", message: "Tenant oturumu gerekli" } }, { status: 401 }); const input = onboardingSchema.parse(await request.json()); const tenant = await prisma.tenant.update({ where: { id: session.user.tenantId }, data: { name: input.companyName, phone: input.phone, address: input.address, taxNumber: input.taxNumber, logoUrl: input.logoUrl || null, onboardingStep: input.completed ? 9 : input.step, onboardingCompletedAt: input.completed ? new Date() : undefined } }); return NextResponse.json({ success: true, data: tenant }); } catch (error) { return handleApiError(error); } }
