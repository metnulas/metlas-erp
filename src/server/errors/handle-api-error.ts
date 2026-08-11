import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AppError } from "./app-error";
import { logger } from "@/server/logger/logger";

export function handleApiError(error: unknown) {
  if (error instanceof SyntaxError) {
    return NextResponse.json({ success: false, error: { code: "INVALID_JSON", message: "Geçersiz JSON isteği." } }, { status: 400 });
  }
  if (error instanceof z.ZodError || (typeof error === "object" && error !== null && "issues" in error)) {
    const issues = error instanceof z.ZodError ? error.issues : Array.isArray(error.issues) ? error.issues as { message?: string }[] : [];
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: issues[0]?.message ?? "Girilen bilgiler geçersiz.", details: issues } },
      { status: 400 },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json({ success: false, error: { code: error.code, message: error.message } }, { status: error.statusCode });
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json({ success: false, error: { code: "DATABASE_UNAVAILABLE", message: "Veritabanı bağlantısı kurulamadı." } }, { status: 503 });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return NextResponse.json({ success: false, error: { code: "DATABASE_ERROR", message: "Veritabanı işlemi başarısız." } }, { status: 500 });
  }

  logger.error("API isteği başarısız", { error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined });
  return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Beklenmeyen bir hata oluştu." } }, { status: 500 });
}
