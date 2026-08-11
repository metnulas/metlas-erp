import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/server/errors/app-error";
import type { RegisterInput } from "../validators/register.schema";
import { provisionTenant } from "@/server/tenancy/tenant-provisioning";
import { issueEmailVerificationToken } from "./email-verification.service";
import { recordAudit } from "@/server/audit/audit-log";
import { consoleEmailProvider } from "@/features/auth/providers/email-provider";

export async function registerTenant(input: RegisterInput) {
  const captchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  if (captchaSecret) {
    if (!input.captchaToken) throw new AppError("Güvenlik doğrulaması gerekli", 400, "CAPTCHA_REQUIRED");
    const verification = await fetch("https://www.google.com/recaptcha/api/siteverify", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ secret: captchaSecret, response: input.captchaToken }) });
    const result = await verification.json() as { success?: boolean };
    if (!result.success) throw new AppError("Güvenlik doğrulaması başarısız", 400, "CAPTCHA_INVALID");
  }
  const existingUser = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existingUser) throw new AppError("Bu e-posta adresi zaten kayıtlı", 409, "EMAIL_EXISTS");
  try {
    const result = await prisma.$transaction((tx) => provisionTenant(tx, input), { maxWait: 10000, timeout: 20000 });
    const verificationToken = await issueEmailVerificationToken(result.user.id);
    const verificationUrl = `/verify-email?token=${verificationToken}`;
    await consoleEmailProvider.sendVerificationEmail({ email: result.user.email, verificationUrl });
    await recordAudit({ tenantId: result.tenant.id, actorId: result.user.id, action: "TENANT_SELF_SERVICE_REGISTERED", entityType: "Tenant", entityId: result.tenant.id, metadata: { email: result.user.email, plan: "PROFESSIONAL", trialDays: 14 } });
    return { tenantId: result.tenant.id, tenantName: result.tenant.name, email: result.user.email, verificationUrl: process.env.NODE_ENV === "production" ? undefined : verificationUrl };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") throw new AppError("Bu e-posta veya firma bilgisi zaten kayıtlı", 409, "REGISTRATION_CONFLICT");
    throw error;
  }
}
