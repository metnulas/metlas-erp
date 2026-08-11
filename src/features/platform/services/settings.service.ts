import { prisma } from "@/lib/db/prisma";
import { recordAudit } from "@/server/audit/audit-log";
import type { UpdateSettingsInput } from "@/features/platform/validators/settings.schema";

const maskedValue = "••••••••";
const defaultSettings = [
  ["smtp.host", "SMTP sunucusu", "SMTP", false], ["smtp.port", "SMTP portu", "SMTP", false], ["smtp.username", "SMTP kullanıcı adı", "SMTP", false], ["smtp.password", "SMTP şifresi", "SMTP", true],
  ["sms.provider", "SMS sağlayıcısı", "SMS", false], ["mail.from", "Gönderici e-posta", "MAIL", false], ["storage.provider", "Storage sağlayıcısı", "STORAGE", false], ["cloud.provider", "Cloud sağlayıcısı", "CLOUD", false],
  ["backup.enabled", "Backup aktif", "BACKUP", false], ["queue.provider", "Queue sağlayıcısı", "QUEUE", false], ["cron.enabled", "Cron aktif", "CRON", false], ["cache.provider", "Cache sağlayıcısı", "CACHE", false], ["ai.provider", "AI sağlayıcısı", "AI", false],
  ["branding.siteName", "Site adı", "BRANDING", false], ["branding.logoUrl", "Logo URL", "BRANDING", false], ["branding.faviconUrl", "Favicon URL", "BRANDING", false], ["system.maintenanceMode", "Bakım modu", "SYSTEM", false],
] as const;

async function ensureDefaults() {
  await prisma.platformSetting.createMany({ data: defaultSettings.map(([key, label, category, isSecret]) => ({ key, label, category, value: "", isSecret })), skipDuplicates: true });
}

export async function listPlatformSettings() {
  await ensureDefaults();
  const settings = await prisma.platformSetting.findMany({ where: { isActive: true }, orderBy: [{ category: "asc" }, { key: "asc" }] });
  return settings.map((setting) => ({ ...setting, value: setting.isSecret && setting.value ? maskedValue : setting.value }));
}

export async function updatePlatformSettings(input: UpdateSettingsInput, actorId: string) {
  await ensureDefaults();
  const keys = input.settings.map((setting) => setting.key);
  const existing = await prisma.platformSetting.findMany({ where: { key: { in: keys } } });
  const existingByKey = new Map(existing.map((setting) => [setting.key, setting]));
  const changed = [] as string[];
  for (const setting of input.settings) {
    const current = existingByKey.get(setting.key);
    if (!current) continue;
    const value = current.isSecret && setting.value === maskedValue ? current.value : setting.value;
    if (value !== current.value) changed.push(setting.key);
    await prisma.platformSetting.update({ where: { key: setting.key }, data: { value, updatedBy: actorId } });
  }
  await recordAudit({ tenantId: null, actorId, action: "PLATFORM_SETTINGS_UPDATE", entityType: "PlatformSetting", entityId: changed.join(",") || "NONE", metadata: { changedKeys: changed } });
  return listPlatformSettings();
}
