import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/server/errors/app-error";
import { consoleEmailProvider } from "@/features/auth/providers/email-provider";

const tokenLifetimeMs = 24 * 60 * 60 * 1000;

function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }

export async function issueEmailVerificationToken(userId: string) {
  const rawToken = randomBytes(32).toString("hex");
  await prisma.emailVerificationToken.deleteMany({ where: { userId, usedAt: null } });
  await prisma.emailVerificationToken.create({ data: { userId, tokenHash: hashToken(rawToken), expiresAt: new Date(Date.now() + tokenLifetimeMs) } });
  return rawToken;
}

export async function verifyEmailToken(rawToken: string) {
  const token = await prisma.emailVerificationToken.findUnique({ where: { tokenHash: hashToken(rawToken) } });
  if (!token || token.usedAt || token.expiresAt < new Date()) throw new AppError("Doğrulama bağlantısı geçersiz veya süresi dolmuş", 400, "EMAIL_TOKEN_INVALID");
  await prisma.$transaction([
    prisma.emailVerificationToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: token.userId }, data: { emailVerifiedAt: new Date() } }),
  ]);
  return { verified: true };
}

export async function resendEmailVerification(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() }, select: { id: true, emailVerifiedAt: true } });
  if (!user || user.emailVerifiedAt) return { sent: true };
  const token = await issueEmailVerificationToken(user.id);
  const verificationUrl = `/verify-email?token=${token}`;
  await consoleEmailProvider.sendVerificationEmail({ email: email.trim().toLowerCase(), verificationUrl });
  return { sent: true, verificationUrl: process.env.NODE_ENV === "production" ? undefined : verificationUrl };
}
