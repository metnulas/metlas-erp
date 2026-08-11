import { NextResponse } from "next/server";
import { handleApiError } from "@/server/errors/handle-api-error";
import { resendEmailVerification } from "@/features/auth/services/email-verification.service";

export async function POST(request: Request) { try { const body = await request.json() as { email?: string }; if (!body.email) return NextResponse.json({ success: false, error: { code: "EMAIL_REQUIRED", message: "E-posta gerekli" } }, { status: 400 }); return NextResponse.json({ success: true, data: await resendEmailVerification(body.email) }); } catch (error) { return handleApiError(error); } }
