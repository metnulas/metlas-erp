import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/server/errors/handle-api-error";
import { registerSchema } from "@/features/auth/validators/register.schema";
import { registerTenant } from "@/features/auth/services/register.service";

export async function POST(request: NextRequest) {
  try {
    const input = registerSchema.parse(await request.json());
    const result = await registerTenant(input);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
