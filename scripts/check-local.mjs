import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const checks = [
  ["TypeScript", ["node_modules/typescript/bin/tsc", "--noEmit", "--pretty", "false"]],
  ["Offline regression tests", ["--test",
    "tests/body-region-navigation.test.js",
    "tests/program-price-refresh.test.js",
    "tests/program-thumbnail-visibility.test.js",
    "tests/lesson-thumbnail-selection.test.js",
    "tests/image-upload-lifecycle.test.js",
    "tests/content-image-server.test.js",
    "tests/lesson-video-readiness.test.js",
    "tests/customer-access-routing.test.js",
  ]],
  ["Muscle navigation", ["scripts/test-muscle-navigation.cjs"]],
  ["Magic-link template", ["scripts/test-magic-link-template.mjs"]],
  ["Production build", ["node_modules/vite/bin/vite.js", "build"]],
];

for (const [label, args] of checks) {
  console.log(`\nRunning: ${label}`);
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: "inherit" });
  if (result.error || result.status !== 0) {
    console.error(`${label} failed.`, result.error?.message ?? result.signal ?? "");
    process.exit(result.status || 1);
  }
}
console.log("\nAll local checks passed. Live services, browser rendering and deployment are not verified.");
