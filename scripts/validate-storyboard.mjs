#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node validate-storyboard.mjs <storyboard.md>");
  process.exit(2);
}

const resolved = path.resolve(file);
if (!fs.existsSync(resolved)) {
  console.error(`File not found: ${resolved}`);
  process.exit(2);
}

const source = fs.readFileSync(resolved, "utf8");
const errors = [];
const warnings = [];

const clipHeader = /^###\s+Clip\s+(\d+)\s*｜\s*(\d+(?:\.\d+)?)秒\s*｜\s*(16:9|9:16)\s*｜\s*([^\n]+)$/gm;
const clips = [];
let match;
while ((match = clipHeader.exec(source)) !== null) {
  clips.push({
    number: Number(match[1]),
    duration: Number(match[2]),
    ratio: match[3],
    descriptor: match[4].trim(),
    start: match.index,
    bodyStart: clipHeader.lastIndex,
  });
}

if (clips.length === 0) {
  errors.push("No valid Clip header found. Expected: ### Clip 01｜15秒｜9:16｜对峙模式｜真人写实");
}

const assetCard = source.slice(0, clips[0]?.start ?? source.length);
const definedAssets = new Set([...assetCard.matchAll(/\|\s*(@[\p{L}\p{N}_-]+)\s*\|/gu)].map((m) => m[1]));

clips.forEach((clip, index) => {
  const end = index + 1 < clips.length ? clips[index + 1].start : source.length;
  const body = source.slice(clip.bodyStart, end);
  const label = `Clip ${String(clip.number).padStart(2, "0")}`;

  const spatialCount = (body.match(/^空间站位：/gm) || []).length;
  const endingCount = (body.match(/^结尾状态：/gm) || []).length;
  const constraintCount = (body.match(/^约束：/gm) || []).length;
  if (spatialCount !== 1) errors.push(`${label}: expected exactly one 空间站位 block, found ${spatialCount}`);
  if (endingCount !== 1) errors.push(`${label}: expected exactly one 结尾状态 block, found ${endingCount}`);
  if (constraintCount !== 1) errors.push(`${label}: expected exactly one 约束 block, found ${constraintCount}`);

  const shotRegex = /^镜头([^（\n]+)（(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)秒）：(.+)$/gm;
  const shots = [];
  let shot;
  while ((shot = shotRegex.exec(body)) !== null) {
    shots.push({ number: shot[1], start: Number(shot[2]), end: Number(shot[3]), line: shot[4] });
  }
  if (shots.length === 0) {
    errors.push(`${label}: no timestamped shots found`);
    return;
  }

  if (shots[0].start !== 0) errors.push(`${label}: first shot starts at ${shots[0].start}, expected 0`);
  for (let i = 0; i < shots.length; i += 1) {
    const current = shots[i];
    if (current.end <= current.start) errors.push(`${label} 镜头${current.number}: end must be greater than start`);
    if (i > 0 && Math.abs(current.start - shots[i - 1].end) > 0.0001) {
      errors.push(`${label}: timeline gap/overlap between 镜头${shots[i - 1].number} and 镜头${current.number}`);
    }
    if (!/(远景|全景|中全景|中景|中近景|近景|特写|大特写|POV|主观视角)/i.test(current.line)) {
      errors.push(`${label} 镜头${current.number}: missing shot size or explicit POV`);
    }
    if (!/(固定|手持|推|拉|摇|移|跟|升|降|环绕|俯拍|仰拍|平视|侧拍|过肩|主观视角|POV)/i.test(current.line)) {
      errors.push(`${label} 镜头${current.number}: missing angle, viewpoint, or camera movement`);
    }

    const lineDuration = current.end - current.start;
    for (const dialogue of current.line.matchAll(/：“([^”]+)”/g)) {
      const characters = [...dialogue[1].replace(/[\s，。！？、；：“”‘’…—,.!?;:'"-]/g, "")].length;
      if (characters > lineDuration * 5.2) {
        warnings.push(`${label} 镜头${current.number}: dialogue may be too long (${characters} chars in ${lineDuration.toFixed(1)}s)`);
      }
    }
  }

  const finalEnd = shots[shots.length - 1].end;
  if (Math.abs(finalEnd - clip.duration) > 0.0001) {
    errors.push(`${label}: final shot ends at ${finalEnd}s, declared duration is ${clip.duration}s`);
  }

  const descriptor = clip.descriptor;
  let minimum = 0;
  if (/对峙|对白/.test(descriptor)) minimum = clip.duration <= 15 ? 5 : 8;
  else if (/动作|打斗|追逐/.test(descriptor)) minimum = 10;
  else if (/混合/.test(descriptor)) minimum = clip.duration <= 15 ? 7 : 10;
  if (minimum && shots.length < minimum) warnings.push(`${label}: ${shots.length} shots; ${descriptor} usually needs at least ${minimum}`);

  if (clip.ratio === "9:16" && !/(前景|后景|纵深|较高|较低|上半部|下半部|安全区域)/.test(body)) {
    warnings.push(`${label}: 9:16 composition lacks explicit depth, height, or safe-area staging`);
  }

  // Only treat references with an explicit token boundary as statically checkable.
  // Chinese prose often writes `@角色A位于...` without whitespace, where a generic
  // Unicode word regex would incorrectly absorb the following sentence.
  const usedAssets = new Set([...body.matchAll(/@[\p{L}\p{N}_-]+(?=（|\s)/gu)].map((m) => m[0]));
  for (const asset of usedAssets) {
    if (!definedAssets.has(asset)) warnings.push(`${label}: asset ${asset} is used but not defined in the asset card`);
  }
});

console.log(`Validated ${clips.length} Clip(s) in ${resolved}`);
if (warnings.length) {
  console.log("Warnings:");
  warnings.forEach((item) => console.log(`- ${item}`));
}
if (errors.length) {
  console.error("Errors:");
  errors.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}
console.log("PASS: structural storyboard checks completed.");
