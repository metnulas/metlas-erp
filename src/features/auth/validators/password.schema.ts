import { z } from "zod";
import { passwordSchema } from "./register.schema";

export const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: passwordSchema, confirmation: z.string() }).refine((input) => input.newPassword === input.confirmation, { path: ["confirmation"], message: "Şifreler eşleşmiyor" });
