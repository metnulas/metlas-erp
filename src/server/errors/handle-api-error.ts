import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AppError } from "./app-error";

export function handleApiError(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Girilen bilgiler geçersiz.", details: error.issues } },
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

  return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Beklenmeyen bir hata oluştu." } }, { status: 500 });
}
