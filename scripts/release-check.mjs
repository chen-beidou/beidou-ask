#!/usr/bin/env node
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const steps = [
  ["repository consistency + full validator regression", path.join(root, "scripts", "validate-repo.mjs")],
  ["repository-gate mutation self-tests", path.join(root, "scripts", "test-repo-gate.mjs")],
];

for (const [label, script] of steps) {
  console.log(`\n=== ${label} ===`);
  const out = spawnSync(process.execPath, [script], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  if (out.stdout) process.stdout.write(out.stdout);
  if (out.stderr) process.stderr.write(out.stderr);
  if (out.status !== 0) {
    console.error(`RELEASE BLOCKED: ${label} failed.`);
    process.exit(out.status || 1);
  }
}
console.log("\nPASS: full beidou-ask release gate completed.");
