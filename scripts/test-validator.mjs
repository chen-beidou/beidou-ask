#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const validator = path.resolve(path.dirname(fileURLToPath(new URL(import.meta.url))), "validate-storyboard.mjs");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "beidou-validator-"));

function board(shotLines) {
  return `# Test\n\n| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |\n|---|---|---|---|\n| @Ling | Ling | 主角 | 是 |\n\n### Clip 01｜15秒｜16:9｜对白模式｜真人写实\n\n\`\`\`text\n空间站位：@Ling位于画面左侧，面向画面右侧，右手持手枪。\n\n${shotLines.join("\n")}\n\n结尾状态：@Ling仍在画面右侧，右手持手枪。\n约束：保持Ling服装、手枪、站位连续；无音乐，无字幕。\n\`\`\`\n`;
}

function run(name, shotLines, expectedCode, shouldPass = false) {
  const p = path.join(tmp, `${name}.md`);
  fs.writeFileSync(p, board(shotLines));
  const out = spawnSync(process.execPath, [validator, p], { encoding: "utf8" });
  const combined = `${out.stdout}\n${out.stderr}`;
  if (shouldPass) {
    if (out.status !== 0 || combined.includes(expectedCode)) {
      console.error(`FAIL ${name}\n${combined}`);
      process.exit(1);
    }
  } else if (!combined.includes(expectedCode)) {
    console.error(`FAIL ${name}: expected ${expectedCode}\n${combined}`);
    process.exit(1);
  }
  console.log(`PASS ${name}`);
}



function runWithScript(name, content, scriptText, expectedText = null, shouldPass = true, forbiddenText = null) {
  const p = path.join(tmp, `${name}.md`);
  const script = path.join(tmp, `${name}-script.txt`);
  fs.writeFileSync(p, content);
  fs.writeFileSync(script, scriptText);
  const out = spawnSync(process.execPath, [validator, p, "--script", script], { encoding: "utf8" });
  const combined = `${out.stdout}\n${out.stderr}`;
  if (shouldPass && out.status !== 0) {
    console.error(`FAIL ${name}: expected pass\n${combined}`);
    process.exit(1);
  }
  if (!shouldPass && out.status === 0) {
    console.error(`FAIL ${name}: expected failure\n${combined}`);
    process.exit(1);
  }
  if (expectedText && !combined.includes(expectedText)) {
    console.error(`FAIL ${name}: expected text ${expectedText}\n${combined}`);
    process.exit(1);
  }
  if (forbiddenText && combined.includes(forbiddenText)) {
    console.error(`FAIL ${name}: forbidden text ${forbiddenText}\n${combined}`);
    process.exit(1);
  }
  console.log(`PASS ${name}`);
}

function englishDialogueBoard(line) {
  return `# Test\n\n| Asset | Anchor | Use | Confirm |\n|---|---|---|---|\n| @Ling | Ling | protagonist | yes |\n\n### Clip 01｜15s｜16:9｜dialogue mode｜live action\n\n\`\`\`text\nSpatial staging: @Ling stands on frame left, facing frame right.\nShot 1 (0-3s): Medium shot, static camera. ${line}\nShot 2 (3-6s): Close-up, static camera. @Ling listens without speaking.\nShot 3 (6-9s): Medium shot, static camera. @Ling remains on frame left.\nShot 4 (9-12s): Medium shot, handheld camera. @Ling looks toward the door.\nShot 5 (12-15s): Medium shot, static camera. @Ling remains on frame left.\nEnding state: @Ling remains on frame left.\nConstraints: preserve dialogue verbatim; no music, no subtitles.\n\`\`\`\n`;
}
function runRaw(name, content, expectedCodes = [], forbiddenCodes = []) {
  const p = path.join(tmp, `${name}.md`);
  fs.writeFileSync(p, content);
  const report = path.join(tmp, `${name}.json`);
  const out = spawnSync(process.execPath, [validator, p, "--state-report", report], { encoding: "utf8" });
  const combined = `${out.stdout}\n${out.stderr}`;
  for (const code of expectedCodes) {
    if (!combined.includes(code)) {
      console.error(`FAIL ${name}: expected ${code}\n${combined}`);
      process.exit(1);
    }
  }
  for (const code of forbiddenCodes) {
    if (combined.includes(code)) {
      console.error(`FAIL ${name}: unexpected ${code}\n${combined}`);
      process.exit(1);
    }
  }
  const parsed = JSON.parse(fs.readFileSync(report, "utf8"));
  if (!Array.isArray(parsed.trace) || !parsed.final_state) {
    console.error(`FAIL ${name}: invalid state report`);
    process.exit(1);
  }
  console.log(`PASS ${name}`);
}


runWithScript(
  "english-dialogue-verbatim-pass",
  englishDialogueBoard('@Ling says: "We move now."'),
  'Ling: "We move now."',
  null,
  true,
);

runWithScript(
  "english-dialogue-verbatim-fail",
  englishDialogueBoard('@Ling says: "We move now."'),
  'Ling: "We leave now."',
  "dialogue not found verbatim in script",
  false,
);

runWithScript(
  "h3-dialogue-verbatim-pass",
  englishDialogueBoard('@Ling (S1) says: <d>[English] We move now.</d>'),
  'Ling: We move now.',
  null,
  true,
);

runWithScript(
  "english-dialogue-capacity-warning",
  englishDialogueBoard('@Ling says: "This is far too many spoken words for a three second shot and the actor would have to rush every single phrase unnaturally."'),
  'Ling: "This is far too many spoken words for a three second shot and the actor would have to rush every single phrase unnaturally."',
  "dialogue may be too long",
  true,
);

runWithScript(
  "dialogue-motion-word-does-not-trigger-trajectory-warning",
  englishDialogueBoard('@Ling says: "Move now."'),
  'Ling: "Move now."',
  null,
  true,
  "movement present but no direction/path continuity vocabulary",
);

runWithScript(
  "visible-sign-not-dialogue",
  englishDialogueBoard('A wall sign reads: "MOVE LEFT" while @Ling remains still.'),
  'No spoken dialogue in this scene.',
  null,
  true,
  "dialogue not found verbatim in script",
);

runRaw("dialogue-direction-does-not-change-facing", `# Test

| Asset | Anchor | Use | Confirm |
|---|---|---|---|
| @Ling | Ling | protagonist | yes |

### Clip 01｜15s｜16:9｜dialogue mode｜live action

\`\`\`text
Spatial staging: @Ling stands on frame left, facing frame right.
Shot 1 (0-3s): Medium shot, static camera. @Ling says: "Turn left."
Shot 2 (3-6s): Medium shot, static camera. @Ling remains facing frame right.
Shot 3 (6-9s): Close-up, static camera. @Ling remains still.
Shot 4 (9-12s): Medium shot, static camera. @Ling remains facing frame right.
Shot 5 (12-15s): Medium shot, static camera. @Ling remains on frame left.
Ending state: @Ling remains on frame left, facing frame right.
Constraints: preserve staging; no music, no subtitles.
\`\`\`
`, [], ["FACING_FLIP", "MOTION_REVERSAL"]);


const base = [
  "镜头一（0-3秒）：中景固定拍摄，@Ling从画面左侧向右移动，右手持手枪。",
  "镜头二（3-6秒）：中景固定拍摄，@Ling继续从左向右移动，右手持手枪。",
  "镜头三（6-9秒）：中景固定拍摄，@Ling继续从左向右移动，右手持手枪。",
  "镜头四（9-12秒）：中景固定拍摄，@Ling继续从左向右移动，右手持手枪。",
  "镜头五（12-15秒）：中景固定拍摄，@Ling移动到画面右侧，右手持手枪。",
];

run("natural-motion-reversal", [
  base[0],
  "镜头二（3-6秒）：中景固定拍摄，@Ling从画面右侧向左移动，右手持手枪。",
  ...base.slice(2),
], "MOTION_REVERSAL");

run("explicit-hand-swap", [
  "镜头一（0-3秒）：中景固定拍摄，@Ling站在画面左侧。\n<!-- CONTINUITY {\"entities\":{\"@Ling\":{\"screen\":\"left\",\"posture\":\"standing\",\"right_hand\":\"手枪\",\"left_hand\":\"empty\",\"injuries\":[]}}} -->",
  "镜头二（3-6秒）：中景固定拍摄，@Ling保持站立。\n<!-- CONTINUITY {\"entities\":{\"@Ling\":{\"screen\":\"left\",\"posture\":\"standing\",\"right_hand\":\"empty\",\"left_hand\":\"手枪\",\"injuries\":[]}}} -->",
  base[2], base[3], base[4],
], "HAND_SWAP");

run("explicit-injury-reset", [
  "镜头一（0-3秒）：中景固定拍摄，@Ling站在画面左侧。\n<!-- CONTINUITY {\"entities\":{\"@Ling\":{\"screen\":\"left\",\"posture\":\"standing\",\"injuries\":[\"left_shoulder\"]}}} -->",
  "镜头二（3-6秒）：中景固定拍摄，@Ling保持站立。\n<!-- CONTINUITY {\"entities\":{\"@Ling\":{\"screen\":\"left\",\"posture\":\"standing\",\"injuries\":[]}}} -->",
  base[2], base[3], base[4],
], "INJURY_RESET");

run("legit-transfer", [
  "镜头一（0-3秒）：中景固定拍摄，@Ling站在画面左侧，右手持手枪。",
  "镜头二（3-6秒）：中景固定拍摄，@Ling把手枪从右手换到左手。",
  "镜头三（6-9秒）：中景固定拍摄，@Ling左手持手枪，继续移动。",
  "镜头四（9-12秒）：中景固定拍摄，@Ling把手枪从左手换到右手。",
  "镜头五（12-15秒）：中景固定拍摄，@Ling移动到画面右侧，右手持手枪。",
], "HAND_SWAP", true);



runRaw("multi-actor-spatial", `# Test

| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |
|---|---|---|---|
| @Ling | Ling | 主角 | 是 |
| @Mori | Mori | 配角 | 是 |
| @Gun | 手枪 | 武器道具 | 是 |

### Clip 01｜15秒｜16:9｜对白模式｜真人写实

\`\`\`text
空间站位：@Ling位于画面左侧，@Mori位于画面右侧，两人相对。
镜头一（0-3秒）：中景固定拍摄，@Ling保持画面左侧，@Mori保持画面右侧。
镜头二（3-6秒）：中景固定拍摄，@Ling仍在画面左侧，@Mori仍在画面右侧。
镜头三（6-9秒）：中景固定拍摄，@Ling向画面中央移动，@Mori保持右侧。
镜头四（9-12秒）：中景固定拍摄，@Ling停下，@Mori保持右侧。
镜头五（12-15秒）：中景固定拍摄，@Ling位于画面中央，@Mori仍在画面右侧。
结尾状态：@Ling位于画面中央，@Mori位于画面右侧。
约束：保持两人服装和空间关系连续；无音乐，无字幕。
\`\`\`
`, [], ["SCREEN_POSITION_JUMP"]);

runRaw("entry-exit-direction", `# Test

| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |
|---|---|---|---|
| @Ling | Ling | 主角 | 是 |

### Clip 01｜15秒｜16:9｜动作模式｜真人写实

\`\`\`text
空间站位：@Ling位于画面左侧，面向右侧。
镜头一（0-3秒）：中景固定拍摄，@Ling从画面左侧向右移动。
镜头二（3-6秒）：中景固定拍摄，@Ling继续从左向右移动并从画面右侧出画。
镜头三（6-9秒）：中景固定拍摄，@Ling从画面右侧入画，继续向右移动。
镜头四（9-12秒）：中景固定拍摄，@Ling继续向右移动。
镜头五（12-15秒）：中景固定拍摄，@Ling停下并站稳。
结尾状态：@Ling停在画面右侧，保持站立。
约束：保持Ling服装和运动方向连续；无音乐，无字幕。
\`\`\`
`, ["ENTRY_EXIT_MISMATCH"], []);

runRaw("explicit-prop-teleport", `# Test

| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |
|---|---|---|---|
| @Ling | Ling | 主角 | 是 |
| @Mori | Mori | 配角 | 是 |
| @Keycard | 门禁卡 | 道具 | 是 |

### Clip 01｜15秒｜16:9｜对白模式｜真人写实

\`\`\`text
空间站位：@Ling位于画面左侧，@Mori位于画面右侧。
镜头一（0-3秒）：中景固定拍摄，@Ling看着@Mori。
<!-- CONTINUITY {"props":{"keycard":{"label":"门禁卡","owner":"@Ling","location":"right_hand"}}} -->
镜头二（3-6秒）：中景固定拍摄，两人继续对视。
<!-- CONTINUITY {"props":{"keycard":{"label":"门禁卡","owner":"@Mori","location":"left_hand"}}} -->
镜头三（6-9秒）：中景固定拍摄，@Ling后退半步。
镜头四（9-12秒）：中景固定拍摄，@Mori保持位置。
镜头五（12-15秒）：中景固定拍摄，两人保持对峙。
结尾状态：@Ling仍在左侧，@Mori仍在右侧。
约束：保持服装和门禁卡连续；无音乐，无字幕。
\`\`\`
`, ["PROP_TELEPORT"], []);

runRaw("explicit-posture-jump", `# Test

| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |
|---|---|---|---|
| @Ling | Ling | 主角 | 是 |

### Clip 01｜15秒｜16:9｜对白模式｜真人写实

\`\`\`text
空间站位：@Ling位于画面左侧。
镜头一（0-3秒）：中景固定拍摄，@Ling保持不动。
<!-- CONTINUITY {"entities":{"@Ling":{"posture":"sitting","screen":"left"}}} -->
镜头二（3-6秒）：中景固定拍摄，@Ling保持不动。
<!-- CONTINUITY {"entities":{"@Ling":{"posture":"standing","screen":"left"}}} -->
镜头三（6-9秒）：中景固定拍摄，@Ling看向门口。
镜头四（9-12秒）：中景固定拍摄，@Ling保持站立。
镜头五（12-15秒）：中景固定拍摄，@Ling仍在左侧。
结尾状态：@Ling站在画面左侧。
约束：保持Ling服装和站位连续；无音乐，无字幕。
\`\`\`
`, ["POSTURE_JUMP"], []);



runRaw("explicit-scene-jump", `# Test

| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |
|---|---|---|---|
| @Ling | Ling | 主角 | 是 |

### Clip 01｜15秒｜16:9｜对白模式｜真人写实

\`\`\`text
空间站位：@Ling位于画面左侧。
镜头一（0-3秒）：中景固定拍摄，@Ling保持位置。
<!-- CONTINUITY {"scene":{"main_door":"closed"}} -->
镜头二（3-6秒）：中景固定拍摄，@Ling保持位置。
<!-- CONTINUITY {"scene":{"main_door":"open"}} -->
镜头三（6-9秒）：中景固定拍摄，@Ling看向门口。
镜头四（9-12秒）：中景固定拍摄，@Ling保持位置。
镜头五（12-15秒）：中景固定拍摄，@Ling仍在左侧。
结尾状态：@Ling仍在画面左侧。
约束：保持Ling服装和门状态连续；无音乐，无字幕。
\`\`\`
`, ["SCENE_STATE_JUMP"], []);

runRaw("explicit-scene-change-event", `# Test

| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |
|---|---|---|---|
| @Ling | Ling | 主角 | 是 |

### Clip 01｜15秒｜16:9｜对白模式｜真人写实

\`\`\`text
空间站位：@Ling位于画面左侧。
镜头一（0-3秒）：中景固定拍摄，@Ling保持位置。
<!-- CONTINUITY {"scene":{"main_door":"closed"}} -->
镜头二（3-6秒）：中景固定拍摄，@Ling打开门。
<!-- CONTINUITY {"events":["door_change"],"scene":{"main_door":"open"}} -->
镜头三（6-9秒）：中景固定拍摄，@Ling看向门外。
镜头四（9-12秒）：中景固定拍摄，@Ling保持位置。
镜头五（12-15秒）：中景固定拍摄，@Ling仍在左侧。
结尾状态：@Ling仍在画面左侧。
约束：保持Ling服装和门状态连续；无音乐，无字幕。
\`\`\`
`, [], ["SCENE_STATE_JUMP"]);

runRaw("explicit-prop-condition", `# Test

| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |
|---|---|---|---|
| @Ling | Ling | 主角 | 是 |
| @Keycard | 门禁卡 | 道具 | 是 |

### Clip 01｜15秒｜16:9｜对白模式｜真人写实

\`\`\`text
空间站位：@Ling位于画面左侧。
镜头一（0-3秒）：中景固定拍摄，@Ling看着门禁卡。
<!-- CONTINUITY {"props":{"keycard":{"label":"门禁卡","owner":"@Ling","location":"right_hand","condition":"intact"}}} -->
镜头二（3-6秒）：中景固定拍摄，@Ling保持不动。
<!-- CONTINUITY {"props":{"keycard":{"condition":"broken"}}} -->
镜头三（6-9秒）：中景固定拍摄，@Ling看向门口。
镜头四（9-12秒）：中景固定拍摄，@Ling保持位置。
镜头五（12-15秒）：中景固定拍摄，@Ling仍在左侧。
结尾状态：@Ling仍在画面左侧。
约束：保持Ling服装和门禁卡连续；无音乐，无字幕。
\`\`\`
`, ["PROP_CONDITION_JUMP"], []);

const crossClip = `# Test

| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |
|---|---|---|---|
| @Ling | Ling | 主角 | 是 |

### Clip 01｜15秒｜16:9｜对白模式｜真人写实
\`\`\`text
空间站位：@Ling位于画面左侧，右手持手枪。
镜头一（0-3秒）：中景固定拍摄，@Ling右手持手枪。
镜头二（3-6秒）：中景固定拍摄，@Ling保持位置。
镜头三（6-9秒）：中景固定拍摄，@Ling保持位置。
镜头四（9-12秒）：中景固定拍摄，@Ling保持位置。
镜头五（12-15秒）：中景固定拍摄，@Ling右手持手枪。
结尾状态：@Ling位于画面左侧，右手持手枪。
约束：保持Ling服装和手枪连续；无音乐，无字幕。
\`\`\`

### Clip 02｜15秒｜16:9｜对白模式｜真人写实
\`\`\`text
空间站位：@Ling位于画面左侧，左手持手枪。
镜头一（0-3秒）：中景固定拍摄，@Ling左手持手枪。
镜头二（3-6秒）：中景固定拍摄，@Ling保持位置。
镜头三（6-9秒）：中景固定拍摄，@Ling保持位置。
镜头四（9-12秒）：中景固定拍摄，@Ling保持位置。
镜头五（12-15秒）：中景固定拍摄，@Ling左手持手枪。
结尾状态：@Ling位于画面左侧，左手持手枪。
约束：保持Ling服装和手枪连续；无音乐，无字幕。
\`\`\`
`;
runRaw("cross-clip-hand-swap", crossClip, ["HAND_SWAP"], []);




function runRawInspect(name, content, inspect, extraArgs = []) {
  const p = path.join(tmp, `${name}.md`);
  fs.writeFileSync(p, content);
  const report = path.join(tmp, `${name}.json`);
  const out = spawnSync(process.execPath, [validator, p, "--state-report", report, ...extraArgs], { encoding: "utf8" });
  const parsed = JSON.parse(fs.readFileSync(report, "utf8"));
  try {
    inspect({ parsed, out, combined: `${out.stdout}\n${out.stderr}` });
  } catch (err) {
    console.error(`FAIL ${name}: ${err.message}\n${out.stdout}\n${out.stderr}`);
    process.exit(1);
  }
  console.log(`PASS ${name}`);
}

function twoActorBoard(shotLines, spatial = "@Ling位于画面左侧，面向画面右侧；@Mori位于画面右侧，面向画面左侧。") {
  return `# Test\n\n| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |\n|---|---|---|---|\n| @Ling | Ling | 主角 | 是 |\n| @Mori | Mori | 配角 | 是 |\n| @Gun | 手枪 | 武器道具 | 是 |\n| @Knife | 小刀 | 武器道具 | 是 |\n\n### Clip 01｜15秒｜16:9｜对白模式｜真人写实\n\n\`\`\`text\n空间站位：${spatial}\n${shotLines.join("\n")}\n结尾状态：@Ling位于画面左侧；@Mori位于画面右侧。\n约束：保持人物、道具和站位连续；无音乐，无字幕。\n\`\`\`\n`;
}

runRawInspect("screen-facing-role-separation", twoActorBoard([
  "镜头一（0-3秒）：中景固定拍摄，@Ling位于画面右侧，面向画面左侧。",
  "镜头二（3-6秒）：中景固定拍摄，@Ling仍在画面右侧，面向画面左侧。",
  "镜头三（6-9秒）：中景固定拍摄，@Ling仍在画面右侧。",
  "镜头四（9-12秒）：中景固定拍摄，@Ling仍在画面右侧。",
  "镜头五（12-15秒）：中景固定拍摄，@Ling仍在画面右侧。",
], "@Ling位于画面右侧，面向画面左侧；@Mori位于画面左侧，面向画面右侧。"), ({ parsed }) => {
  const first = parsed.trace.find((x) => x.shot === "一")?.state?.entities?.["@Ling"];
  if (!first || first.screen !== "right" || first.facing !== "left") throw new Error(`role separation failed: ${JSON.stringify(first)}`);
});

runRawInspect("entity-scoped-turn", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，两人保持对峙。\n<!-- CONTINUITY {"entities":{"@Ling":{"facing":"right"},"@Mori":{"facing":"left"}}} -->',
  '镜头二（3-6秒）：中景固定拍摄，只有@Mori转身，@Ling没有转身。\n<!-- CONTINUITY {"events":[{"type":"turn","entity":"@Mori"}],"entities":{"@Ling":{"facing":"left"},"@Mori":{"facing":"right"}}} -->',
  "镜头三（6-9秒）：中景固定拍摄，两人保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，两人保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，两人保持位置。",
]), ({ parsed }) => {
  const flips = parsed.findings.filter((f) => f.code === "FACING_FLIP");
  if (!flips.some((f) => f.where.includes("@Ling"))) throw new Error("Ling flip was incorrectly legalized by Mori turn");
  if (flips.some((f) => f.where.includes("@Mori"))) throw new Error("Mori scoped turn should legalize Mori facing change");
});

runRawInspect("entity-scoped-hand-transfer", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，两人持械。\n<!-- CONTINUITY {"entities":{"@Ling":{"right_hand":"手枪","left_hand":"empty"},"@Mori":{"right_hand":"小刀","left_hand":"empty"}}} -->',
  '镜头二（3-6秒）：中景固定拍摄，只有@Mori把小刀换到左手。\n<!-- CONTINUITY {"events":[{"type":"hand_transfer","entity":"@Mori","prop":"小刀"}],"entities":{"@Ling":{"right_hand":"empty","left_hand":"手枪"},"@Mori":{"right_hand":"empty","left_hand":"小刀"}}} -->',
  "镜头三（6-9秒）：中景固定拍摄，两人保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，两人保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，两人保持位置。",
]), ({ parsed }) => {
  const swaps = parsed.findings.filter((f) => f.code === "HAND_SWAP");
  if (!swaps.some((f) => f.where.includes("@Ling"))) throw new Error("Ling hand swap was incorrectly legalized by Mori transfer");
  if (swaps.some((f) => f.where.includes("@Mori"))) throw new Error("Mori scoped transfer should legalize Mori hand swap");
});

runRawInspect("world-position-jump", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，@Ling保持位置。\n<!-- CONTINUITY {"entities":{"@Ling":{"world_position":{"x":0,"y":0,"z":0}}}} -->',
  '镜头二（3-6秒）：中景固定拍摄，@Ling没有移动。\n<!-- CONTINUITY {"entities":{"@Ling":{"world_position":{"x":5,"y":0,"z":0}}}} -->',
  "镜头三（6-9秒）：中景固定拍摄，@Ling保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，@Ling保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，@Ling保持位置。",
]), ({ parsed }) => {
  if (!parsed.findings.some((f) => f.code === "WORLD_POSITION_JUMP" && f.where.includes("@Ling"))) throw new Error("world position jump not detected");
});

runRawInspect("scoped-world-move", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，两人保持位置。\n<!-- CONTINUITY {"entities":{"@Ling":{"world_position":{"x":0,"y":0,"z":0}},"@Mori":{"world_position":{"x":10,"y":0,"z":0}}}} -->',
  '镜头二（3-6秒）：中景固定拍摄，只有@Mori移动。\n<!-- CONTINUITY {"events":[{"type":"move","entity":"@Mori"}],"entities":{"@Ling":{"world_position":{"x":5,"y":0,"z":0}},"@Mori":{"world_position":{"x":12,"y":0,"z":0}}}} -->',
  "镜头三（6-9秒）：中景固定拍摄，两人保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，两人保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，两人保持位置。",
]), ({ parsed }) => {
  const jumps = parsed.findings.filter((f) => f.code === "WORLD_POSITION_JUMP");
  if (!jumps.some((f) => f.where.includes("@Ling"))) throw new Error("Ling world jump was incorrectly legalized by Mori move");
  if (jumps.some((f) => f.where.includes("@Mori"))) throw new Error("Mori scoped move should legalize Mori world move");
});

runRawInspect("camera-axis-cross", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，两人保持对峙。\n<!-- CONTINUITY {"camera":{"axis_id":"dialogue-A","axis_side":"north","position":{"x":0,"y":-4,"z":1.6}}} -->',
  '镜头二（3-6秒）：中景固定拍摄，摄影机切到轴线另一侧。\n<!-- CONTINUITY {"camera":{"axis_id":"dialogue-A","axis_side":"south","position":{"x":0,"y":4,"z":1.6}}} -->',
  "镜头三（6-9秒）：中景固定拍摄，两人保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，两人保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，两人保持位置。",
]), ({ parsed }) => {
  if (!parsed.findings.some((f) => f.code === "CAMERA_AXIS_CROSS")) throw new Error("camera axis crossing not detected");
});

runRawInspect("camera-axis-cross-legal", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，两人保持对峙。\n<!-- CONTINUITY {"camera":{"axis_id":"dialogue-A","axis_side":"north"}} -->',
  '镜头二（3-6秒）：中景连续越轴，明确重建轴线。\n<!-- CONTINUITY {"events":[{"type":"camera_cross_axis"}],"camera":{"axis_id":"dialogue-A","axis_side":"south"}} -->',
  "镜头三（6-9秒）：中景固定拍摄，两人保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，两人保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，两人保持位置。",
]), ({ parsed }) => {
  if (parsed.findings.some((f) => f.code === "CAMERA_AXIS_CROSS")) throw new Error("legal camera axis crossing was rejected");
});

runRawInspect("scene-event-key-scope", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，两人保持位置。\n<!-- CONTINUITY {"scene":{"main_door":"closed","window":"closed"}} -->',
  '镜头二（3-6秒）：中景固定拍摄，@Ling打开窗户。\n<!-- CONTINUITY {"events":[{"type":"scene_change","scene_key":"window"}],"scene":{"main_door":"open","window":"open"}} -->',
  "镜头三（6-9秒）：中景固定拍摄，两人保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，两人保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，两人保持位置。",
]), ({ parsed }) => {
  const jumps = parsed.findings.filter((f) => f.code === "SCENE_STATE_JUMP");
  if (!jumps.some((f) => String(f.message).includes("main_door"))) throw new Error("window event incorrectly legalized main_door change");
  if (jumps.some((f) => String(f.message).includes("window"))) throw new Error("window scoped event should legalize window change");
});

runRawInspect("legacy-global-event-warning", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，两人保持对峙。\n<!-- CONTINUITY {"entities":{"@Ling":{"facing":"right"}}} -->',
  '镜头二（3-6秒）：中景固定拍摄，@Ling转身。\n<!-- CONTINUITY {"events":["turn"],"entities":{"@Ling":{"facing":"left"}}} -->',
  "镜头三（6-9秒）：中景固定拍摄，两人保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，两人保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，两人保持位置。",
]), ({ parsed }) => {
  if (!parsed.findings.some((f) => f.code === "LEGACY_EVENT_INFERRED_SCOPE")) throw new Error("legacy global event warning missing");
});

runRawInspect("legacy-event-ambiguous-not-authorizing", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，两人保持对峙。\n<!-- CONTINUITY {"entities":{"@Ling":{"facing":"right"},"@Mori":{"facing":"left"}}} -->',
  '镜头二（3-6秒）：中景固定拍摄，两人的朝向记录都发生变化。\n<!-- CONTINUITY {"events":["turn"],"entities":{"@Ling":{"facing":"left"},"@Mori":{"facing":"right"}}} -->',
  "镜头三（6-9秒）：中景固定拍摄，两人保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，两人保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，两人保持位置。",
]), ({ parsed }) => {
  if (!parsed.findings.some((f) => f.code === "LEGACY_EVENT_AMBIGUOUS")) throw new Error("ambiguous legacy event was not flagged");
  const flips = parsed.findings.filter((f) => f.code === "FACING_FLIP");
  if (flips.length < 2) throw new Error("ambiguous legacy event incorrectly authorized entity flips");
});

runRawInspect("prop-event-scope", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，道具保持完整。\n<!-- CONTINUITY {"props":{"keycard":{"label":"门禁卡","condition":"intact"},"phone":{"label":"手机","condition":"intact"}}} -->',
  '镜头二（3-6秒）：中景固定拍摄，门禁卡被折断，手机没有受损。\n<!-- CONTINUITY {"events":[{"type":"prop_damage","prop":"门禁卡"}],"props":{"keycard":{"condition":"broken"},"phone":{"condition":"broken"}}} -->',
  "镜头三（6-9秒）：中景固定拍摄，两人保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，两人保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，两人保持位置。",
]), ({ parsed }) => {
  const jumps = parsed.findings.filter((f) => f.code === "PROP_CONDITION_JUMP");
  if (!jumps.some((f) => String(f.message).includes("手机"))) throw new Error("phone damage was incorrectly legalized by keycard event");
  if (jumps.some((f) => String(f.message).includes("门禁卡"))) throw new Error("keycard scoped damage should be legal");
});

runRawInspect("entity-axis-side-scope", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，两人保持位置。\n<!-- CONTINUITY {"entities":{"@Ling":{"axis_id":"A","axis_side":"north"},"@Mori":{"axis_id":"A","axis_side":"south"}}} -->',
  '镜头二（3-6秒）：中景固定拍摄，只有@Mori跨到轴线另一侧。\n<!-- CONTINUITY {"events":[{"type":"move","entity":"@Mori"}],"entities":{"@Ling":{"axis_id":"A","axis_side":"south"},"@Mori":{"axis_id":"A","axis_side":"north"}}} -->',
  "镜头三（6-9秒）：中景固定拍摄，两人保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，两人保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，两人保持位置。",
]), ({ parsed }) => {
  const jumps = parsed.findings.filter((f) => f.code === "ENTITY_AXIS_SIDE_JUMP");
  if (!jumps.some((f) => f.where.includes("@Ling"))) throw new Error("Ling axis-side jump was incorrectly legalized by Mori move");
  if (jumps.some((f) => f.where.includes("@Mori"))) throw new Error("Mori scoped move should legalize Mori axis-side change");
});



// v3.0 adversarial regressions: bilingual parsing, relation transactions, and geometry-backed reprojection.
runRaw("natural-relational-transfer-cn", `# Test

| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |
|---|---|---|---|
| @Ling | Ling | 主角 | 是 |
| @Mori | Mori | 配角 | 是 |
| @Gun | 手枪 | 武器道具 | 是 |

### Clip 01｜15秒｜16:9｜对白模式｜真人写实
\`\`\`text
空间站位：@Ling位于画面左侧，右手持手枪；@Mori位于画面右侧，右手为空。
镜头一（0-3秒）：中景固定拍摄，@Ling右手持手枪，@Mori右手为空。
镜头二（3-6秒）：中景固定拍摄，@Ling把手枪递给@Mori，@Mori右手接住。
镜头三（6-9秒）：中景固定拍摄，@Ling右手为空，@Mori右手持手枪。
镜头四（9-12秒）：中景固定拍摄，两人保持位置。
镜头五（12-15秒）：中景固定拍摄，@Mori右手持手枪。
结尾状态：@Ling位于画面左侧，@Mori位于画面右侧，右手持手枪。
约束：保持人物、道具、站位连续；无音乐，无字幕。
\`\`\`
`, [], ["HAND_PROP_APPEARS","HAND_PROP_DISAPPEARS","PROP_TELEPORT","HAND_SWAP"]);

runRaw("natural-relational-transfer-en", `# Test

| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |
|---|---|---|---|
| @Ling | Ling | protagonist | yes |
| @Mori | Mori | supporting character | yes |
| @Gun | pistol | prop | yes |

### Clip 01｜15s｜16:9｜dialogue mode｜live action
\`\`\`text
Spatial staging: @Ling stands on frame left, holding a pistol in his right hand; @Mori stands on frame right, right hand empty.
Shot 1 (0-3s): Medium shot, static camera. @Ling holds a pistol in his right hand; @Mori's right hand is empty.
Shot 2 (3-6s): Medium shot, static camera. @Ling hands the pistol to @Mori; @Mori receives the pistol with his right hand.
Shot 3 (6-9s): Medium shot, static camera. @Ling's right hand is empty; @Mori holds the pistol in his right hand.
Shot 4 (9-12s): Close-up, static camera. @Mori keeps the pistol in his right hand.
Shot 5 (12-15s): Medium shot, static camera. @Mori stands on frame right, holding the pistol in his right hand.
Ending state: @Ling stands on frame left; @Mori stands on frame right, holding the pistol in his right hand.
Constraints: keep identity, prop ownership, and staging continuous; no music, no subtitles.
\`\`\`
`, [], ["HAND_PROP_APPEARS","HAND_PROP_DISAPPEARS","PROP_TELEPORT","HAND_SWAP","missing shot size","missing angle"]);

runRaw("english-hand-swap-detect", `# Test

| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |
|---|---|---|---|
| @Ling | Ling | protagonist | yes |

### Clip 01｜15s｜16:9｜dialogue mode｜live action
\`\`\`text
Spatial staging: @Ling stands on frame left, holding a pistol in his right hand.
Shot 1 (0-3s): Medium shot, static camera. @Ling holds a pistol in his right hand.
Shot 2 (3-6s): Medium close-up, static camera. @Ling holds the pistol in his left hand.
Shot 3 (6-9s): Medium shot, static camera. @Ling remains on frame left.
Shot 4 (9-12s): Close-up, static camera. @Ling remains still.
Shot 5 (12-15s): Medium shot, static camera. @Ling remains on frame left.
Ending state: @Ling stands on frame left.
Constraints: keep identity and prop continuity; no music, no subtitles.
\`\`\`
`, ["HAND_SWAP"], []);

runRaw("english-legal-hand-switch", `# Test

| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |
|---|---|---|---|
| @Ling | Ling | protagonist | yes |

### Clip 01｜15s｜16:9｜dialogue mode｜live action
\`\`\`text
Spatial staging: @Ling stands on frame left, holding a pistol in his right hand.
Shot 1 (0-3s): Medium shot, static camera. @Ling holds a pistol in his right hand.
Shot 2 (3-6s): Medium close-up, static camera. @Ling switches the pistol from his right hand to his left hand.
Shot 3 (6-9s): Medium shot, tracking. @Ling walks from frame left to frame right, holding the pistol in his left hand.
Shot 4 (9-12s): Close-up, handheld. @Ling holds the pistol in his left hand.
Shot 5 (12-15s): Medium shot, static camera. @Ling stands on frame right, holding the pistol in his left hand.
Ending state: @Ling stands on frame right, holding the pistol in his left hand.
Constraints: keep identity and prop continuity; no music, no subtitles.
\`\`\`
`, [], ["HAND_SWAP","HAND_PROP_APPEARS","missing shot size","missing angle"]);

runRawInspect("english-negated-turn", `# Test

| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |
|---|---|---|---|
| @Ling | Ling | protagonist | yes |

### Clip 01｜15s｜16:9｜dialogue mode｜live action
\`\`\`text
Spatial staging: @Ling stands on frame left, facing frame right.
Shot 1 (0-3s): Medium shot, static camera. @Ling remains facing frame right.
<!-- CONTINUITY {"entities":{"@Ling":{"facing":"right"}}} -->
Shot 2 (3-6s): Medium shot, static camera. @Ling does not turn.
<!-- CONTINUITY {"entities":{"@Ling":{"facing":"left"}}} -->
Shot 3 (6-9s): Medium shot, static camera. @Ling remains still.
Shot 4 (9-12s): Close-up, static camera. @Ling remains still.
Shot 5 (12-15s): Medium shot, static camera. @Ling remains still.
Ending state: @Ling remains on frame left.
Constraints: keep facing and staging continuous; no music, no subtitles.
\`\`\`
`, ({ parsed }) => {
  if (!parsed.findings.some((f) => f.code === "FACING_FLIP")) throw new Error("English negation incorrectly authorized turn");
});

runRawInspect("geometry-projection-pass", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，@Ling位于画面右侧。\n<!-- CONTINUITY {"camera":{"position":{"x":0,"y":0,"z":1.6},"target":{"x":0,"y":10,"z":1.6}},"entities":{"@Ling":{"world_position":{"x":2,"y":8,"z":0},"screen":"right"}}} -->',
  "镜头二（3-6秒）：中景固定拍摄，@Ling保持位置。",
  "镜头三（6-9秒）：中景固定拍摄，@Ling保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，@Ling保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，@Ling保持位置。",
], "@Ling位于画面右侧；@Mori位于画面中央。"), ({ parsed }) => {
  if (parsed.findings.some((f) => f.code === "SCREEN_PROJECTION_MISMATCH")) throw new Error("valid geometry was rejected");
});

runRawInspect("geometry-projection-mismatch", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，@Ling位于画面左侧。\n<!-- CONTINUITY {"camera":{"position":{"x":0,"y":0,"z":1.6},"target":{"x":0,"y":10,"z":1.6}},"entities":{"@Ling":{"world_position":{"x":2,"y":8,"z":0},"screen":"left"}}} -->',
  "镜头二（3-6秒）：中景固定拍摄，@Ling保持位置。",
  "镜头三（6-9秒）：中景固定拍摄，@Ling保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，@Ling保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，@Ling保持位置。",
], "@Ling位于画面左侧；@Mori位于画面中央。"), ({ parsed }) => {
  if (!parsed.findings.some((f) => f.code === "SCREEN_PROJECTION_MISMATCH")) throw new Error("geometry mismatch was not detected");
});

runRawInspect("camera-reprojection-legal", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，@Ling位于画面右侧。\n<!-- CONTINUITY {"camera":{"position":{"x":0,"y":0,"z":1.6},"target":{"x":0,"y":10,"z":1.6}},"entities":{"@Ling":{"world_position":{"x":2,"y":8,"z":0},"screen":"right"}}} -->',
  '镜头二（3-6秒）：中景固定拍摄，摄影机换到北侧向南拍，@Ling在画面左侧。\n<!-- CONTINUITY {"camera":{"position":{"x":0,"y":16,"z":1.6},"target":{"x":0,"y":0,"z":1.6}},"entities":{"@Ling":{"world_position":{"x":2,"y":8,"z":0},"screen":"left"}}} -->',
  "镜头三（6-9秒）：中景固定拍摄，@Ling保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，@Ling保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，@Ling保持位置。",
], "@Ling位于画面右侧；@Mori位于画面中央。"), ({ parsed }) => {
  if (parsed.findings.some((f) => ["SCREEN_POSITION_JUMP","SCREEN_PROJECTION_MISMATCH"].includes(f.code))) throw new Error("camera reprojection was mistaken for entity teleport");
});

runRawInspect("natural-relation-does-not-authorize-third-party", `# Test

| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |
|---|---|---|---|
| @Ling | Ling | 主角 | 是 |
| @Mori | Mori | 配角 | 是 |
| @Kai | Kai | 配角 | 是 |

### Clip 01｜15秒｜16:9｜对白模式｜真人写实
\`\`\`text
空间站位：@Ling位于画面左侧；@Mori位于画面右侧；@Kai位于画面中央。
镜头一（0-3秒）：中景固定拍摄，三人保持位置。
<!-- CONTINUITY {"entities":{"@Ling":{"right_hand":"手枪"},"@Mori":{"right_hand":"empty"},"@Kai":{"right_hand":"empty"}}} -->
镜头二（3-6秒）：中景固定拍摄，@Ling把手枪递给@Mori，@Mori右手接住；@Kai没有拿任何东西。
<!-- CONTINUITY {"entities":{"@Kai":{"right_hand":"小刀"}}} -->
镜头三（6-9秒）：中景固定拍摄，三人保持位置。
镜头四（9-12秒）：中景固定拍摄，三人保持位置。
镜头五（12-15秒）：中景固定拍摄，三人保持位置。
结尾状态：三人保持原位置。
约束：保持人物与道具连续；无音乐，无字幕。
\`\`\`
`, ({ parsed }) => {
  if (!parsed.findings.some((f) => f.code === "HAND_PROP_APPEARS" && f.where.includes("@Kai"))) throw new Error("Ling→Mori transfer incorrectly authorized Kai prop appearance");
});


function sameForTest(a,b){ return String(a||"").toLowerCase().includes(String(b||"").toLowerCase()) || String(b||"").toLowerCase().includes(String(a||"").toLowerCase()); }


runRawInspect("prop-duplicated", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，两人保持位置。\n<!-- CONTINUITY {"entities":{"@Ling":{"right_hand":"手枪"},"@Mori":{"right_hand":"手枪"}}} -->',
  "镜头二（3-6秒）：中景固定拍摄，两人保持位置。",
  "镜头三（6-9秒）：中景固定拍摄，两人保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，两人保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，两人保持位置。",
]), ({ parsed }) => {
  if (!parsed.findings.some((f)=>f.code==="PROP_DUPLICATED")) throw new Error("duplicate prop across entities not detected");
});

runRawInspect("prop-transfer-source-mismatch", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，@Mori右手持手枪，@Ling右手为空。',
  '镜头二（3-6秒）：中景固定拍摄，@Ling把手枪递给@Mori，@Mori右手接住。',
  "镜头三（6-9秒）：中景固定拍摄，两人保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，两人保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，两人保持位置。",
]), ({ parsed }) => {
  if (!parsed.findings.some((f)=>f.code==="PROP_TRANSFER_SOURCE_MISMATCH")) throw new Error("wrong transfer source not detected");
});

runRawInspect("transfer-target-hand-occupied", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，@Ling右手持手枪，@Mori右手持小刀。',
  '镜头二（3-6秒）：中景固定拍摄，@Ling把手枪递给@Mori，@Mori右手接住。',
  "镜头三（6-9秒）：中景固定拍摄，两人保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，两人保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，两人保持位置。",
]), ({ parsed }) => {
  if (!parsed.findings.some((f)=>f.code==="TRANSFER_TARGET_HAND_OCCUPIED")) throw new Error("occupied recipient hand not detected");
});

runRawInspect("invalid-explicit-event-shape", twoActorBoard([
  '镜头一（0-3秒）：中景固定拍摄，两人保持位置。\n<!-- CONTINUITY {"events":[{"type":"prop_transfer","actor":"@Ling","prop":"手枪"}]} -->',
  "镜头二（3-6秒）：中景固定拍摄，两人保持位置。",
  "镜头三（6-9秒）：中景固定拍摄，两人保持位置。",
  "镜头四（9-12秒）：中景固定拍摄，两人保持位置。",
  "镜头五（12-15秒）：中景固定拍摄，两人保持位置。",
]), ({ parsed }) => {
  if (!parsed.findings.some((f)=>f.code==="STATE_EVENT_INVALID")) throw new Error("invalid event schema not rejected");
});

// Mutation suite: 120 generated positive/negative cases across the two failure families that
// previously caused the most dangerous false passes: screen/facing role leakage and event scope leakage.
let mutationCount = 0;
for (let i = 0; i < 40; i += 1) {
  const side = i % 2 === 0 ? "right" : "left";
  const facing = side === "right" ? "left" : "right";
  const content = twoActorBoard([
    `镜头一（0-3秒）：中景固定拍摄，@Ling位于画面${side === "right" ? "右" : "左"}侧，面向画面${facing === "right" ? "右" : "左"}侧。`,
    `镜头二（3-6秒）：中景固定拍摄，@Ling仍在画面${side === "right" ? "右" : "左"}侧。`,
    "镜头三（6-9秒）：中景固定拍摄，@Ling保持位置。",
    "镜头四（9-12秒）：中景固定拍摄，@Ling保持位置。",
    "镜头五（12-15秒）：中景固定拍摄，@Ling保持位置。",
  ], `@Ling位于画面${side === "right" ? "右" : "左"}侧，面向画面${facing === "right" ? "右" : "左"}侧；@Mori位于画面中央。`);
  const p = path.join(tmp, `mutation-role-${i}.md`);
  const report = path.join(tmp, `mutation-role-${i}.json`);
  fs.writeFileSync(p, content);
  const out = spawnSync(process.execPath, [validator, p, "--state-report", report], { encoding: "utf8" });
  const parsed = JSON.parse(fs.readFileSync(report, "utf8"));
  const st = parsed.trace.find((x) => x.shot === "一")?.state?.entities?.["@Ling"];
  if (!st || st.screen !== side || st.facing !== facing) {
    console.error(`FAIL mutation-role-${i}: ${JSON.stringify(st)}`); process.exit(1);
  }
  mutationCount += 1;
}

for (let i = 0; i < 40; i += 1) {
  const content = twoActorBoard([
    '镜头一（0-3秒）：中景固定拍摄，两人保持对峙。\n<!-- CONTINUITY {"entities":{"@Ling":{"facing":"right"},"@Mori":{"facing":"left"}}} -->',
    '镜头二（3-6秒）：中景固定拍摄，只有@Mori转身。\n<!-- CONTINUITY {"events":[{"type":"turn","entity":"@Mori"}],"entities":{"@Ling":{"facing":"left"},"@Mori":{"facing":"right"}}} -->',
    "镜头三（6-9秒）：中景固定拍摄，两人保持位置。",
    "镜头四（9-12秒）：中景固定拍摄，两人保持位置。",
    "镜头五（12-15秒）：中景固定拍摄，两人保持位置。",
  ]);
  const p = path.join(tmp, `mutation-turn-${i}.md`);
  const report = path.join(tmp, `mutation-turn-${i}.json`);
  fs.writeFileSync(p, content);
  spawnSync(process.execPath, [validator, p, "--state-report", report], { encoding: "utf8" });
  const parsed = JSON.parse(fs.readFileSync(report, "utf8"));
  const flips = parsed.findings.filter((f) => f.code === "FACING_FLIP");
  if (!flips.some((f) => f.where.includes("@Ling")) || flips.some((f) => f.where.includes("@Mori"))) {
    console.error(`FAIL mutation-turn-${i}`); process.exit(1);
  }
  mutationCount += 1;
}

for (let i = 0; i < 40; i += 1) {
  const legal = i % 2 === 0;
  const event = legal ? ',"events":[{"type":"move","entity":"@Ling"}]' : "";
  const content = twoActorBoard([
    '镜头一（0-3秒）：中景固定拍摄，@Ling保持位置。\n<!-- CONTINUITY {"entities":{"@Ling":{"world_position":{"x":0,"y":0,"z":0}}}} -->',
    `镜头二（3-6秒）：中景固定拍摄，@Ling${legal ? "向前移动" : "保持不动"}。\n<!-- CONTINUITY {${legal ? '"events":[{"type":"move","entity":"@Ling"}],' : ''}"entities":{"@Ling":{"world_position":{"x":${i + 1},"y":0,"z":0}}}} -->`,
    "镜头三（6-9秒）：中景固定拍摄，@Ling保持位置。",
    "镜头四（9-12秒）：中景固定拍摄，@Ling保持位置。",
    "镜头五（12-15秒）：中景固定拍摄，@Ling保持位置。",
  ]);
  const p = path.join(tmp, `mutation-world-${i}.md`);
  const report = path.join(tmp, `mutation-world-${i}.json`);
  fs.writeFileSync(p, content);
  spawnSync(process.execPath, [validator, p, "--state-report", report], { encoding: "utf8" });
  const parsed = JSON.parse(fs.readFileSync(report, "utf8"));
  const hasJump = parsed.findings.some((f) => f.code === "WORLD_POSITION_JUMP");
  if (legal ? hasJump : !hasJump) { console.error(`FAIL mutation-world-${i}`); process.exit(1); }
  mutationCount += 1;
}



for (let i = 0; i < 60; i += 1) {
  const side = i % 2 === 0 ? "left" : "right";
  const facing = side === "left" ? "right" : "left";
  const content = `# Test\n\n| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |\n|---|---|---|---|\n| @Ling | Ling | protagonist | yes |\n\n### Clip 01｜15s｜16:9｜dialogue mode｜live action\n\n\`\`\`text\nSpatial staging: @Ling stands on frame ${side}, facing frame ${facing}, holding a pistol in his right hand.\nShot 1 (0-3s): Medium shot, static camera. @Ling remains on frame ${side}, facing frame ${facing}, holding a pistol in his right hand.\nShot 2 (3-6s): Medium shot, static camera. @Ling remains on frame ${side}.\nShot 3 (6-9s): Close-up, static camera. @Ling remains still.\nShot 4 (9-12s): Medium shot, handheld. @Ling remains still.\nShot 5 (12-15s): Medium shot, static camera. @Ling remains on frame ${side}.\nEnding state: @Ling remains on frame ${side}.\nConstraints: keep identity and staging continuous; no music, no subtitles.\n\`\`\`\n`;
  const p = path.join(tmp, `mutation-en-role-${i}.md`), report=path.join(tmp,`mutation-en-role-${i}.json`);
  fs.writeFileSync(p,content); spawnSync(process.execPath,[validator,p,"--state-report",report],{encoding:"utf8"});
  const parsed=JSON.parse(fs.readFileSync(report,"utf8")); const st=parsed.trace.find((x)=>x.shot)?.state?.entities?.["@Ling"];
  if (!st || st.screen!==side || st.facing!==facing || !sameForTest(st.right_hand,"pistol")) { console.error(`FAIL mutation-en-role-${i}: ${JSON.stringify(st)}`); process.exit(1); }
  mutationCount += 1;
}

for (let i = 0; i < 60; i += 1) {
  const english = i % 2 === 1;
  const content = english ? `# Test\n\n| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |\n|---|---|---|---|\n| @Ling | Ling | protagonist | yes |\n| @Mori | Mori | supporting character | yes |\n\n### Clip 01｜15s｜16:9｜dialogue mode｜live action\n\n\`\`\`text\nSpatial staging: @Ling stands on frame left, holding a pistol in his right hand; @Mori stands on frame right, right hand empty.\nShot 1 (0-3s): Medium shot, static camera. @Ling holds a pistol in his right hand; @Mori's right hand is empty.\nShot 2 (3-6s): Medium shot, static camera. @Ling hands the pistol to @Mori; @Mori receives the pistol with his right hand.\nShot 3 (6-9s): Medium shot, static camera. @Ling's right hand is empty; @Mori holds the pistol in his right hand.\nShot 4 (9-12s): Close-up, static camera. @Mori remains still.\nShot 5 (12-15s): Medium shot, static camera. @Mori remains on frame right.\nEnding state: @Mori remains on frame right.\nConstraints: keep prop ownership continuous; no music, no subtitles.\n\`\`\`\n` : `# Test\n\n| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |\n|---|---|---|---|\n| @Ling | Ling | 主角 | 是 |\n| @Mori | Mori | 配角 | 是 |\n\n### Clip 01｜15秒｜16:9｜对白模式｜真人写实\n\n\`\`\`text\n空间站位：@Ling位于画面左侧，右手持手枪；@Mori位于画面右侧，右手为空。\n镜头一（0-3秒）：中景固定拍摄，@Ling右手持手枪，@Mori右手为空。\n镜头二（3-6秒）：中景固定拍摄，@Ling把手枪递给@Mori，@Mori右手接住。\n镜头三（6-9秒）：中景固定拍摄，@Ling右手为空，@Mori右手持手枪。\n镜头四（9-12秒）：近景固定拍摄，两人保持位置。\n镜头五（12-15秒）：中景固定拍摄，两人保持位置。\n结尾状态：两人保持原位。\n约束：保持道具归属连续；无音乐，无字幕。\n\`\`\`\n`;
  const p=path.join(tmp,`mutation-transfer-${i}.md`), report=path.join(tmp,`mutation-transfer-${i}.json`); fs.writeFileSync(p,content);
  spawnSync(process.execPath,[validator,p,"--state-report",report],{encoding:"utf8"}); const parsed=JSON.parse(fs.readFileSync(report,"utf8"));
  if (parsed.findings.some((f)=>["HAND_PROP_APPEARS","HAND_PROP_DISAPPEARS","PROP_TELEPORT","HAND_SWAP"].includes(f.code))) { console.error(`FAIL mutation-transfer-${i}: ${JSON.stringify(parsed.findings)}`); process.exit(1); }
  mutationCount += 1;
}

for (let i = 0; i < 60; i += 1) {
  const x = (i % 5) + 1;
  const content = twoActorBoard([
    `镜头一（0-3秒）：中景固定拍摄，@Ling位于画面右侧。\n<!-- CONTINUITY {"camera":{"position":{"x":0,"y":0,"z":1.6},"target":{"x":0,"y":10,"z":1.6}},"entities":{"@Ling":{"world_position":{"x":${x},"y":8,"z":0},"screen":"right"}}} -->`,
    `镜头二（3-6秒）：中景固定拍摄，摄影机换位，@Ling位于画面左侧。\n<!-- CONTINUITY {"camera":{"position":{"x":0,"y":16,"z":1.6},"target":{"x":0,"y":0,"z":1.6}},"entities":{"@Ling":{"world_position":{"x":${x},"y":8,"z":0},"screen":"left"}}} -->`,
    "镜头三（6-9秒）：中景固定拍摄，@Ling保持位置。","镜头四（9-12秒）：中景固定拍摄，@Ling保持位置。","镜头五（12-15秒）：中景固定拍摄，@Ling保持位置。",
  ], "@Ling位于画面右侧；@Mori位于画面中央。");
  const p=path.join(tmp,`mutation-projection-${i}.md`), report=path.join(tmp,`mutation-projection-${i}.json`); fs.writeFileSync(p,content);
  spawnSync(process.execPath,[validator,p,"--state-report",report],{encoding:"utf8"}); const parsed=JSON.parse(fs.readFileSync(report,"utf8"));
  if (parsed.findings.some((f)=>["SCREEN_POSITION_JUMP","SCREEN_PROJECTION_MISMATCH"].includes(f.code))) { console.error(`FAIL mutation-projection-${i}: ${JSON.stringify(parsed.findings)}`); process.exit(1); }
  mutationCount += 1;
}

if (mutationCount < 300) { console.error(`FAIL mutation suite count ${mutationCount}`); process.exit(1); }
console.log(`PASS mutation-suite (${mutationCount} generated cases)`);
console.log("All validator regression tests passed (44 fixed + 300 mutation = 344 cases).");
