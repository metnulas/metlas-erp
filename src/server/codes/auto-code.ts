export async function nextTenantCode(prefix: string, existingCount: number, exists: (code: string) => Promise<boolean>) {
  let sequence = existingCount + 1;
  while (await exists(`${prefix}-${String(sequence).padStart(4, "0")}`)) sequence += 1;
  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}
