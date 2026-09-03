#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let count=0;
function mutateCase(name, mutate, expected) {
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),`beidou-repo-gate-${name}-`));
  const copy=path.join(tmp,"beidou-ask");
  fs.cpSync(root,copy,{recursive:true});
  mutate(copy);
  const out=spawnSync(process.execPath,[path.join(copy,"scripts","validate-repo.mjs"),"--skip-regression"],{encoding:"utf8",maxBuffer:8*1024*1024});
  const combined=`${out.stdout}\n${out.stderr}`;
  if (out.status===0 || !combined.includes(expected)) {
    console.error(`FAIL gate-self-test ${name}: expected failure containing ${expected}\n${combined}`);
    process.exit(1);
  }
  count += 1;
  console.log(`PASS gate-self-test ${name}`);
}

mutateCase("legacy-rule", (r)=>{
  const p=path.join(r,"references","camera-vocabulary.md");
  fs.appendFileSync(p,"\nEvery shot has exactly one primary camera move\n");
}, "forbidden legacy wording");

mutateCase("missing-rule-anchor", (r)=>{
  const p=path.join(r,"references","output-schema.md");
  fs.writeFileSync(p,fs.readFileSync(p,"utf8").replace("<!-- RULE:CAMERA.INTENT -->",""));
}, "canonical anchor missing from references/output-schema.md");

mutateCase("broken-link", (r)=>{
  fs.appendFileSync(path.join(r,"SKILL.md"),"\n[broken](references/definitely-missing.md)\n");
}, "broken link");

mutateCase("version-drift", (r)=>{
  const p=path.join(r,"scripts","validate-storyboard.mjs");
  fs.writeFileSync(p,fs.readFileSync(p,"utf8").replace('validator_version: "3.0.1"','validator_version: "2.9.9"'));
}, "validator report version mismatch");

mutateCase("release-temp-artifact", (r)=>{
  fs.writeFileSync(path.join(r,"references","notes.tmp"),"temporary");
}, "development artifact would ship");

mutateCase("model-scope-guard", (r)=>{
  const p=path.join(r,"references","model-defect-compensation.md");
  let t=fs.readFileSync(p,"utf8");
  t=t.replace(/Never promote it to another model merely by analogy\./,"Cross-model behavior may differ.");
  t=t.replace(/On an untested model, the same wording may be tried only as an `EXPERIMENTAL` heuristic and should not become a hard invariant until reproduced\./,"Untested models may vary.");
  fs.writeFileSync(p,t);
}, "model defect compensation lost cross-model scope guard");

mutateCase("missing-script-reference", (r)=>{
  fs.appendFileSync(path.join(r,"SKILL.md"),"\nRun `scripts/definitely-missing.mjs` before release.\n");
}, "missing referenced repository file");

mutateCase("stale-model-claims", (r)=>{
  const p=path.join(r,"policies","model-claims.json");
  const data=JSON.parse(fs.readFileSync(p,"utf8"));
  data.snapshot_date="2020-01-01";
  fs.writeFileSync(p,JSON.stringify(data,null,2)+"\n");
}, "model claim snapshot is stale");

mutateCase("undocumented-adapter-formula", (r)=>{
  const p=path.join(r,"references","kling-adapter.md");
  fs.appendFileSync(p,"\nFor best results keep 30-60 words per shot.\n");
}, "undocumented prompt-count formula detected");

console.log(`PASS: repository gate self-tests (${count} mutation cases).`);
