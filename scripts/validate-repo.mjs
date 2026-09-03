#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skipRegression = process.argv.includes("--skip-regression");
const issues = [];
const warnings = [];
const pass = (m) => console.log(`PASS ${m}`);
const fail = (m) => { issues.push(m); console.error(`FAIL ${m}`); };
const warn = (m) => { warnings.push(m); console.warn(`WARN ${m}`); };

function walk(dir, pred = () => true) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p, pred));
    else if (pred(p)) out.push(p);
  }
  return out;
}

const policyPath = path.join(root, "policies", "canonical-rules.json");
if (!fs.existsSync(policyPath)) fail("canonical policy registry missing");
const policy = fs.existsSync(policyPath) ? JSON.parse(fs.readFileSync(policyPath, "utf8")) : { rules: [], skill_version: null };
if (policy.skill_version !== "3.0.1") fail(`canonical policy version ${policy.skill_version} != 3.0.1`); else pass("canonical policy version");

const mdFiles = walk(root, (p) => p.endsWith(".md"));
const jsFiles = walk(path.join(root, "scripts"), (p) => /\.m?js$/.test(p) && !p.includes(".backup."));

// 1) Internal Markdown links must resolve.
for (const file of mdFiles) {
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(/\[[^\]]*\]\(([^)]+\.md)(?:#[^)]+)?\)/g)) {
    const ref = m[1];
    if (/^[a-z]+:\/\//i.test(ref)) continue;
    const target = path.resolve(path.dirname(file), ref);
    if (!fs.existsSync(target)) fail(`${path.relative(root,file)} broken link -> ${ref}`);
  }
}
if (!issues.some((x) => x.includes("broken link"))) pass("internal markdown links");

// 1b) Backticked repository code/script references in docs must exist too.
for (const file of mdFiles) {
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(/`((?:scripts|references|policies)\/[A-Za-z0-9_.\/-]+\.(?:mjs|js|json|md))`/g)) {
    const ref = m[1];
    const target = path.join(root, ref);
    if (!fs.existsSync(target)) fail(`${path.relative(root,file)} missing referenced repository file -> ${ref}`);
  }
}
if (!issues.some((x) => x.includes("missing referenced repository file"))) pass("backticked repository references");

// 2) Legacy rules may not re-enter any canonical docs.
const scanFiles = [path.join(root,"SKILL.md"), ...walk(path.join(root,"references"),(p)=>p.endsWith(".md"))];
for (const rule of policy.rules || []) {
  for (const legacy of rule.forbidden_legacy || []) {
    const needle = legacy.toLowerCase();
    for (const file of scanFiles) {
      const text = fs.readFileSync(file,"utf8").toLowerCase();
      if (text.includes(needle)) fail(`${rule.id}: forbidden legacy wording in ${path.relative(root,file)}: ${legacy}`);
    }
  }
}
if (!issues.some((x)=>x.includes("forbidden legacy"))) pass("legacy-rule resurrection scan");

// 2b) Required canonical rule anchors make cross-file drift machine-detectable.
for (const rule of policy.rules || []) {
  for (const rel of rule.required_docs || []) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) { fail(`${rule.id}: required document missing ${rel}`); continue; }
    const marker = `<!-- RULE:${rule.id} -->`;
    if (!fs.readFileSync(file, "utf8").includes(marker)) fail(`${rule.id}: canonical anchor missing from ${rel}`);
  }
}
if (!issues.some((x)=>x.includes("canonical anchor missing from") || x.includes("required document missing"))) pass("canonical rule anchor coverage");

// 3) Canonical cross-document anchors that must agree semantically.
const skill = fs.readFileSync(path.join(root,"SKILL.md"),"utf8");
const output = fs.readFileSync(path.join(root,"references","output-schema.md"),"utf8");
const camera = fs.readFileSync(path.join(root,"references","camera-vocabulary.md"),"utf8");
for (const [label, text] of [["SKILL.md",skill],["output-schema.md",output],["camera-vocabulary.md",camera]]) {
  if (!/dominant camera intention|主导摄影意图|dominant camera move/i.test(text)) fail(`${label}: missing CAMERA.INTENT canonical anchor`);
}
if (!/world state is authoritative|世界状态.*权威|世界状态优先/i.test(skill + "\n" + fs.readFileSync(path.join(root,"references","continuity-validator.md"),"utf8"))) {
  fail("WORLD_FIRST canonical anchor missing");
}
if (!issues.some((x)=>x.includes("canonical anchor"))) pass("cross-document canonical anchors");

// 4) Model adapter scopes must remain local.
const adapters = ["wan-3.0-adapter.md","minimax-h3-adapter.md","kling-adapter.md","seedance-adapter.md"];
for (const name of adapters) {
  const file=path.join(root,"references",name);
  if (!fs.existsSync(file)) { fail(`adapter missing ${name}`); continue; }
  const text=fs.readFileSync(file,"utf8");
  if (!/(only when|仅当|selected|target model|profile)/i.test(text.slice(0,1200))) warn(`${name}: scope declaration is not explicit near top`);
}
const defect = fs.readFileSync(path.join(root,"references","model-defect-compensation.md"),"utf8");
if (!/Never promote it to another model|不得.*跨模型|untested model.*EXPERIMENTAL/is.test(defect)) fail("model defect compensation lost cross-model scope guard");
else pass("model-specific scope guard");

// 4b) Model-claim provenance registry must be current enough and structurally complete.
const modelClaimsPath = path.join(root, "policies", "model-claims.json");
if (!fs.existsSync(modelClaimsPath)) {
  fail("model claim provenance registry missing");
} else {
  let registry = null;
  try { registry = JSON.parse(fs.readFileSync(modelClaimsPath, "utf8")); }
  catch (err) { fail(`model claim provenance registry invalid JSON: ${err.message}`); }
  if (registry) {
    const snapshot = new Date(`${registry.snapshot_date}T00:00:00Z`);
    const ageDays = Number.isFinite(snapshot.getTime()) ? Math.floor((Date.now() - snapshot.getTime()) / 86400000) : Infinity;
    if (!Number.isFinite(snapshot.getTime())) fail("model claim snapshot_date is invalid");
    else if (ageDays < -1) fail(`model claim snapshot_date is in the future (${registry.snapshot_date})`);
    else if (ageDays > 60) fail(`model claim snapshot is stale (${ageDays} days > 60)`);
    const expected = ["Seedance 2.5", "Wan 3.0", "MiniMax H3", "Kling 3.x"];
    for (const name of expected) {
      const item = registry.models?.[name];
      if (!item) { fail(`model claim registry missing ${name}`); continue; }
      if (!Array.isArray(item.claims) || item.claims.length === 0) fail(`${name}: claim list missing/empty`);
      if (!Array.isArray(item.volatile)) fail(`${name}: volatile list missing`);
      if (item.status === "official-snapshot" && (!Array.isArray(item.sources) || item.sources.length === 0)) fail(`${name}: official snapshot has no source URLs`);
      for (const url of item.sources || []) if (!/^https:\/\//.test(url)) fail(`${name}: invalid source URL ${url}`);
    }
    if (!issues.some((x)=>x.includes("model claim" ) || x.includes("claim list") || x.includes("volatile list") || x.includes("official snapshot") || x.includes("invalid source URL"))) pass(`model claim provenance registry (${ageDays}d old)`);
  }
}

// 4c) Undocumented prompt-count formulas must not reappear in model adapters.
for (const name of adapters) {
  const text = fs.readFileSync(path.join(root,"references",name),"utf8");
  const formulaPatterns = [
    /\b\d+\s*[–-]\s*\d+\s+words?\b/i,
    /\b\d+\s*[–-]\s*\d+\s+(?:actions?|nouns?)\b/i,
    /(?:动作|名词).{0,12}\d+\s*[–-]\s*\d+/i,
  ];
  for (const re of formulaPatterns) if (re.test(text)) fail(`${name}: undocumented prompt-count formula detected: ${re}`);
}
if (!issues.some((x)=>x.includes("undocumented prompt-count formula"))) pass("adapter prompt-count formula guard");

// 5) Validator/docs/test version and advertised counts must stay synchronized.
const validator = fs.readFileSync(path.join(root,"scripts","validate-storyboard.mjs"),"utf8");
const continuityDoc = fs.readFileSync(path.join(root,"references","continuity-validator.md"),"utf8");
const test = fs.readFileSync(path.join(root,"scripts","test-validator.mjs"),"utf8");
if (!validator.includes('validator_version: "3.0.1"')) fail("validator report version mismatch");
if (!/Validator version \*\*3\.0\.1\*\*/.test(continuityDoc)) fail("continuity-validator.md version mismatch");
if (!test.includes("44 fixed + 300 mutation = 344 cases")) fail("test summary count mismatch");
if (!issues.some((x)=>x.includes("version mismatch")||x.includes("summary count"))) pass("version/test-count synchronization");

// 6) JavaScript syntax checks.
for (const file of jsFiles) {
  const out=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
  if (out.status!==0) fail(`${path.relative(root,file)} syntax: ${out.stderr.trim()}`);
}
if (!issues.some((x)=>x.includes("syntax:"))) pass("JavaScript syntax");

// 7) Full validator regression suite. --skip-regression exists only for repository-gate mutation self-tests.
if (!skipRegression) {
  const suite=spawnSync(process.execPath,[path.join(root,"scripts","test-validator.mjs")],{encoding:"utf8",maxBuffer:20*1024*1024});
  if (suite.status!==0) fail(`continuity regression suite\n${suite.stdout}\n${suite.stderr}`);
  else if (!suite.stdout.includes("344 cases")) fail("continuity regression suite ran but did not reach advertised 337-case gate");
  else pass("continuity regression suite (344 cases)");
} else {
  pass("continuity regression suite skipped for gate self-test");
}

// 8) No development backups/temp test files may ship.
for (const file of walk(root)) {
  const rel=path.relative(root,file);
  if (/\.backup\.|\.tmp_|\.tmp$|~$/.test(rel)) fail(`development artifact would ship: ${rel}`);
}
if (!issues.some((x)=>x.includes("development artifact"))) pass("release artifact hygiene");

console.log(`\nRepository validation: ${issues.length} error(s), ${warnings.length} warning(s)`);
if (warnings.length) warnings.forEach((x)=>console.log(`- WARN ${x}`));
if (issues.length) {
  issues.forEach((x)=>console.error(`- ERROR ${x}`));
  process.exit(1);
}
console.log("PASS: repository consistency gate completed.");
