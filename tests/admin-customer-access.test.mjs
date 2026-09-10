import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const src = new URL("../src/", import.meta.url);
const read = (path) => readFileSync(new URL(path, src), "utf8");

test("customers and orders share one operations entry point", () => {
  const shell = read("routes/admin.tsx");
  const tabs = read("components/admin/CustomerAccessTabs.tsx");

  assert.match(shell, /Customers & access/);
  assert.doesNotMatch(shell, /label: "Access & orders"/);
  assert.match(tabs, /\/admin\/customers/);
  assert.match(tabs, /\/admin\/orders/);
});

test("both operational views expose the shared tabs", () => {
  assert.match(read("routes/admin.customers.tsx"), /CustomerAccessTabs current="customers"/);
  assert.match(read("routes/admin.orders.tsx"), /CustomerAccessTabs current="orders"/);
});

test("orders reserve layout and never present loading zeroes as real data", () => {
  const orders = read("routes/admin.orders.tsx");
  assert.match(orders, /loading \? "Loading order history"/);
  assert.match(orders, /AdminLoadingState variant="list"/);
});
