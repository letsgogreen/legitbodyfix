import assert from "node:assert/strict";
import test from "node:test";
import { matchesDiscoveryRegion } from "../src/lib/discovery-program-regions.ts";

test("ankle recovery is not a knee program despite secondary catalog tags", () => {
  const program = { slug: "ankle-recovery", regions: ["ankle-foot", "knee"] };
  assert.equal(matchesDiscoveryRegion(program, "knee"), false);
  assert.equal(matchesDiscoveryRegion(program, "ankle-foot"), true);
});

test("other programs retain their own region assignments", () => {
  assert.equal(matchesDiscoveryRegion({ slug: "knee-program", regions: ["knee"] }, "knee"), true);
  assert.equal(matchesDiscoveryRegion({ slug: "shoulder-movement", regions: ["shoulder-arm", "spine-ribs"] }, "shoulder-arm"), true);
  assert.equal(matchesDiscoveryRegion({ slug: "shoulder-movement", regions: ["spine-ribs"] }, "spine-rib-cage"), true);
  assert.equal(matchesDiscoveryRegion({ slug: "unknown", regions: null }, "knee"), false);
});
