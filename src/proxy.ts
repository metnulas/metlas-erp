import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function pagePermission(pathname: string) {
  if (pathname === "/") return "dashboard.view";
  if (pathname.startsWith("/platform")) return "platform.view";
  if (pathname.startsWith("/customers")) return "customers.view";
  if (pathname.startsWith("/orders")) return "orders.view";
  if (pathname.startsWith("/products")) return "products.view";
  if (pathname.startsWith("/vehicles")) return "vehicles.view";
  if (pathname.startsWith("/personnel")) return "personnel.view";
  if (pathname.startsWith("/deliveries")) return "routes.view";
  if (pathname.startsWith("/route-histories")) return "routes.view";
  if (pathname.startsWith("/reports")) return "reports.view";
  if (pathname.startsWith("/audit-logs")) return "audit.view";
  if (pathname.startsWith("/roles")) return "roles.view";
  if (pathname.startsWith("/users")) return "users.view";
  return null;
}

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET, cookieName: "next-auth.session-token" });
  const publicPages = ["/", "/features", "/pricing", "/about", "/contact", "/faq", "/blog", "/verify-email"];
  if (!token?.userId && publicPages.includes(request.nextUrl.pathname)) return NextResponse.next();

  if (token?.userId) {
    const isPasswordChangePath = request.nextUrl.pathname.startsWith("/account/password") || request.nextUrl.pathname.startsWith("/api/account/password");
    const isVerificationPath = request.nextUrl.pathname.startsWith("/verify-email") || request.nextUrl.pathname.startsWith("/api/auth/verify-email") || request.nextUrl.pathname.startsWith("/api/auth/resend-verification");
    const isSubscriptionPath = request.nextUrl.pathname.startsWith("/subscription") || request.nextUrl.pathname.startsWith("/api/subscription");
    const isOnboardingPath = request.nextUrl.pathname.startsWith("/onboarding") || request.nextUrl.pathname.startsWith("/api/onboarding");
    if (token.mustChangePassword && !isPasswordChangePath) return NextResponse.redirect(new URL("/account/password", request.url));
    if (token.tenantId && !token.emailVerified && !isVerificationPath && !request.nextUrl.pathname.startsWith("/api/auth")) return NextResponse.redirect(new URL("/verify-email", request.url));
    if (token.tenantId && token.emailVerified && !token.onboardingCompleted && !isOnboardingPath && !isSubscriptionPath) return NextResponse.redirect(new URL("/onboarding", request.url));
    const trialExpired = token.tenantId && token.subscriptionStatus === "TRIAL" && token.trialEndsAt && new Date(token.trialEndsAt).getTime() <= Date.now();
    if (trialExpired && !isSubscriptionPath && !isVerificationPath && !isPasswordChangePath) return NextResponse.redirect(new URL("/subscription", request.url));
    if (!token.tenantId && !request.nextUrl.pathname.startsWith("/platform") && !request.nextUrl.pathname.startsWith("/api/platform") && !isPasswordChangePath && !request.nextUrl.pathname.startsWith("/api/auth")) return NextResponse.redirect(new URL("/platform", request.url));
    const permission = request.nextUrl.pathname.startsWith("/api/") ? null : pagePermission(request.nextUrl.pathname);
    if (!permission || token.permissions?.includes(permission)) return NextResponse.next();
    const forbiddenUrl = new URL("/403", request.url);
    forbiddenUrl.searchParams.set("permission", permission);
    return NextResponse.redirect(forbiddenUrl);
  }

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

export const config = { matcher: ["/((?!api/auth|api/register|login|register|403|_next|__nextjs|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)"] };
