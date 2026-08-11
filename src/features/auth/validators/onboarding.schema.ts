import { z } from "zod";

export const onboardingSchema = z.object({ step: z.coerce.number().int().min(1).max(9), companyName: z.string().trim().min(2).max(120).optional(), phone: z.string().trim().max(24).optional(), address: z.string().trim().max(1000).optional(), taxNumber: z.string().trim().max(32).optional(), logoUrl: z.string().trim().url().max(500).optional().or(z.literal("")), completed: z.boolean().optional() });
