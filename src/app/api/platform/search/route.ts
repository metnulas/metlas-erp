import { NextResponse } from "next/server";
import { requirePermission } from "@/server/auth/authorization";
import { handleApiError } from "@/server/errors/handle-api-error";
import { searchPlatform } from "@/features/platform/services/global-search.service";
import { globalSearchSchema } from "@/features/platform/validators/global-search.schema";

export async function GET(request: Request) {
  try {
    await requirePermission("platform.view");
    const q = new URL(request.url).searchParams.get("q") ?? "";
    return NextResponse.json({ success: true, data: await searchPlatform(globalSearchSchema.parse({ q })) });
  } catch (error) { return handleApiError(error); }
}
