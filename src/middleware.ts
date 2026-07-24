import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("next-auth.session-token")?.value
    || request.cookies.get("__Secure-next-auth.session-token")?.value;

  if (sessionToken) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHENTICATED", message: "Oturum acmaniz gerekiyor." } },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)"] };
