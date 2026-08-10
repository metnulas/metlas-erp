import assert from "node:assert/strict";
import test from "node:test";
import { hasPermission } from "../src/server/auth/authorization";

test("permission snapshot yalnızca kendisine verilen yetkileri kabul eder", () => {
  const permissions = ["orders.view", "orders.create", "routes.manage"];
  assert.equal(hasPermission(permissions, "orders.view"), true);
  assert.equal(hasPermission(permissions, "orders.delete"), false);
  assert.equal(hasPermission(permissions, "routes.manage"), true);
  assert.equal(hasPermission([], "orders.view"), false);
});
