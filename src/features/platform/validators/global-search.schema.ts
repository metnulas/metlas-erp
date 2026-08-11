import { z } from "zod";

export const globalSearchSchema = z.object({ q: z.string().trim().min(2).max(100) });
export type GlobalSearchInput = z.infer<typeof globalSearchSchema>;
