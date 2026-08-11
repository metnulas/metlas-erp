import { NextResponse } from "next/server";
import { handleApiError } from "@/server/errors/handle-api-error";
import { verifyEmailToken } from "@/features/auth/services/email-verification.service";

export async function POST(request: Request) { try { const body = await request.json() as { token?: string }; if (!body.token) return NextResponse.json({ success: false, error: { code: "TOKEN_REQUIRED", message: "Doğrulama tokenı gerekli" } }, { status: 400 }); return NextResponse.json({ success: true, data: await verifyEmailToken(body.token) }); } catch (error) { return handleApiError(error); } }
