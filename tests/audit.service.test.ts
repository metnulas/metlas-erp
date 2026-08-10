import assert from "node:assert/strict";
import test from "node:test";
import { createAuditService, type AuditService } from "../src/features/audit/services/audit.service";
import type { AuditRepository } from "../src/features/audit/repositories/audit.repository";

test("audit listesi tenant ID'sini her repository çağrısına aktarır", async () => {
  let requestedTenant = "";
  const repository: AuditRepository = {
    async findMany(tenantId) { requestedTenant = tenantId; return []; },
    async count(tenantId) { assert.equal(tenantId, "tenant-a"); return 0; },
  };
  const service: AuditService = createAuditService(repository);
  const result = await service.list("tenant-a", { page: 1, pageSize: 25 });
  assert.equal(requestedTenant, "tenant-a");
  assert.deepEqual(result.data, []);
  assert.equal(result.totalPages, 0);
});
