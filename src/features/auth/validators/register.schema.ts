import { z } from "zod";

const phoneSchema = z.string().trim().min(7).max(24).regex(/^[+()\-\s\d]+$/, "Telefon formatı geçersiz");
export const passwordSchema = z.string().min(8, "Şifre en az 8 karakter olmalıdır").max(128).regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir").regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir").regex(/\d/, "Şifre en az bir rakam içermelidir").regex(/[^A-Za-z0-9]/, "Şifre en az bir özel karakter içermelidir");

export const registerSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  companySlug: z.string().trim().min(2, "Firma kısa adı en az 2 karakter olmalıdır").max(70, "Firma kısa adı en fazla 70 karakter olabilir"),
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  phone: phoneSchema,
  password: passwordSchema,
  passwordConfirmation: z.string(),
  kvkkAccepted: z.literal(true, { error: "KVKK metnini kabul etmelisiniz" }),
  termsAccepted: z.literal(true, { error: "Kullanım koşullarını kabul etmelisiniz" }),
  captchaToken: z.string().optional(),
}).refine((input) => input.password === input.passwordConfirmation, { path: ["passwordConfirmation"], message: "Şifreler eşleşmiyor" });

export type RegisterInput = z.infer<typeof registerSchema>;
