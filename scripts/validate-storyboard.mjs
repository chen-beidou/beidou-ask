#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

// beidou-ask storyboard validator v3.0.1
// Layer 1: existing structural / timing / model-specific gates.
// Layer 2: continuity state machine that compares world state across adjacent shots and Clips.
// It accepts optional explicit machine annotations and falls back to conservative Chinese-prose extraction.
// v3.0.1 adds bilingual dialogue extraction/verbatim-capacity checks on top of bilingual state parsing, relation/transaction events, geometry-backed world-to-screen checks,
// scoped event authorization, and stronger structural compatibility without removing v2.1 behavior.

const argv = process.argv.slice(2);
let file = null;
let scriptPath = null;
let modelName = null;
let stateReportPath = null;
let strictContinuity = false;

for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === "--script") {
    scriptPath = argv[++i];
  } else if (argv[i] === "--model") {
    modelName = argv[++i];
  } else if (argv[i] === "--state-report") {
    stateReportPath = argv[++i];
  } else if (argv[i] === "--strict-continuity") {
    strictContinuity = true;
  } else if (!file) {
    file = argv[i];
  }
}

if (!file) {
  console.error("Usage: node validate-storyboard.mjs <storyboard.md> [--script <script.txt>] [--model <name>] [--state-report <report.json>] [--strict-continuity]");
  process.exit(2);
}

const resolved = path.resolve(file);
if (!fs.existsSync(resolved)) {
  console.error(`File not found: ${resolved}`);
  process.exit(2);
}

const PUNCT = /[\s，。！？、；：“”‘’…—,.!?;:'"()（）\-]/g;
const strip = (s) => s.replace(PUNCT, "");
const unique = (arr) => [...new Set(arr.filter(Boolean))];
const clone = (obj) => JSON.parse(JSON.stringify(obj));

let scriptNorm = null;
let scriptCanonical = null;
const canonicalDialogueText = (value) => String(value || "")
  .normalize("NFKC")
  .replace(/\r\n?/g, "\n")
  .replace(/[“”]/g, '"')
  .replace(/[‘’]/g, "'")
  .replace(/[—–]/g, "-")
  .replace(/\s+/g, " ")
  .trim();

function dialogueMetric(text) {
  const clean = String(text || "").trim();
  const han = [...clean.matchAll(/[\p{Script=Han}]/gu)].length;
  const latinWords = clean.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || [];
  if (han >= Math.max(2, latinWords.length)) return { kind: "han_chars", count: han, rate: 5.2, label: "chars" };
  return { kind: "words", count: latinWords.length, rate: 3.0, label: "words" };
}

function extractDialogue(text) {
  const found = [];
  const seen = new Set();
  const add = (value, source) => {
    const v = String(value || "").trim();
    if (!v) return;
    const key = canonicalDialogueText(v).toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    found.push({ text: v, source });
  };
  // MiniMax H3 / structured machine prompt dialogue. Keep only the spoken payload.
  for (const m of String(text).matchAll(/<d>\s*\[[^\]]+\]\s*([\s\S]*?)<\/d>/gi)) add(m[1], "d-tag");
  const raw = String(text);
  // Chinese spoken lines require a speech verb, an @speaker, or a role-style line prefix.
  // This avoids treating visible signs such as 招牌写着：“营业中” as dialogue.
  for (const m of raw.matchAll(/(?:说|说道|问|询问|喊|喊道|叫道|低声说|轻声说|回答|答道|道)[^“"\n]{0,50}[：:]?\s*[“"]([^”"\n]+)[”"]/g)) add(m[1], "spoken-quoted-zh");
  for (const m of raw.matchAll(/@[\p{L}\p{N}_-]+(?:（[^）\n]{0,80}）)?\s*[：:]\s*[“"]([^”"\n]+)[”"]/gu)) add(m[1], "speaker-quoted-zh");
  for (const line of raw.split(/\n/)) {
    const m = line.match(/^\s*(?:角色|人物|Speaker\s*)?[\p{L}\p{N}_-]{1,24}(?:（[^）\n]{0,80}）)?\s*[：:]\s*[“"]([^”"\n]+)[”"]/u);
    if (m) add(m[1], "role-line-quoted");
  }
  // English natural prompt forms: says/asks/shouts/whispers ... "line".
  for (const m of raw.matchAll(/\b(?:says?|asks?|shouts?|whispers?|murmurs?|replies?|answers?|calls?|yells?|speaks?)\b[^"\n]{0,80}"([^"\n]+)"/gi)) add(m[1], "spoken-quoted-en");
  return found;
}

function maskDialogueContent(text) {
  let out = String(text || "");
  for (const item of extractDialogue(out)) {
    // Replace payload only; retain speaker/action/delivery words around it.
    out = out.split(item.text).join("[DIALOGUE]");
  }
  return out;
}

if (scriptPath) {
  const scriptResolved = path.resolve(scriptPath);
  if (!fs.existsSync(scriptResolved)) {
    console.error(`Script file not found: ${scriptResolved}`);
    process.exit(2);
  }
  const scriptRaw = fs.readFileSync(scriptResolved, "utf8");
  scriptNorm = strip(scriptRaw);
  scriptCanonical = canonicalDialogueText(scriptRaw).toLowerCase();
}

const source = fs.readFileSync(resolved, "utf8");
const errors = [];
const warnings = [];
const continuityFindings = [];
const stateTrace = [];

function addContinuity(severity, code, where, message, confidence = 0.8, evidence = null) {
  const effective = strictContinuity && severity === "warning" && confidence >= 0.9 ? "error" : severity;
  const item = { severity: effective, code, where, message, confidence, evidence };
  continuityFindings.push(item);
  const rendered = `${where}: [${code}] ${message}${confidence < 1 ? ` (confidence ${confidence.toFixed(2)})` : ""}`;
  if (effective === "error") errors.push(rendered);
  else warnings.push(rendered);
}

function emptyEntity() {
  return {
    screen: null,
    depth: null,
    height: null,
    facing: null,
    move: null,
    posture: null,
    in_frame: null,
    entry_side: null,
    exit_side: null,
    left_hand: null,
    right_hand: null,
    injuries: null,
    wardrobe: null,
    gaze: null,
    // Optional explicit world-space layer. Natural-language mode remains conservative.
    world_position: null,
    axis_id: null,
    axis_side: null,
  };
}

function emptyWorld() {
  return {
    entities: {},
    props: {},
    scene: {},
    camera: { position: null, facing: null, target: null, yaw_deg: null, axis_id: null, axis_side: null },
    axes: {},
  };
}

function ensureEntity(world, id) {
  if (!world.entities[id]) world.entities[id] = emptyEntity();
  return world.entities[id];
}

function canonicalDirection(text) {
  if (!text) return null;
  if (/(从(?:画面)?左(?:侧)?(?:向|到|往)(?:画面)?右(?:侧)?|(?:画面)?左(?:侧)?→(?:画面)?右(?:侧)?|(?:from\s+)?(?:frame\s+)?left\s*(?:to|->|→|toward(?:s)?)\s*(?:frame\s+)?right)/i.test(text)) return "L>R";
  if (/(从(?:画面)?右(?:侧)?(?:向|到|往)(?:画面)?左(?:侧)?|(?:画面)?右(?:侧)?→(?:画面)?左(?:侧)?|(?:from\s+)?(?:frame\s+)?right\s*(?:to|->|→|toward(?:s)?)\s*(?:frame\s+)?left)/i.test(text)) return "R>L";
  if (/(?:向|往)(?:画面)?右(?:侧)?(?:移动|走|跑|冲|滑|退|爬|扑)|(?:moves?|walks?|runs?|rushes?|slides?|backs?|crawls?|lunges?)\s+(?:toward(?:s)?\s+)?(?:frame\s+)?right/i.test(text)) return "RIGHT";
  if (/(?:向|往)(?:画面)?左(?:侧)?(?:移动|走|跑|冲|滑|退|爬|扑)|(?:moves?|walks?|runs?|rushes?|slides?|backs?|crawls?|lunges?)\s+(?:toward(?:s)?\s+)?(?:frame\s+)?left/i.test(text)) return "LEFT";
  if (/(向纵深|往纵深|向后景|远离镜头|away\s+from\s+(?:the\s+)?camera|moves?\s+deeper)/i.test(text)) return "FRONT>BACK";
  if (/(向前景|朝镜头|靠近镜头|toward(?:s)?\s+(?:the\s+)?camera|approaches?\s+(?:the\s+)?camera)/i.test(text)) return "BACK>FRONT";
  if (/(上升|升高|向上|跃起|跳起|rises?|ascends?|jumps?\s+up|leaps?\s+up)/i.test(text)) return "UP";
  if (/(下降|下落|坠落|向下|falls?|drops?|descends?)/i.test(text)) return "DOWN";
  return null;
}

function canonicalScreen(text) {
  if (!text) return null;
  const locative = text
    .replace(/(?:面向|朝向|脸朝|转向|看向|盯着|注视|望向)(?:画面)?(?:左|右)(?:侧|边)?/g, "")
    .replace(/(?:向|往)(?:画面)?(?:左|右)(?:侧)?(?:移动|走|跑|冲|滑|退|爬|扑)/g, "")
    .replace(/(?:facing|turns?\s+toward|looks?\s+(?:to|toward(?:s)?))\s+(?:frame\s+)?(?:left|right)/ig, "")
    .replace(/(?:moves?|walks?|runs?|rushes?|slides?|backs?|crawls?|lunges?)\s+(?:toward(?:s)?\s+)?(?:frame\s+)?(?:left|right)/ig, "");
  if (/(?:位于|仍在|保持在?|站在|坐在|停在|落在|处于)(?:画面)?左(?:侧|边)|画面左侧(?:位置|区域)?|左侧画面|左画幅|(?:on\s+)?(?:the\s+)?(?:left\s+side\s+of\s+(?:the\s+)?frame|frame\s+left|screen\s+left)/i.test(locative)) return "left";
  if (/(?:位于|仍在|保持在?|站在|坐在|停在|落在|处于)(?:画面)?右(?:侧|边)|画面右侧(?:位置|区域)?|右侧画面|右画幅|(?:on\s+)?(?:the\s+)?(?:right\s+side\s+of\s+(?:the\s+)?frame|frame\s+right|screen\s+right)/i.test(locative)) return "right";
  if (/(?:位于|仍在|保持在?|站在|坐在|停在|落在|处于)?(?:画面)?(?:中央|中心)|居中|中央位置|(?:in|at)\s+(?:the\s+)?(?:center|centre)\s+of\s+(?:the\s+)?frame|frame\s+center|screen\s+center/i.test(locative)) return "center";
  return null;
}

function canonicalDepth(text) {
  if (!text) return null;
  if (/(前景|近景层|靠近镜头|foreground|near\s+(?:the\s+)?camera)/i.test(text)) return "foreground";
  if (/(中景层|中层空间|midground|middle\s+depth)/i.test(text)) return "midground";
  if (/(后景|纵深处|远处|远景层|background|deep\s+background|far\s+from\s+(?:the\s+)?camera)/i.test(text)) return "background";
  return null;
}

function canonicalHeight(text) {
  if (!text) return null;
  if (/(高处|上层|上方|较高|高位|upper\s+frame|high\s+position|above)/i.test(text)) return "high";
  if (/(低处|下层|下方|较低|低位|lower\s+frame|low\s+position|below)/i.test(text)) return "low";
  return null;
}

function canonicalFacing(text) {
  if (!text) return null;
  if (/(面向|朝向|脸朝|转向)(?:画面)?左(?:侧)?|fac(?:e|es|ing)\s+(?:frame\s+)?left|turns?\s+(?:to|toward(?:s)?)\s+(?:frame\s+)?left/i.test(text)) return "left";
  if (/(面向|朝向|脸朝|转向)(?:画面)?右(?:侧)?|fac(?:e|es|ing)\s+(?:frame\s+)?right|turns?\s+(?:to|toward(?:s)?)\s+(?:frame\s+)?right/i.test(text)) return "right";
  if (/(面向|朝向|脸朝)(?:镜头|摄影机)|fac(?:e|es|ing)\s+(?:the\s+)?camera/i.test(text)) return "camera";
  if (/(背对)(?:镜头|摄影机)|back\s+to\s+(?:the\s+)?camera|fac(?:e|es|ing)\s+away\s+from\s+(?:the\s+)?camera/i.test(text)) return "away_camera";
  return null;
}

function canonicalPosture(text) {
  if (!text) return null;
  if (/(倒地|躺在|躺倒|仰躺|侧躺|lying\s+down|lies?\s+(?:on|down)|on\s+(?:his|her|their)\s+back)/i.test(text)) return "lying";
  if (/(趴在|俯卧|趴伏|prone|face[-\s]?down)/i.test(text)) return "prone";
  if (/(跪地|跪着|单膝跪|kneels?|kneeling|on\s+one\s+knee)/i.test(text)) return "kneeling";
  if (/(蹲下|蹲着|半蹲|crouches?|crouching|squats?)/i.test(text)) return "crouching";
  if (/(坐下|坐着|坐在|落座|sits?\s+down|seated|sitting)/i.test(text)) return "sitting";
  if (/(站起|起身|站立|站着|站在|stands?\s+up|standing|stands?\s+(?:at|on|in))/i.test(text)) return "standing";
  return null;
}

function cleanProp(value) {
  if (!value) return null;
  const cleaned = value
    .replace(/^(?:一把|一支|一个|一只|一件|那把|这把|那支|这支)/, "")
    .replace(/(?:并|然后|同时|继续|缓慢|迅速|紧紧|死死).*$/, "")
    .replace(/[，。；、].*$/, "")
    .trim()
    .slice(0, 36) || null;
  if (cleaned && /^(?:拳|拳头|手|手掌|手指|掌心)$/.test(cleaned)) return null;
  return cleaned;
}

function parseHand(text, side) {
  const cn = side === "left" ? "左" : "右";
  const en = side === "left" ? "left" : "right";
  const emptyRe = new RegExp(`${cn}手(?:为空|空着|没有持物|未持物|松开|放空)|${en}\\s+hand\\s+(?:is\\s+)?(?:empty|free|open)|(?:nothing|no\\s+object)\\s+in\\s+(?:his|her|their|the)?\\s*${en}\\s+hand`, "i");
  if (emptyRe.test(text)) return "empty";
  const patterns = [
    new RegExp(`${cn}手(?:正|仍|一直|继续)?(?:持有|持着|持|拿着|拿|握着|握住|握|抓着|抓住|提着|提|托着|托|抱着|抱)([^，。；、]{1,24})`),
    new RegExp(`([^，。；、]{1,20})(?:由|在)${cn}手(?:持有|拿着|握着|抓着)?`),
    new RegExp(`(?:holds?|holding|grips?|gripping|carries?|carrying|clutches?|clutching|grasps?|grasping|keeps?)\\s+(?:an?\\s+|the\\s+)?([^,.;]{1,28}?)\\s+in\\s+(?:his|her|their|the)?\\s*${en}\\s+hand`, "i"),
    new RegExp(`${en}\\s+hand\\s+(?:holds?|holding|grips?|gripping|carries?|carrying|clutches?|clutching|grasps?|grasping)\\s+(?:an?\\s+|the\\s+)?([^,.;]{1,28})`, "i"),
    new RegExp(`(?:in|with)\\s+(?:his|her|their|the)?\\s*${en}\\s+hand[, ]+(?:he|she|they|@?[\\p{L}\\p{N}_-]+)?\\s*(?:holds?|holding|grips?|gripping|carries?|carrying)\\s+(?:an?\\s+|the\\s+)?([^,.;]{1,24})`, "iu"),
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return cleanProp(m[1]);
  }
  return null;
}

function parseInjuries(text) {
  const hits = [];
  const bodyParts = "左肩|右肩|左臂|右臂|左手|右手|左腿|右腿|腹部|胸口|胸部|背部|额头|头部|脸部|面部|颈部|腰部";
  const re = new RegExp(`(${bodyParts})(?:的)?(?:伤口|受伤|负伤|流血|出血|染血|骨折|擦伤|割伤|枪伤|刀伤|破损)`, "g");
  for (const m of text.matchAll(re)) hits.push(m[1]);
  const enParts = [
    ["left_shoulder", /left\s+shoulder\s+(?:is\s+)?(?:wounded|injured|bleeding|cut|shot)/i],
    ["right_shoulder", /right\s+shoulder\s+(?:is\s+)?(?:wounded|injured|bleeding|cut|shot)/i],
    ["left_arm", /left\s+arm\s+(?:is\s+)?(?:wounded|injured|bleeding|cut|shot|broken)/i],
    ["right_arm", /right\s+arm\s+(?:is\s+)?(?:wounded|injured|bleeding|cut|shot|broken)/i],
    ["left_leg", /left\s+leg\s+(?:is\s+)?(?:wounded|injured|bleeding|cut|shot|broken)/i],
    ["right_leg", /right\s+leg\s+(?:is\s+)?(?:wounded|injured|bleeding|cut|shot|broken)/i],
    ["chest", /chest\s+(?:is\s+)?(?:wounded|injured|bleeding|cut|shot)/i],
    ["back", /back\s+(?:is\s+)?(?:wounded|injured|bleeding|cut|shot)/i],
    ["head", /(?:head|forehead|face)\s+(?:is\s+)?(?:wounded|injured|bleeding|cut)/i],
  ];
  for (const [name, rx] of enParts) if (rx.test(text)) hits.push(name);
  if (/(浑身是血|全身受伤|遍体鳞伤|covered\s+in\s+blood|multiple\s+wounds)/i.test(text)) hits.push("general");
  return unique(hits);
}

function explicitHealthy(text) {
  return /(无伤|没有受伤|毫发无伤|伤势已愈|已经痊愈|uninjured|no\s+injuries|fully\s+healed|wound\s+has\s+healed)/i.test(text);
}

function parseWardrobe(text) {
  const m = text.match(/(?:身穿|穿着|穿的是)([^，。；]{1,30})/)
    || text.match(/(?:wears?|wearing|dressed\s+in)\s+([^,.;]{1,40})/i);
  return m ? m[1].trim() : null;
}

function parseGaze(text) {
  const m = text.match(/(?:看向|盯着|注视|望向|视线落在)(@?[\p{L}\p{N}_-]{1,20}|门口|窗口|窗外|地面|桌面|手中|镜头)/u)
    || text.match(/(?:looks?|stares?|gazes?|glances?)\s+(?:at|toward(?:s)?|to)\s+(@?[\p{L}\p{N}_-]{1,24}|the\s+door|the\s+window|the\s+floor|the\s+table|the\s+camera)/iu);
  return m ? m[1].trim() : null;
}

function eventFlags(text) {
  const raw = String(text || "");
  const t = raw
    .replace(/(?:没有|未|并未|不曾|没有再|不再)(?:发生)?(?:转身|掉头|回身|反向|转向|调转|绕到|越轴|移动|走动|走|跑|冲|换手|递给|交给|接过|站起|起身|坐下|蹲下|跪下|倒下|摔倒|躺下|趴下|受伤|负伤|包扎|止血|治疗|恢复|放下|拿起|拾起|捡起|抽出|拔出|打碎|损坏|修复|穿上|脱下|换衣|看向|转开视线|打开|关上|开启|关闭)/g, "")
    .replace(/保持(?:原)?(?:朝向|方向|姿势|位置|不动)/g, "")
    .replace(/\b(?:does\s+not|doesn't|did\s+not|didn't|never|without)\s+(?:turn|move|walk|run|switch|transfer|hand|give|pass|receive|stand|sit|kneel|fall|drop|pick|draw|injure|heal|open|close|look)\w*/gi, "")
    .replace(/\bremains?\s+(?:still|stationary|facing\s+the\s+same\s+way)\b/gi, "");
  return {
    turn: /(转身|掉头|回身|反向|转向|调转|绕到|越轴|轴线重建|重新建立轴线|\bturns?\b|turns?\s+around|reverses?\s+direction|crosses?\s+(?:the\s+)?axis)/i.test(t),
    transfer: /(换手|换到[左右]手|递给|交给|接过|从[左右]手.*到[左右]手|改用[左右]手|\b(?:hands?|gives?|passes?|transfers?|receives?|takes?)\b)/i.test(t),
    move: /(走|跑|冲|移|滑|爬|退|进|靠近|远离|跨|跃|跳|扑|追|绕|来到|走到|跑到|移动到|位移|出画|入画|\b(?:moves?|walks?|runs?|rushes?|slides?|crawls?|backs?|approaches?|retreats?|enters?|exits?|crosses?|jumps?|leaps?)\b)/i.test(t),
    posture: /(站起|起身|坐下|蹲下|跪下|倒下|摔倒|躺下|趴下|翻身|撑起|stands?\s+up|sits?\s+down|kneels?|crouches?|falls?\s+down|lies?\s+down|rolls?\s+over)/i.test(t),
    injuryCause: /(击中|打中|砍中|割伤|刺中|射中|中枪|受伤|负伤|撞伤|擦伤|划伤|被.*击|血溅|流血|hits?|strikes?|cuts?|stabs?|shoots?|wounds?|injures?|bleeds?)/i.test(t),
    recovery: /(包扎|止血|治疗|治愈|痊愈|恢复|伤口愈合|bandages?|treats?|heals?|recovers?)/i.test(t),
    propMove: /(放下|放到|放在|丢下|扔下|抛下|交给|递给|接过|拾起|捡起|拿起|抽出|拔出|收起|塞进|装进|puts?\s+down|places?|drops?|throws?|hands?|gives?|passes?|receives?|takes?|picks?\s+up|draws?|holsters?|stows?)/i.test(t),
    propDamage: /(打碎|砸碎|折断|掰断|切断|损坏|破裂|碎裂|烧毁|摧毁|撕裂|变形|修好|修复|breaks?|smashes?|damages?|shatters?|burns?|destroys?|tears?|repairs?|fixes?)/i.test(t),
    wardrobe: /(穿上|脱下|换上|换衣|摘下|戴上|系上|解开|撕破|弄脏|染血|puts?\s+on|takes?\s+off|changes?\s+clothes|removes?|wears?|dons?)/i.test(t),
    gaze: /(看向|盯着|注视|望向|移开视线|转开视线|低头|抬眼|looks?|stares?|gazes?|glances?|looks?\s+away)/i.test(t),
    scene: /(打开|关上|开启|关闭|亮起|熄灭|停电|恢复供电|雨停|开始下雨|风起|风停|破碎|倒塌|opens?|closes?|turns?\s+on|turns?\s+off|lights?\s+up|goes?\s+dark|starts?\s+raining|stops?\s+raining|collapses?)/i.test(t),
  };
}

function canonicalEventType(type) {
  const t = String(type || "").toLowerCase();
  const map = {
    reversal: "turn", axis_reset: "axis_reset", camera_cross_axis: "camera_cross_axis",
    hand_transfer: "hand_transfer", transfer: "hand_transfer",
    prop_transfer: "prop_transfer", give: "prop_transfer", pass: "prop_transfer", receive: "prop_transfer",
    move: "move", movement: "move", reposition: "move",
    posture_change: "posture", posture: "posture",
    injury: "injury", injury_cause: "injury", damage_character: "injury",
    recovery: "recovery", treatment: "recovery", heal: "recovery",
    prop_move: "prop_move", pickup: "prop_move", drop: "prop_move", place: "prop_move",
    prop_damage: "prop_damage", prop_repair: "prop_damage",
    wardrobe_change: "wardrobe", gaze_change: "gaze",
    scene_change: "scene", light_change: "scene", door_change: "scene", weather_change: "scene",
    turn: "turn",
  };
  return map[t] || t || null;
}

function normalizeEvent(raw) {
  if (typeof raw === "string") {
    return { type: canonicalEventType(raw), entity: null, actor: null, target: null, prop: null, scene_key: null, from_hand: null, to_hand: null, legacy_unscoped: true, ambiguous: false, raw };
  }
  if (!raw || typeof raw !== "object") return null;
  const type = canonicalEventType(raw.type || raw.event || raw.action);
  if (!type) return null;
  const normEntity = (v) => v ? (String(v).startsWith("@") ? String(v) : `@${v}`) : null;
  const entity = normEntity(raw.entity || raw.character || null);
  return {
    type,
    entity,
    actor: normEntity(raw.actor || raw.from_entity || raw.from_owner || null),
    target: normEntity(raw.target || raw.to_entity || raw.to_owner || raw.recipient || null),
    prop: raw.prop != null ? strip(String(raw.prop)).toLowerCase() : null,
    scene_key: raw.scene_key || raw.sceneKey || raw.key || null,
    from: raw.from ?? null,
    to: raw.to ?? null,
    from_hand: raw.from_hand || raw.fromHand || null,
    to_hand: raw.to_hand || raw.toHand || null,
    legacy_unscoped: false,
    ambiguous: false,
    raw,
  };
}

function normalizeEvents(events) {
  return (Array.isArray(events) ? events : []).map(normalizeEvent).filter(Boolean);
}


function validateExplicitEventShape(ev, where = "Annotation") {
  if (!ev || ev.legacy_unscoped) return true;
  const needEntity = new Set(["turn","move","posture","injury","recovery","wardrobe","gaze","hand_transfer"]);
  if (needEntity.has(ev.type) && !ev.entity) {
    addContinuity("error","STATE_EVENT_INVALID",where,`event type ${ev.type} requires entity`,1,ev.raw); return false;
  }
  if (ev.type === "hand_transfer" && !ev.prop) {
    addContinuity("error","STATE_EVENT_INVALID",where,"hand_transfer requires prop",1,ev.raw); return false;
  }
  if (ev.type === "prop_transfer") {
    if (!ev.actor || !ev.target || !ev.prop) {
      addContinuity("error","STATE_EVENT_INVALID",where,"prop_transfer requires actor + target + prop",1,ev.raw); return false;
    }
    if (ev.actor === ev.target) {
      addContinuity("error","STATE_EVENT_INVALID",where,"prop_transfer actor and target must differ; use hand_transfer for one entity",1,ev.raw); return false;
    }
  }
  if (["prop_move","prop_damage"].includes(ev.type) && !ev.prop) {
    addContinuity("error","STATE_EVENT_INVALID",where,`event type ${ev.type} requires prop`,1,ev.raw); return false;
  }
  if (ev.type === "scene" && !ev.scene_key) {
    addContinuity("error","STATE_EVENT_INVALID",where,"scene_change requires scene_key",1,ev.raw); return false;
  }
  return true;
}

function resolveLegacyEvents(events, explicitState = {}) {
  const entityIds = Object.keys(explicitState?.entities || {}).map((id) => id.startsWith("@") ? id : `@${id}`);
  const propIds = Object.keys(explicitState?.props || {}).map((id) => strip(String(id)).toLowerCase());
  const sceneKeys = Object.keys(explicitState?.scene || {});
  const entityTypes = new Set(["turn", "hand_transfer", "move", "posture", "injury", "recovery", "wardrobe", "gaze"]);
  const propTypes = new Set(["prop_move", "prop_damage"]);
  const sceneTypes = new Set(["scene"]);
  return (events || []).map((ev) => {
    if (!ev.legacy_unscoped) return ev;
    const out = { ...ev };
    if (entityTypes.has(ev.type)) {
      if (entityIds.length === 1) { out.entity = entityIds[0]; out.inferred_scope = true; out.legacy_unscoped = false; }
      else out.ambiguous = true;
    } else if (propTypes.has(ev.type)) {
      if (propIds.length === 1) { out.prop = propIds[0]; out.inferred_scope = true; out.legacy_unscoped = false; }
      else out.ambiguous = true;
    } else if (sceneTypes.has(ev.type)) {
      if (sceneKeys.length === 1) { out.scene_key = sceneKeys[0]; out.inferred_scope = true; out.legacy_unscoped = false; }
      else out.ambiguous = true;
    } else if (["axis_reset", "camera_cross_axis"].includes(ev.type)) {
      // These are camera/global-axis events by nature; retain unscoped camera semantics.
      out.legacy_unscoped = false; out.inferred_scope = true;
    } else {
      out.ambiguous = true;
    }
    return out;
  });
}

function flagsFromEvents(events, scope = {}) {
  const flags = {};
  for (const ev of events || []) {
    if (ev.ambiguous) continue;
    const participants = unique([ev.entity, ev.actor, ev.target]);
    const entityOk = !participants.length || (scope.entity && participants.includes(scope.entity));
    const propOk = !scope.prop || !ev.prop || ev.prop === scope.prop || sameProp(ev.prop, scope.prop);
    const sceneOk = !scope.scene_key || !ev.scene_key || ev.scene_key === scope.scene_key;
    if (participants.length && !entityOk) continue;
    if (ev.prop && !propOk) continue;
    if (ev.scene_key && !sceneOk) continue;
    if (ev.legacy_unscoped && (scope.entity || scope.prop || scope.scene_key)) continue;
    if (ev.type === "turn" || ev.type === "axis_reset" || ev.type === "camera_cross_axis") flags.turn = true;
    if (ev.type === "axis_reset" || ev.type === "camera_cross_axis") flags.axis = true;
    if (ev.type === "hand_transfer" || ev.type === "prop_transfer") flags.transfer = true;
    if (ev.type === "move") flags.move = true;
    if (ev.type === "posture") flags.posture = true;
    if (ev.type === "injury") flags.injuryCause = true;
    if (ev.type === "recovery") flags.recovery = true;
    if (ev.type === "prop_move" || ev.type === "prop_transfer") flags.propMove = true;
    if (ev.type === "prop_damage") flags.propDamage = true;
    if (ev.type === "wardrobe") flags.wardrobe = true;
    if (ev.type === "gaze") flags.gaze = true;
    if (ev.type === "scene") flags.scene = true;
  }
  return flags;
}

function mergeFlags(a, b) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b || {})) if (v) out[k] = true;
  return out;
}

function parseEntryExit(text) {
  let entry = null;
  let exit = null;
  if (/(从|由)(?:画面)?左(?:侧)?(?:入画|进入画面|进画)|enters?\s+(?:the\s+)?frame\s+from\s+(?:the\s+)?left|enters?\s+from\s+frame\s+left/i.test(text)) entry = "left";
  if (/(从|由)(?:画面)?右(?:侧)?(?:入画|进入画面|进画)|enters?\s+(?:the\s+)?frame\s+from\s+(?:the\s+)?right|enters?\s+from\s+frame\s+right/i.test(text)) entry = "right";
  if (/(从|由)(?:画面)?上(?:方)?(?:入画|进入画面|进画)|enters?\s+(?:the\s+)?frame\s+from\s+(?:the\s+)?top/i.test(text)) entry = "top";
  if (/(从|由)(?:画面)?下(?:方)?(?:入画|进入画面|进画)|enters?\s+(?:the\s+)?frame\s+from\s+(?:the\s+)?bottom/i.test(text)) entry = "bottom";
  if (/(从|由)(?:纵深|后景)(?:入画|进入画面|进画)|enters?\s+from\s+(?:the\s+)?background/i.test(text)) entry = "depth";
  if (/(向|从)?(?:画面)?左(?:侧)?(?:出画|离开画面)|exits?\s+(?:the\s+)?frame\s+(?:to|at)\s+(?:the\s+)?left|exits?\s+frame\s+left/i.test(text)) exit = "left";
  if (/(向|从)?(?:画面)?右(?:侧)?(?:出画|离开画面)|exits?\s+(?:the\s+)?frame\s+(?:to|at)\s+(?:the\s+)?right|exits?\s+frame\s+right/i.test(text)) exit = "right";
  if (/(向|从)?(?:画面)?上(?:方)?(?:出画|离开画面)|exits?\s+(?:the\s+)?frame\s+(?:to|at)\s+(?:the\s+)?top/i.test(text)) exit = "top";
  if (/(向|从)?(?:画面)?下(?:方)?(?:出画|离开画面)|exits?\s+(?:the\s+)?frame\s+(?:to|at)\s+(?:the\s+)?bottom/i.test(text)) exit = "bottom";
  if (/(向|从)?(?:纵深|后景)(?:出画|离开画面)|exits?\s+into\s+(?:the\s+)?background/i.test(text)) exit = "depth";
  return { entry, exit };
}

function findAllMentions(sentence, entityAliases) {
  const mentions = [];
  const hasAtRefs = /@[\p{L}\p{N}_-]+/u.test(sentence);
  for (const [id, aliases] of Object.entries(entityAliases)) {
    const candidates = hasAtRefs ? [id] : aliases.filter((a) => a && !a.startsWith("@"));
    for (const alias of candidates) {
      let from = 0;
      while (alias && from < sentence.length) {
        const index = sentence.indexOf(alias, from);
        if (index < 0) break;
        mentions.push({ id, alias, index, end: index + alias.length });
        from = index + Math.max(alias.length, 1);
      }
    }
  }
  mentions.sort((a, b) => a.index - b.index || b.alias.length - a.alias.length);
  const deduped = [];
  for (const m of mentions) {
    const collision = deduped.find((x) => x.index === m.index && x.end >= m.end);
    if (!collision) deduped.push(m);
  }
  return deduped.sort((a, b) => a.index - b.index);
}

function findEntityText(text, targetId, entityAliases) {
  const sentences = text.split(/[。；;\n]/).map((x) => x.trim()).filter(Boolean);
  const chunks = [];
  for (const sentence of sentences) {
    const mentions = findAllMentions(sentence, entityAliases);
    const targetMentions = mentions.filter((m) => m.id === targetId);
    if (!targetMentions.length) continue;
    if (new Set(mentions.map((m) => m.id)).size === 1) {
      chunks.push(sentence);
      continue;
    }
    for (const target of targetMentions) {
      const nextOther = mentions.find((m) => m.index > target.index && m.id !== targetId);
      chunks.push(sentence.slice(target.index, nextOther ? nextOther.index : sentence.length));
    }
  }
  return chunks.join("；");
}


function aliasPattern(entityAliases) {
  return Object.keys(entityAliases).map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).sort((a,b)=>b.length-a.length).join("|");
}

function normalizeHandName(v) {
  if (!v) return null;
  const x = String(v).toLowerCase();
  if (/左|left/.test(x)) return "left_hand";
  if (/右|right/.test(x)) return "right_hand";
  return null;
}

function parseRelationalEvents(text, entityAliases) {
  const events = [];
  const ids = Object.keys(entityAliases);
  if (ids.length < 2) return events;
  const ep = aliasPattern(entityAliases);
  const push = (raw) => {
    const ev = normalizeEvent(raw);
    if (!ev) return;
    const sig = JSON.stringify([ev.type, ev.actor, ev.target, ev.prop, ev.from_hand, ev.to_hand]);
    if (!events.some((x) => JSON.stringify([x.type,x.actor,x.target,x.prop,x.from_hand,x.to_hand]) === sig)) events.push(ev);
  };
  // Chinese: @A把手枪递给@B / @A将门禁卡交给@B / @A递给@B手枪
  let re = new RegExp(`(${ep})(?:把|将)?([^，。；,;]{1,24}?)(?:从([左右])手)?(?:递给|交给|传给|塞给|抛给)(${ep})(?:，|,)?(?:\\s*(${ep}))?(?:用)?([左右])?手?(?:接住|接过|拿住)?`, "gu");
  for (const m of text.matchAll(re)) {
    const actor=m[1], prop=cleanProp(m[2]), target=m[4];
    if (actor && target && actor!==target && prop) push({type:"prop_transfer",actor,target,prop,from_hand:normalizeHandName(m[3]),to_hand:normalizeHandName(m[6])});
  }
  re = new RegExp(`(${ep})(?:从|由)(${ep})(?:的)?(?:[左右]手|手中)?(?:接过|接住|拿过)([^，。；,;]{1,24})`, "gu");
  for (const m of text.matchAll(re)) {
    const target=m[1], actor=m[2], prop=cleanProp(m[3]);
    if (actor && target && actor!==target && prop) push({type:"prop_transfer",actor,target,prop});
  }
  // English: @A hands/passes/gives the pistol to @B; @B receives/takes the pistol from @A.
  re = new RegExp(`(${ep})\\s+(?:hands?|passes?|gives?|transfers?)\\s+(?:an?\\s+|the\\s+)?([^,.;]{1,30}?)\\s+to\\s+(${ep})(?:\\s+(?:into|to)\\s+(?:his|her|their)?\\s*(left|right)\\s+hand)?`, "giu");
  for (const m of text.matchAll(re)) {
    const actor=m[1], prop=cleanProp(m[2]), target=m[3];
    if (prop) push({type:"prop_transfer",actor,target,prop,to_hand:normalizeHandName(m[4])});
  }
  re = new RegExp(`(${ep})\\s+(?:receives?|takes?|catches?)\\s+(?:an?\\s+|the\\s+)?([^,.;]{1,30}?)\\s+from\\s+(${ep})(?:\\s+with\\s+(?:his|her|their)?\\s*(left|right)\\s+hand)?`, "giu");
  for (const m of text.matchAll(re)) {
    const target=m[1], prop=cleanProp(m[2]), actor=m[3];
    if (prop) push({type:"prop_transfer",actor,target,prop,to_hand:normalizeHandName(m[4])});
  }
  // If a recipient immediately says “right hand catches/receives it”, refine target hand for the nearest transfer.
  for (const ev of events) {
    if (ev.type !== "prop_transfer" || ev.to_hand) continue;
    const target = ev.target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const tail = text.match(new RegExp(`${target}[^。；;\\n]{0,32}?(左|右)手(?:接住|接过|拿住|握住)`, "u"));
    if (tail) ev.to_hand = normalizeHandName(tail[1]);
    const enTail = text.match(new RegExp(`${target}[^.;\\n]{0,40}?(?:catches?|receives?|takes?)[^.;\\n]{0,18}?with\\s+(?:his|her|their)?\\s*(left|right)\\s+hand`, "iu"));
    if (enTail) ev.to_hand = normalizeHandName(enTail[1]);
  }
  return events;
}

function transactionPatchForEntity(events, id, before) {
  const patch = {};
  for (const ev of events || []) {
    if (ev.type !== "prop_transfer" || !ev.prop) continue;
    const label = typeof ev.raw === "object" && ev.raw.prop ? ev.raw.prop : ev.prop;
    if (ev.actor === id) {
      const hand = ev.from_hand || (sameProp(before.left_hand, ev.prop) ? "left_hand" : sameProp(before.right_hand, ev.prop) ? "right_hand" : null);
      if (hand) patch[hand] = "empty";
    }
    if (ev.target === id && ev.to_hand) patch[ev.to_hand] = cleanProp(String(label));
  }
  return patch;
}

function vector3(v) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const x=Number(v.x), y=Number(v.y), z=Number(v.z ?? 0);
  return [x,y,z].every(Number.isFinite) ? {x,y,z} : null;
}
function vsub(a,b){ return {x:a.x-b.x,y:a.y-b.y,z:a.z-b.z}; }
function vdot(a,b){ return a.x*b.x+a.y*b.y+a.z*b.z; }
function vcross(a,b){ return {x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x}; }
function vnorm(a){ const n=Math.hypot(a.x,a.y,a.z); return n>1e-9?{x:a.x/n,y:a.y/n,z:a.z/n}:null; }
function cameraForward(camera) {
  if (!camera) return null;
  const pos=vector3(camera.position);
  const target=vector3(camera.target);
  if (pos && target) return vnorm(vsub(target,pos));
  if (camera.facing && typeof camera.facing === "object") return vnorm(vector3(camera.facing));
  if (Number.isFinite(Number(camera.yaw_deg))) {
    const r=Number(camera.yaw_deg)*Math.PI/180; return {x:Math.sin(r),y:Math.cos(r),z:0};
  }
  return null;
}
function projectWorldPoint(camera, point) {
  const pos=vector3(camera?.position), p=vector3(point), f=cameraForward(camera);
  if (!pos || !p || !f) return null;
  const up={x:0,y:0,z:1};
  let right=vnorm(vcross(f,up));
  if (!right) right={x:1,y:0,z:0};
  const delta=vsub(p,pos), horizontal=vdot(delta,right), depth=vdot(delta,f);
  return { horizontal, depth, screen: Math.abs(horizontal)<1e-6?"center":horizontal>0?"right":"left", depth_band: depth<0?"behind_camera":depth<3?"foreground":depth<10?"midground":"background" };
}
function validateWorldProjection(world, explicitState, where) {
  const camera=world.camera;
  if (!camera || !vector3(camera.position) || !cameraForward(camera)) return;
  for (const [id, st] of Object.entries(world.entities || {})) {
    if (!vector3(st.world_position)) continue;
    const proj=projectWorldPoint(camera, st.world_position);
    if (!proj) continue;
    const declared = explicitState?.entities?.[id] || explicitState?.entities?.[id.replace(/^@/,"")];
    if (declared && declared.screen && st.screen && st.screen !== proj.screen) {
      addContinuity("error","SCREEN_PROJECTION_MISMATCH",`${where} ${id}`,`declared screen=${st.screen} conflicts with world/camera projection=${proj.screen}`,1,{projection:proj});
    }
    if (declared && declared.depth && st.depth && proj.depth_band !== "behind_camera" && st.depth !== proj.depth_band) {
      addContinuity("warning","DEPTH_PROJECTION_MISMATCH",`${where} ${id}`,`declared depth=${st.depth} differs from geometry estimate=${proj.depth_band}`,0.95,{projection:proj});
    }
  }
}


function heldLocations(world, prop) {
  const hits=[];
  for (const [id,st] of Object.entries(world.entities || {})) {
    for (const hand of ["left_hand","right_hand"]) if (sameProp(st[hand],prop)) hits.push({owner:id,location:hand,label:st[hand]});
  }
  for (const [key,st] of Object.entries(world.props || {})) {
    if (sameProp(key,prop) || sameProp(st?.label,prop)) {
      if (st?.owner) hits.push({owner:st.owner,location:st.location || null,label:st.label || key});
    }
  }
  const uniq=[];
  for (const h of hits) if (!uniq.some((x)=>x.owner===h.owner && x.location===h.location)) uniq.push(h);
  return uniq;
}

function validateTransactions(world, events, where, explicitState = null) {
  for (const ev of events || []) {
    if (ev.type !== "prop_transfer" || !ev.actor || !ev.target || !ev.prop) continue;
    const held = heldLocations(world, ev.prop);
    const knownOwners = unique(held.map((x)=>x.owner));
    if (knownOwners.length && !knownOwners.includes(ev.actor)) {
      addContinuity(explicitState ? "error" : "warning","PROP_TRANSFER_SOURCE_MISMATCH",where,
        `${ev.actor} transfers ${ev.prop}, but tracked owner is ${knownOwners.join(", ")}`, explicitState ? 1 : 0.94, ev.raw);
    }
    if (ev.to_hand) {
      const target=world.entities?.[ev.target];
      const occupied=target?.[ev.to_hand];
      if (occupied && occupied!=="empty" && !sameProp(occupied,ev.prop)) {
        addContinuity(explicitState ? "error" : "warning","TRANSFER_TARGET_HAND_OCCUPIED",where,
          `${ev.target}.${ev.to_hand} already holds ${occupied} while receiving ${ev.prop}; show a release/transfer first`, explicitState ? 1 : 0.94, ev.raw);
      }
    }
  }
}

function detectPropDuplicates(world, where, explicit = false) {
  const seen=new Map();
  for (const [id,st] of Object.entries(world.entities || {})) {
    for (const hand of ["left_hand","right_hand"]) {
      const prop=st[hand];
      if (!prop || prop==="empty") continue;
      const key=strip(String(prop)).toLowerCase();
      if (!key) continue;
      const arr=seen.get(key) || [];
      arr.push({owner:id,location:hand,label:prop}); seen.set(key,arr);
    }
  }
  for (const arr of seen.values()) {
    const owners=unique(arr.map((x)=>x.owner));
    if (owners.length > 1) {
      addContinuity(explicit ? "error" : "warning","PROP_DUPLICATED",where,
        `${arr[0].label} is simultaneously held by multiple entities: ${arr.map((x)=>`${x.owner}.${x.location}`).join(" | ")}`,
        explicit ? 1 : 0.96, arr);
    }
  }
}

function parseNaturalEntity(text) {
  const entryExit = parseEntryExit(text);
  const injuries = parseInjuries(text);
  let leftHand = parseHand(text, "left");
  let rightHand = parseHand(text, "right");

  const r2l = text.match(/(?:把|将)([^，。；、]{1,20}?)从右手(?:换到|交到|递到|移到|换至|移至)左手/)
    || text.match(/(?:^|[，,；;])([^@，。；、]{1,20}?)从右手(?:换到|交到|递到|移到|换至|移至)左手/)
    || text.match(/(?:switches?|moves?|transfers?)\s+(?:an?\s+|the\s+)?([^,.;]{1,24}?)\s+from\s+(?:his|her|their)?\s*right\s+hand\s+to\s+(?:his|her|their)?\s*left\s+hand/i);
  const l2r = text.match(/(?:把|将)([^，。；、]{1,20}?)从左手(?:换到|交到|递到|移到|换至|移至)右手/)
    || text.match(/(?:^|[，,；;])([^@，。；、]{1,20}?)从左手(?:换到|交到|递到|移到|换至|移至)右手/)
    || text.match(/(?:switches?|moves?|transfers?)\s+(?:an?\s+|the\s+)?([^,.;]{1,24}?)\s+from\s+(?:his|her|their)?\s*left\s+hand\s+to\s+(?:his|her|their)?\s*right\s+hand/i);
  if (r2l) { leftHand = cleanProp(r2l[1]); rightHand = "empty"; }
  else if (l2r) { rightHand = cleanProp(l2r[1]); leftHand = "empty"; }

  let move = canonicalDirection(text);
  if (!move && /(停下|站住|停止移动|不再移动|静止不动|stops?\s+moving|remains?\s+still|stands?\s+still)/i.test(text)) move = "NONE";

  return {
    patch: {
      screen: canonicalScreen(text), depth: canonicalDepth(text), height: canonicalHeight(text), facing: canonicalFacing(text), move,
      posture: canonicalPosture(text), in_frame: entryExit.exit ? false : entryExit.entry ? true : null,
      entry_side: entryExit.entry, exit_side: entryExit.exit, left_hand: leftHand, right_hand: rightHand,
      injuries: injuries.length ? injuries : explicitHealthy(text) ? [] : null,
      wardrobe: parseWardrobe(text), gaze: parseGaze(text),
    },
    flags: eventFlags(text),
    confidence: /@[\p{L}\p{N}_-]+/u.test(text) ? 0.92 : 0.82,
  };
}

function normalizeExplicitEntity(raw = {}) {
  const normalized = emptyEntity();
  const get = (...keys) => keys.map((k) => raw[k]).find((v) => v !== undefined && v !== null);
  const screen = get("screen", "screen_side", "position");
  const facing = get("facing", "orientation");
  const move = get("move", "movement", "direction");
  normalized.screen = screen || null;
  normalized.depth = get("depth") || null;
  normalized.height = get("height") || null;
  normalized.facing = facing || null;
  normalized.move = move || null;
  normalized.posture = get("posture", "pose") || null;
  normalized.in_frame = get("in_frame", "visible") ?? null;
  normalized.entry_side = get("entry_side", "entry") || null;
  normalized.exit_side = get("exit_side", "exit") || null;
  normalized.left_hand = get("left_hand", "left") || null;
  normalized.right_hand = get("right_hand", "right") || null;
  const injuries = get("injuries", "injury");
  normalized.injuries = injuries === undefined ? null : Array.isArray(injuries) ? injuries : injuries ? [injuries] : [];
  normalized.wardrobe = get("wardrobe", "costume") || null;
  normalized.gaze = get("gaze", "gaze_target") || null;
  normalized.world_position = get("world_position", "world", "position3d") ?? null;
  normalized.axis_id = get("axis_id", "axis") || null;
  normalized.axis_side = get("axis_side", "side_of_axis") || null;
  return normalized;
}

function extractExplicitAnnotation(segmentText) {
  const matches = [...segmentText.matchAll(/<!--\s*CONTINUITY\s*([\s\S]*?)-->/gi)];
  if (!matches.length) return null;
  const merged = { entities: {}, props: {}, scene: {}, camera: null, axes: {}, events: [] };
  for (const m of matches) {
    const raw = m[1].trim();
    try {
      const parsed = JSON.parse(raw);
      const entities = parsed.entities || parsed.characters || (Object.keys(parsed).some((k) => k.startsWith("@")) ? parsed : {});
      for (const [id, state] of Object.entries(entities)) merged.entities[id] = normalizeExplicitEntity(state);
      if (parsed.props && typeof parsed.props === "object") Object.assign(merged.props, parsed.props);
      if (parsed.scene && typeof parsed.scene === "object") Object.assign(merged.scene, parsed.scene);
      if (parsed.camera && typeof parsed.camera === "object") merged.camera = { ...(merged.camera || {}), ...parsed.camera };
      if (parsed.axes && typeof parsed.axes === "object") Object.assign(merged.axes, parsed.axes);
      if (Array.isArray(parsed.events)) {
        const normalizedEvents = normalizeEvents(parsed.events);
        for (const ev of normalizedEvents) validateExplicitEventShape(ev, "Annotation");
        merged.events.push(...normalizedEvents);
      }
    } catch (err) {
      addContinuity("warning", "STATE_ANNOTATION_INVALID", "Annotation", `invalid CONTINUITY JSON: ${err.message}`, 1, raw.slice(0, 160));
    }
  }
  return merged;
}

function patchEntity(current, patch) {
  const next = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    if (value !== null && value !== undefined) next[key] = Array.isArray(value) ? [...value] : value;
  }
  return next;
}

function sameProp(a, b) {
  if (!a || !b || a === "empty" || b === "empty") return false;
  const na = strip(String(a)).toLowerCase();
  const nb = strip(String(b)).toLowerCase();
  return na === nb || (na.length >= 2 && nb.includes(na)) || (nb.length >= 2 && na.includes(nb));
}

function hasPositionTransition(prev, next, flags) {
  if (flags.move || flags.turn) return true;
  if (next.move && next.move !== "NONE") return true;
  return false;
}

function movementSign(direction) {
  if (["L>R", "RIGHT"].includes(direction)) return 1;
  if (["R>L", "LEFT"].includes(direction)) return -1;
  if (["FRONT>BACK"].includes(direction)) return 2;
  if (["BACK>FRONT"].includes(direction)) return -2;
  return 0;
}

function normalizeWorldPosition(value) {
  if (value == null) return null;
  if (typeof value === "string" || typeof value === "number") return value;
  if (Array.isArray(value)) return value.map((x) => typeof x === "number" ? x : String(x));
  if (typeof value === "object") {
    const out = {};
    for (const key of ["x", "y", "z", "zone", "landmark", "level"]) {
      if (value[key] !== undefined) out[key] = value[key];
    }
    return Object.keys(out).length ? out : value;
  }
  return value;
}

function sameWorldPosition(a, b) {
  if (a == null || b == null) return true;
  return JSON.stringify(normalizeWorldPosition(a)) === JSON.stringify(normalizeWorldPosition(b));
}

function normalizeCamera(raw = {}, prev = null) {
  const base = prev || { position: null, facing: null, target: null, yaw_deg: null, axis_id: null, axis_side: null };
  return {
    position: raw.position !== undefined ? normalizeWorldPosition(raw.position) : base.position,
    facing: raw.facing !== undefined ? raw.facing : base.facing,
    target: raw.target !== undefined ? normalizeWorldPosition(raw.target) : base.target,
    yaw_deg: raw.yaw_deg !== undefined ? Number(raw.yaw_deg) : (raw.yaw !== undefined ? Number(raw.yaw) : base.yaw_deg),
    axis_id: raw.axis_id !== undefined ? raw.axis_id : (raw.axis !== undefined ? raw.axis : base.axis_id),
    axis_side: raw.axis_side !== undefined ? raw.axis_side : (raw.side_of_axis !== undefined ? raw.side_of_axis : base.axis_side),
  };
}

function expectedEntryAfterExit(prev) {
  const sign = movementSign(prev.move);
  if (sign === 1 && prev.exit_side === "right") return "left";
  if (sign === -1 && prev.exit_side === "left") return "right";
  return null;
}

function compareEntity(prev, next, ctx) {
  const { where, flags, confidence, explicit, cameraChanged = false } = ctx;
  if (!prev) return;

  if (prev.exit_side && next.entry_side && !flags.turn) {
    const expectedEntry = expectedEntryAfterExit(prev);
    if (expectedEntry && next.entry_side !== expectedEntry) {
      addContinuity(explicit ? "error" : "warning", "ENTRY_EXIT_MISMATCH", where,
        `travel direction ${prev.move} exits ${prev.exit_side}; next entry should normally be ${expectedEntry}, but is ${next.entry_side}. Show a turn/reposition if intentional`,
        explicit ? 1 : confidence);
    }
  }

  if (prev.move && next.move && prev.move !== next.move && prev.move !== "NONE" && next.move !== "NONE") {
    const a = movementSign(prev.move);
    const b = movementSign(next.move);
    const opposite = a !== 0 && b !== 0 && a === -b;
    if (opposite && !flags.turn) {
      addContinuity(explicit ? "error" : "warning", "MOTION_REVERSAL", where,
        `movement reverses ${prev.move} → ${next.move} without a shown turn/reversal`, explicit ? 1 : confidence);
    }
  }

  if (prev.screen && next.screen && prev.screen !== next.screen && !hasPositionTransition(prev, next, flags)) {
    const worldStableUnderCameraChange = cameraChanged && prev.world_position != null && next.world_position != null && sameWorldPosition(prev.world_position, next.world_position);
    const jump = !worldStableUnderCameraChange && ((prev.screen === "left" && next.screen === "right") || (prev.screen === "right" && next.screen === "left"));
    if (jump) {
      addContinuity(explicit ? "error" : "warning", "SCREEN_POSITION_JUMP", where,
        `screen position jumps ${prev.screen} → ${next.screen} without movement/transition evidence`, explicit ? 1 : confidence);
    }
  }

  if (prev.world_position != null && next.world_position != null && !sameWorldPosition(prev.world_position, next.world_position) && !flags.move) {
    addContinuity(explicit ? "error" : "warning", "WORLD_POSITION_JUMP", where,
      `world position changes ${JSON.stringify(prev.world_position)} → ${JSON.stringify(next.world_position)} without a scoped move/reposition event`, explicit ? 1 : confidence);
  }

  if (prev.axis_id && next.axis_id && prev.axis_id !== next.axis_id && !flags.axis && !flags.turn) {
    addContinuity(explicit ? "error" : "warning", "AXIS_ID_JUMP", where,
      `action axis changes ${prev.axis_id} → ${next.axis_id} without axis reset/re-establishment`, explicit ? 1 : confidence);
  }

  if (prev.axis_side && next.axis_side && prev.axis_side !== next.axis_side && !flags.move && !flags.turn && !flags.axis) {
    addContinuity(explicit ? "error" : "warning", "ENTITY_AXIS_SIDE_JUMP", where,
      `entity changes side of axis ${prev.axis_side} → ${next.axis_side} without movement/turn/axis reset`, explicit ? 1 : confidence);
  }

  const prevLeft = prev.left_hand;
  const prevRight = prev.right_hand;
  const nextLeft = next.left_hand;
  const nextRight = next.right_hand;

  for (const [handName, beforeHand, afterHand] of [["left", prevLeft, nextLeft], ["right", prevRight, nextRight]]) {
    if (beforeHand && beforeHand !== "empty" && afterHand === "empty" && !flags.transfer && !flags.propMove) {
      addContinuity(explicit ? "error" : "warning", "HAND_PROP_DISAPPEARS", where,
        `${beforeHand} disappears from ${handName} hand without a drop/place/transfer action`, explicit ? 1 : confidence);
    }
    if (beforeHand === "empty" && afterHand && afterHand !== "empty" && !flags.transfer && !flags.propMove) {
      addContinuity(explicit ? "error" : "warning", "HAND_PROP_APPEARS", where,
        `${afterHand} appears in ${handName} hand without a pickup/draw/transfer action`, explicit ? 1 : confidence);
    }
    if (beforeHand && afterHand && beforeHand !== "empty" && afterHand !== "empty" && !sameProp(beforeHand, afterHand) && !flags.transfer && !flags.propMove) {
      addContinuity(explicit ? "error" : "warning", "HAND_PROP_REPLACED", where,
        `${handName} hand changes ${beforeHand} → ${afterHand} without a prop-change action`, explicit ? 1 : confidence);
    }
  }

  if (sameProp(prevRight, nextLeft) && !flags.transfer) {
    addContinuity(explicit ? "error" : "warning", "HAND_SWAP", where,
      `prop appears to move from right hand to left hand without an explicit transfer`, explicit ? 1 : confidence,
      `${prevRight}`);
  }
  if (sameProp(prevLeft, nextRight) && !flags.transfer) {
    addContinuity(explicit ? "error" : "warning", "HAND_SWAP", where,
      `prop appears to move from left hand to right hand without an explicit transfer`, explicit ? 1 : confidence,
      `${prevLeft}`);
  }

  if (prev.posture && next.posture && prev.posture !== next.posture && !flags.posture && !flags.move) {
    addContinuity(explicit ? "error" : "warning", "POSTURE_JUMP", where,
      `posture changes ${prev.posture} → ${next.posture} without a visible transition`, explicit ? 1 : confidence);
  }

  if (Array.isArray(prev.injuries) && Array.isArray(next.injuries)) {
    const disappeared = prev.injuries.filter((x) => !next.injuries.includes(x));
    if (disappeared.length && !flags.recovery) {
      addContinuity(explicit ? "error" : "warning", "INJURY_RESET", where,
        `injury state disappears (${disappeared.join(", ")}) without treatment/recovery`, explicit ? 1 : confidence);
    }
    const appeared = next.injuries.filter((x) => !prev.injuries.includes(x));
    if (appeared.length && prev.injuries.length === 0 && !flags.injuryCause) {
      addContinuity(explicit ? "error" : "warning", "INJURY_APPEARS", where,
        `new injury appears (${appeared.join(", ")}) without an injury-causing event`, explicit ? 1 : confidence);
    }
  }

  if (prev.wardrobe && next.wardrobe && prev.wardrobe !== next.wardrobe && !flags.wardrobe) {
    addContinuity(explicit ? "error" : "warning", "WARDROBE_JUMP", where,
      `wardrobe changes "${prev.wardrobe}" → "${next.wardrobe}" without a shown wardrobe-change event`, explicit ? 1 : confidence);
  }

  if (prev.gaze && next.gaze && prev.gaze !== next.gaze && !flags.gaze) {
    addContinuity("warning", "GAZE_JUMP", where,
      `gaze target changes ${prev.gaze} → ${next.gaze} without a visible gaze shift`, explicit ? 1 : confidence);
  }

  if (prev.facing && next.facing && prev.facing !== next.facing && !flags.turn) {
    const flip = (prev.facing === "left" && next.facing === "right") || (prev.facing === "right" && next.facing === "left");
    if (flip) {
      addContinuity("warning", "FACING_FLIP", where,
        `facing flips ${prev.facing} → ${next.facing} without a shown turn; verify axis continuity`, explicit ? 1 : confidence);
    }
  }
}

function deriveProps(world) {
  const props = {};
  for (const [id, st] of Object.entries(world.entities)) {
    for (const [handKey, handName] of [["left_hand", "left_hand"], ["right_hand", "right_hand"]]) {
      const prop = st[handKey];
      if (prop && prop !== "empty") {
        const key = strip(String(prop)).toLowerCase();
        if (key) props[key] = { label: prop, owner: id, location: handName };
      }
    }
  }
  return props;
}

function naturalFlagsForProp(text, key, prev, next) {
  const labels = unique([key, prev?.label, next?.label]).map((x) => String(x || "")).filter(Boolean);
  const clauses = String(text || "").split(/[，,。；;\n]/).map((x) => x.trim()).filter(Boolean);
  const related = clauses.filter((clause) => labels.some((label) => clause.includes(label)));
  if (!related.length) return {};
  return eventFlags(related.join("；"));
}

function compareProps(prevProps, nextProps, where, text, explicit, events = []) {
  for (const [key, prev] of Object.entries(prevProps)) {
    const next = nextProps[key];
    if (!next) continue;
    const naturalFlags = naturalFlagsForProp(text, key, prev, next);
    const propScope = strip(String(next.label || prev.label || key)).toLowerCase();
    const scopedFlags = mergeFlags(naturalFlags, flagsFromEvents(events, { prop: propScope, entity: next.owner || prev.owner }));
    if ((prev.owner !== next.owner || prev.location !== next.location) && !scopedFlags.transfer && !scopedFlags.propMove) {
      addContinuity(explicit ? "error" : "warning", "PROP_TELEPORT", where,
        `${prev.label} changes ${prev.owner}.${prev.location} → ${next.owner}.${next.location} without a prop-scoped transfer/placement event`,
        explicit ? 1 : 0.86);
    }
    if (prev.condition != null && next.condition != null && prev.condition !== next.condition && !scopedFlags.propDamage) {
      addContinuity(explicit ? "error" : "warning", "PROP_CONDITION_JUMP", where,
        `${prev.label} condition changes ${prev.condition} → ${next.condition} without a prop-scoped damage/repair event`,
        explicit ? 1 : 0.86);
    }
  }
}

function compareCamera(prevCamera, nextCamera, where, events) {
  if (!prevCamera || !nextCamera) return;
  const flags = flagsFromEvents(events, {});
  if (prevCamera.axis_id && nextCamera.axis_id && prevCamera.axis_id === nextCamera.axis_id &&
      prevCamera.axis_side && nextCamera.axis_side && prevCamera.axis_side !== nextCamera.axis_side && !flags.axis) {
    addContinuity("error", "CAMERA_AXIS_CROSS", where,
      `camera crosses action axis ${prevCamera.axis_id}: ${prevCamera.axis_side} → ${nextCamera.axis_side} without axis_reset/camera_cross_axis event`, 1);
  }
  if (prevCamera.axis_id && nextCamera.axis_id && prevCamera.axis_id !== nextCamera.axis_id && !flags.axis) {
    addContinuity("error", "CAMERA_AXIS_ID_JUMP", where,
      `camera axis changes ${prevCamera.axis_id} → ${nextCamera.axis_id} without re-establishing the new axis`, 1);
  }
}

function applySegment(world, text, entityAliases, where, explicitState = null) {
  const nextWorld = clone(world);
  const explicitEntities = explicitState?.entities || {};
  const relationalEvents = parseRelationalEvents(text, entityAliases);
  const events = resolveLegacyEvents([...(explicitState?.events || []), ...relationalEvents], explicitState || {});
  validateTransactions(world, events, where, explicitState);
  const previewCamera = explicitState?.camera ? normalizeCamera(explicitState.camera, world.camera || emptyWorld().camera) : (world.camera || emptyWorld().camera);
  const cameraChanged = JSON.stringify(previewCamera) !== JSON.stringify(world.camera || emptyWorld().camera);
  const touched = new Set();

  for (const [id] of Object.entries(entityAliases)) {
    const explicitPatch = explicitEntities[id] || explicitEntities[id.replace(/^@/, "")];
    const localText = findEntityText(text, id, entityAliases);
    if (!explicitPatch && !localText) continue;

    const before = clone(ensureEntity(nextWorld, id));
    let patch;
    let flags;
    let confidence;
    let explicit = false;
    if (explicitPatch) {
      patch = normalizeExplicitEntity(explicitPatch);
      // Natural-language actions are entity-local; explicit events must also be scoped to this entity.
      const localNatural = localText ? eventFlags(localText) : {};
      flags = mergeFlags(localNatural, flagsFromEvents(events, { entity: id }));
      confidence = 1;
      explicit = true;
    } else {
      const parsed = parseNaturalEntity(localText);
      patch = parsed.patch;
      flags = mergeFlags(parsed.flags, flagsFromEvents(events, { entity: id }));
      confidence = parsed.confidence;
    }

    patch = { ...patch, ...transactionPatchForEntity(events, id, before) };
    patch.world_position = normalizeWorldPosition(patch.world_position);
    const after = patchEntity(before, patch);
    compareEntity(before, after, { where: `${where} ${id}`, flags, confidence, explicit, cameraChanged });
    nextWorld.entities[id] = after;
    touched.add(id);
  }

  // Explicit annotations can introduce entities not present in the asset card.
  for (const [rawId, explicitPatch] of Object.entries(explicitEntities)) {
    const id = rawId.startsWith("@") ? rawId : `@${rawId}`;
    if (touched.has(id)) continue;
    const before = clone(ensureEntity(nextWorld, id));
    let patch = normalizeExplicitEntity(explicitPatch);
    patch = { ...patch, ...transactionPatchForEntity(events, id, before) };
    patch.world_position = normalizeWorldPosition(patch.world_position);
    const after = patchEntity(before, patch);
    const flags = flagsFromEvents(events, { entity: id });
    compareEntity(before, after, { where: `${where} ${id}`, flags, confidence: 1, explicit: true, cameraChanged });
    nextWorld.entities[id] = after;
  }

  detectPropDuplicates(nextWorld, where, Boolean(explicitState));

  const prevScene = world.scene || {};
  const nextScene = { ...prevScene };
  if (explicitState?.scene && typeof explicitState.scene === "object") {
    for (const [key, value] of Object.entries(explicitState.scene)) {
      // Explicit scene-state changes require a matching scoped event. A generic word such as
      // “打开” elsewhere in the shot must not authorize an unrelated door/light/weather change.
      const sceneFlags = flagsFromEvents(events, { scene_key: key });
      if (Object.prototype.hasOwnProperty.call(prevScene, key) && prevScene[key] !== value && !sceneFlags.scene) {
        addContinuity("error", "SCENE_STATE_JUMP", where,
          `scene state ${key} changes ${JSON.stringify(prevScene[key])} → ${JSON.stringify(value)} without a scene-key-scoped change event`, 1);
      }
      nextScene[key] = value;
    }
  }
  nextWorld.scene = nextScene;

  const prevCamera = world.camera || emptyWorld().camera;
  const nextCamera = explicitState?.camera ? normalizeCamera(explicitState.camera, prevCamera) : clone(prevCamera);
  if (explicitState?.camera) compareCamera(prevCamera, nextCamera, where, events);
  nextWorld.camera = nextCamera;
  if (explicitState?.axes && typeof explicitState.axes === "object") nextWorld.axes = { ...(world.axes || {}), ...explicitState.axes };
  validateWorldProjection(nextWorld, explicitState, where);

  const prevProps = { ...(world.props || {}), ...deriveProps(world) };
  // Unmentioned durable props carry forward. If a tracked hand is explicitly emptied or
  // replaced, clear the stale hand location before applying the new derived hand state.
  const nextProps = { ...prevProps };
  for (const [propKey, propState] of Object.entries(prevProps)) {
    if (!propState?.owner || !["left_hand", "right_hand"].includes(propState.location)) continue;
    const holder = nextWorld.entities[propState.owner];
    if (!holder) continue;
    const handValue = holder[propState.location];
    if (handValue === "empty" || (handValue && !sameProp(handValue, propState.label || propKey))) delete nextProps[propKey];
  }
  Object.assign(nextProps, deriveProps(nextWorld));
  if (explicitState?.props && typeof explicitState.props === "object") {
    for (const [propId, rawProp] of Object.entries(explicitState.props)) {
      const key = strip(String(propId)).toLowerCase();
      if (!key) continue;
      const prevProp = prevProps[key] || {};
      const has = (field) => Object.prototype.hasOwnProperty.call(rawProp, field);
      nextProps[key] = {
        label: has("label") ? rawProp.label : (prevProp.label || propId),
        owner: has("owner") ? rawProp.owner : (prevProp.owner ?? null),
        location: has("location") ? rawProp.location : (prevProp.location ?? null),
        condition: has("condition") ? rawProp.condition : (prevProp.condition ?? null),
      };
    }
  }
  if (explicitState?.props && typeof explicitState.props === "object") {
    const handDerivedNow = deriveProps(nextWorld);
    for (const [key, handState] of Object.entries(handDerivedNow)) {
      const ledger = nextProps[key];
      if (ledger && ledger.owner && (ledger.owner !== handState.owner || (ledger.location && ledger.location !== handState.location))) {
        addContinuity("error","PROP_LEDGER_CONFLICT",where,
          `${ledger.label || key} ledger says ${ledger.owner}.${ledger.location}, but hand state says ${handState.owner}.${handState.location}`,1);
      }
    }
  }
  compareProps(prevProps, nextProps, where, text, Boolean(explicitState), events);
  nextWorld.props = nextProps;

  const ambiguousLegacy = events.filter((ev) => ev.legacy_unscoped && ev.ambiguous);
  const inferredLegacy = events.filter((ev) => ev.inferred_scope);
  if (ambiguousLegacy.length || inferredLegacy.length) {
    addContinuity("warning", ambiguousLegacy.length ? "LEGACY_EVENT_AMBIGUOUS" : "LEGACY_EVENT_INFERRED_SCOPE", where,
      ambiguousLegacy.length
        ? `legacy string event scope is ambiguous and was NOT used to authorize a transition; use an event object with entity/prop/scene_key`
        : `legacy string event scope was inferred for backward compatibility; prefer a scoped event object`,
      ambiguousLegacy.length ? 0.95 : 0.75,
      (ambiguousLegacy.length ? ambiguousLegacy : inferredLegacy).map((ev) => ev.raw));
  }
  return nextWorld;
}

const clipHeader = /^###\s+Clip\s+(\d+)\s*｜\s*(\d+(?:\.\d+)?)(?:秒|s)\s*｜\s*(\d+(?:\.\d+)?:\d+(?:\.\d+)?)\s*｜\s*([^\n]+)$/gmi;
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
const assetRows = [...assetCard.matchAll(/\|\s*(@[\p{L}\p{N}_-]+)\s*\|\s*([^|\n]*)\|\s*([^|\n]*)\|/gu)];
const definedAssets = new Set(assetRows.map((m) => m[1]));
const entityAliases = {};
for (const m of assetRows) {
  const id = m[1];
  const bare = id.slice(1);
  const anchor = (m[2] || "").trim();
  const usage = (m[3] || "").trim();
  const clearlyNonCharacter = /(场景|地点|环境|道具|物品|物件|武器|服装|饰品|建筑|房间|车辆|载具|证物|家具|scene|location|environment|prop|object|weapon|costume|wardrobe|building|room|vehicle|furniture)/i.test(usage);
  if (clearlyNonCharacter) continue;
  entityAliases[id] = unique([id, bare, anchor && anchor.length <= 20 ? anchor : null]);
}

let world = emptyWorld();

clips.forEach((clip, index) => {
  const end = index + 1 < clips.length ? clips[index + 1].start : source.length;
  const body = source.slice(clip.bodyStart, end);
  const label = `Clip ${String(clip.number).padStart(2, "0")}`;

  const spatialCount = (body.match(/^(?:空间站位|Spatial staging|Spatial blocking)：?/gmi) || []).length;
  const endingCount = (body.match(/^(?:结尾状态|Ending state)：?/gmi) || []).length;
  const constraintCount = (body.match(/^(?:约束|Constraints?)：?/gmi) || []).length;
  if (spatialCount !== 1) errors.push(`${label}: expected exactly one 空间站位 block, found ${spatialCount}`);
  if (endingCount !== 1) errors.push(`${label}: expected exactly one 结尾状态 block, found ${endingCount}`);
  if (constraintCount !== 1) errors.push(`${label}: expected exactly one 约束 block, found ${constraintCount}`);

  const spatialMatch = body.match(/^(?:空间站位|Spatial staging|Spatial blocking)[:：]\s*(.+)$/mi);
  const spatialText = spatialMatch ? spatialMatch[1] : "";
  if (spatialText) {
    world = applySegment(world, spatialText, entityAliases, `${label} 空间站位`, null);
    stateTrace.push({ clip: clip.number, phase: "spatial", text: spatialText, state: clone(world) });
  }

  const shotRegex = /^(?:镜头([^（\n]+)（(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)秒）|Shot\s+([^(:\n]+)\s*\((\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)s?\))[:：]\s*(.+)$/gmi;
  const shots = [];
  let shot;
  while ((shot = shotRegex.exec(body)) !== null) {
    const number = shot[1] || shot[4];
    const start = Number(shot[2] || shot[5]);
    const finish = Number(shot[3] || shot[6]);
    const line = shot[7];
    const rest = body.slice(shotRegex.lastIndex);
    const nextMatch = rest.search(/\n(?:镜头[^（\n]+（\d|Shot\s+[^(:\n]+\s*\(\d)/i);
    const segmentEnd = nextMatch >= 0 ? shotRegex.lastIndex + nextMatch : body.length;
    const continuation = body.slice(shotRegex.lastIndex, segmentEnd);
    const segmentText = `${line}\n${continuation}`;
    shots.push({ number, start, end: finish, line, segmentText });
  }
  if (shots.length === 0) {
    errors.push(`${label}: no timestamped shots found`);
    return;
  }

  if (shots[0].start !== 0) errors.push(`${label}: first shot starts at ${shots[0].start}, expected 0`);
  for (let i = 0; i < shots.length; i += 1) {
    const current = shots[i];
    const shotLabel = `${label} 镜头${current.number}`;
    if (current.end <= current.start) errors.push(`${shotLabel}: end must be greater than start`);
    if (i > 0 && Math.abs(current.start - shots[i - 1].end) > 0.0001) {
      errors.push(`${label}: timeline gap/overlap between 镜头${shots[i - 1].number} and 镜头${current.number}`);
    }
    if (!/(远景|全景|中全景|中景|中近景|近景|特写|大特写|POV|主观视角|wide(?: shot)?|long shot|medium wide|medium shot|medium close[- ]?up|close[- ]?up|extreme close[- ]?up|insert|detail shot|over[- ]?the[- ]?shoulder|OTS)/i.test(current.line)) {
      errors.push(`${shotLabel}: missing shot size or explicit POV`);
    }
    if (!/(固定|手持|推|拉|摇|移|跟|升|降|环绕|俯拍|仰拍|平视|侧拍|过肩|主观视角|POV|static|locked[- ]?off|handheld|dolly|push(?:es)? in|pull(?:s)? back|pan|tilt|track(?:ing)?|crane|pedestal|orbit|arc|overhead|high angle|low angle|eye[- ]?level|side angle|over[- ]?the[- ]?shoulder|OTS)/i.test(current.line)) {
      errors.push(`${shotLabel}: missing angle, viewpoint, or camera movement`);
    }

    const lineDuration = current.end - current.start;
    for (const dialogue of extractDialogue(current.segmentText)) {
      const metric = dialogueMetric(dialogue.text);
      if (metric.count > lineDuration * metric.rate) {
        warnings.push(`${shotLabel}: dialogue may be too long (${metric.count} ${metric.label} in ${lineDuration.toFixed(1)}s)`);
      }
    }

    const explicit = extractExplicitAnnotation(current.segmentText);
    const actionLine = maskDialogueContent(current.line);
    world = applySegment(world, actionLine, entityAliases, shotLabel, explicit);
    stateTrace.push({ clip: clip.number, shot: current.number, start: current.start, end: current.end, explicit: Boolean(explicit), text: current.line, state: clone(world) });
  }

  const finalEnd = shots[shots.length - 1].end;
  if (Math.abs(finalEnd - clip.duration) > 0.0001) {
    errors.push(`${label}: final shot ends at ${finalEnd}s, declared duration is ${clip.duration}s`);
  }

  const descriptor = clip.descriptor;
  let minimum = 0;
  if (/对峙|对白/.test(descriptor)) minimum = clip.duration <= 15 ? 5 : 8;
  else if (/动作|打斗|追逐/.test(descriptor)) minimum = clip.duration <= 15 ? 5 : 7;
  else if (/混合/.test(descriptor)) minimum = clip.duration <= 15 ? 7 : 10;
  if (minimum && shots.length < minimum) warnings.push(`${label}: ${shots.length} shots; ${descriptor} usually needs at least ${minimum}`);

  if (clip.ratio === "9:16" && !/(前景|后景|纵深|较高|较低|上半部|下半部|安全区域)/.test(body)) {
    warnings.push(`${label}: 9:16 composition lacks explicit depth, height, or safe-area staging`);
  }

  const spatialRe = /(左右|前后|上下|一侧|对面|居中|中央|中间|角落|门口|窗口|床边|桌前|楼梯|台阶|前景|后景|纵深|较高|较低|上部|下部|朝向|面向|位于|站在|坐在|立于|蹲|俯视|仰视|贴着|靠着|正前|下缘|上缘|低位|高处|远处|近处|frame left|frame right|screen left|screen right|foreground|midground|background|facing|left side|right side|center of the frame|near the camera|far from the camera)/i;
  if (!spatialText) {
    errors.push(`${label}: missing 空间站位 block`);
  } else if (!spatialRe.test(spatialText)) {
    errors.push(`${label}: 空间站位 lacks an explicit screen-side/spatial relation (左右/前后/一侧/纵深/窗前/高处/正前) — position cannot be verified`);
  }

  const bodyForActionHeuristics = maskDialogueContent(body);
  if (/(走|跑|转身|行|移|追逐|追击|扑|跃|起|坐起|站起|坠落|挥|踢|掌|拳|抓住|倒退|退出|翻|walk|run|move|turn|chase|jump|fall|kick|punch|grab|retreat|exit)/i.test(bodyForActionHeuristics) &&
      !/(位移|方向|轨迹|出画|入画|接续|从.+到|走向|移动到|顺着|滑向|退回|翻身|跨过|向.+走|left\s+to\s+right|right\s+to\s+left|toward|away\s+from|enters?|exits?|path|trajectory|direction)/i.test(bodyForActionHeuristics)) {
    warnings.push(`${label}: movement present but no direction/path continuity vocabulary (方向/位移/接续/出入画) — trajectory may break across cuts`);
  }

  const usedAssets = new Set([...body.matchAll(/@[\p{L}\p{N}_-]+/gu)].map((m) => m[0]));
  for (const asset of usedAssets) {
    if (!definedAssets.has(asset)) warnings.push(`${label}: asset ${asset} is used but not defined in the asset card`);
  }

  const model = (modelName || "").toLowerCase();
  const isWan3 = /wan\s*3(?:\.0)?/.test(model);
  const isH3 = /minimax.*h3|\bh3\b/.test(model);

  if ((isWan3 || isH3) && (/(画外音|旁白|VO|OS)/.test(descriptor) || /(画外音|旁白|VO|OS)/.test(body))) {
    if (!/(嘴巴|口型|闭合|闭口|不说话|mouth\s+(?:remains?\s+)?closed|no\s+lip[- ]?sync|no\s+mouth\s+movement|does\s+not\s+speak)/i.test(body)) {
      warnings.push(`${label}: off-screen narration has no explicit closed-mouth/no-lip constraint — ${modelName} may produce lip movement`);
    }
  }

  if (isWan3 && /(动作|打斗|追逐|武打)/.test(descriptor) && !/(承力|接触|受力|蹬地|位移|踉跄|站稳|恢复)/.test(bodyForActionHeuristics)) {
    warnings.push(`${label}: Wan 3.0 action clip lacks explicit contact/load/displacement/recovery vocabulary; field observations suggest this can reduce readability`);
  }

  const dialogueLines = extractDialogue(body).map((item) => item.text);
  const dialogueMetrics = dialogueLines.map(dialogueMetric);
  const totalHanChars = dialogueMetrics.filter((m) => m.kind === "han_chars").reduce((n, m) => n + m.count, 0);
  const totalEnglishWords = dialogueMetrics.filter((m) => m.kind === "words").reduce((n, m) => n + m.count, 0);
  if (totalHanChars > clip.duration * 5.2) {
    warnings.push(`${label}: total dialogue ${totalHanChars} Chinese characters exceeds comfortable capacity for ${clip.duration}s`);
  }
  if (totalEnglishWords > clip.duration * 3.0) {
    warnings.push(`${label}: total dialogue ${totalEnglishWords} English words exceeds comfortable capacity for ${clip.duration}s`);
  }

  if (scriptCanonical) {
    for (const d of dialogueLines) {
      const normalized = canonicalDialogueText(d).toLowerCase();
      if (normalized && !scriptCanonical.includes(normalized)) {
        errors.push(`${label}: dialogue not found verbatim in script: "${d.slice(0, 36)}${d.length > 36 ? "…" : ""}"`);
      }
    }
  } else if (scriptNorm) {
    // Compatibility fallback for callers created before v3.0.1.
    for (const d of dialogueLines) {
      const normalized = strip(d);
      if (normalized && !scriptNorm.includes(normalized)) {
        errors.push(`${label}: dialogue not found in script: "${d.slice(0, 36)}${d.length > 36 ? "…" : ""}"`);
      }
    }
  }

  const endingMatch = body.match(/^(?:结尾状态|Ending state)[:：]\s*(.+)$/mi);
  const endingText = endingMatch ? endingMatch[1] : "";
  if (endingText) {
    world = applySegment(world, endingText, entityAliases, `${label} 结尾状态`, null);
    stateTrace.push({ clip: clip.number, phase: "ending", text: endingText, state: clone(world) });
  }
});

if (stateReportPath) {
  const target = path.resolve(stateReportPath);
  const report = {
    validator_version: "3.0.1",
    source: resolved,
    model: modelName,
    strict_continuity: strictContinuity,
    assets: [...definedAssets],
    findings: continuityFindings,
    trace: stateTrace,
    final_state: world,
  };
  fs.writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`State report: ${target}`);
}

console.log(`Validated ${clips.length} Clip(s) in ${resolved}`);
console.log(`Continuity engine: ${continuityFindings.length} finding(s), ${stateTrace.length} state snapshot(s)`);
if (warnings.length) {
  console.log("Warnings:");
  warnings.forEach((item) => console.log(`- ${item}`));
}
if (errors.length) {
  console.error("Errors:");
  errors.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}
console.log("PASS: structural + continuity-state checks completed.");
