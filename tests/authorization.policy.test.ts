import assert from "node:assert/strict";
import test from "node:test";
import { roleHasPermission } from "../src/server/auth/authorization";

test("roller yalnızca tanımlı permission'lara erişebilir", () => {
  assert.equal(roleHasPermission("ADMIN", "audit:read"), true);
  assert.equal(roleHasPermission("OPERATIONS", "order:write"), true);
  assert.equal(roleHasPermission("COURIER", "delivery:write"), true);
  assert.equal(roleHasPermission("COURIER", "order:write"), false);
  assert.equal(roleHasPermission("ACCOUNTING", "product:read"), true);
  assert.equal(roleHasPermission("ACCOUNTING", "stock:write"), false);
  assert.equal(roleHasPermission("UNKNOWN", "order:read"), false);
});
