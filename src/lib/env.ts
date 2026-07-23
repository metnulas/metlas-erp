import { z } from "zod";

const serverEnvironmentSchema = z.object({
  DATABASE_URL: z.string().url(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  METLAS_DEFAULT_TENANT_ID: z.string().min(1).default("metlas-demo"),
  NEXTAUTH_SECRET: z.string().min(32),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function getServerEnvironment(): ServerEnvironment {
  return serverEnvironmentSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    LOG_LEVEL: process.env.LOG_LEVEL,
    METLAS_DEFAULT_TENANT_ID: process.env.METLAS_DEFAULT_TENANT_ID,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  });
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
