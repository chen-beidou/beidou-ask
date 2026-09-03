<!-- RULE:LANGUAGE.CONTRACT -->
<!-- RULE:MODEL.SYNTAX_PRECEDENCE -->

## Planning schema vs. model machine grammar

The four visible delivery sections below are the **director/planning contract**. Before a video prompt is actually delivered to a target model, compile the planning content through that model's adapter. A verified adapter may change field names, field language, timestamp syntax, reference syntax, or dialogue tags while preserving the same story facts, world state, dialogue, and causal sequence. Do not force the generic schema into a model whose official grammar requires another form.
# Output schema

The **four-section function is fixed; the visible section labels follow the output language**. Chinese headings below are the default example, not mandatory labels for English output.

Return these four sections by default.

<!-- RULE:ASSET.BINDING -->
## 1. 美术资产对照卡

```markdown
| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |
|---|---|---|---|
```

List only assets used in the generated scene. Do not include art-generation prompts.

## 2. 全局风格锁定

```text
风格锁定：{媒介来源}，{渲染方式}，{角色质感}，{运动质感}，{材质语言}，{光影色彩}。
特殊风格化：不启用。全片保持普通风格锁定，不额外叠加梦境、回忆、监控、漫画化或游戏UI。
```

Enable a special style only when the story requires one, and state its exact shot range.

## 3. 视频生成提示词

```markdown
### Clip 01｜15秒｜9:16｜对峙模式｜真人写实

```text
空间站位：……

镜头一（0-2.4秒）：中景（medium shot）固定拍摄（static shot），……
镜头二（2.4-5.2秒）：近景（close-up）缓慢推进（push in），……；关键表演需要时附“浅景深、85mm长焦方向”。

结尾状态：……
约束：……；保留……声，无音乐，无字幕。
```
```

For Chinese output, professional audiovisual terms use `中文（English）` on first use within each Clip only. For English output, use the English term directly. Aperture/focal annotations are optional and remain in the chosen output language.

<!-- RULE:DIALOGUE.CONTINUITY -->
### Per-shot writing rules

<!-- RULE:CAMERA.INTENT -->
- **Dominant camera intention.** Keep one dominant camera intention per shot. Simple shots use one clear move or a locked camera. A composite path is allowed only when it is one motivated camera sentence: trigger → phase 1 → hand-off/occlusion/focus relay → phase 2 → landing. Do not stack unrelated moves.
- **Prompt clarity order.** Unless a verified model adapter requires another grammar, lead each shot with the subject and visible action, then camera/view, then light/style. This is an authoring convention for clarity and compression, not a universal claim about token weighting; a model-specific official grammar takes precedence.
<!-- RULE:DETAIL.BY_FUNCTION -->
- **Shot-function detail check.** Performance/dialogue shots use 环境压力 + 身体微动作 + 声音锚点. Action shots prioritize force/contact/displacement/recovery plus readable sound/material response. Inserts/details require a clear story function + visible state change. Do not force performance details into every shot (see `emotion-performance.md` and `action-mode.md`).
- **Shot landing.** Decisive/held/performance shots end on a destination image. Inserts and cut-on-action bridge shots end on a precise hand-off state instead of forcing an extra emotional landing (see `emotion-performance.md`).
- **Dialogue continuity.** A spoken line may cross a motivated visual cut only when the audio remains one continuous sequence with no repeated/restarted words. Across independently generated Clips, keep the line intact unless an explicit audio handoff is planned.


<!-- RULE:CONTINUITY.EVENT_SCOPE -->
### Machine continuity validation

Normal user-facing output remains clean. For an internal saved validation copy only, ambiguous continuity can be disambiguated with a hidden `<!-- CONTINUITY {...} -->` annotation immediately after a shot. The validator also works without annotations by extracting state from ordinary Chinese or English prose. When annotations declare transitions, use entity/prop/scene-scoped event objects; for hand-offs between people use a relational `prop_transfer` transaction with actor, target, prop, and hands when known. Ambiguous global events are not a valid continuity excuse. See `continuity-validator.md`.

When a state matters across a cut, prefer explicit observable wording in the shot itself: exact screen side, movement direction, hand/prop, posture, injury, entry/exit, or facing. Do not rely only on `保持一致` or `继续之前动作`.

<!-- RULE:ASPECT.SAFE_ZONE -->
### 9:16 recomposition

For 9:16, write the 空间站位 to show depth and height — 一高一低、一前一后、遮挡、台阶、玻璃对位 — never as a crop of 16:9. UI safe areas are platform-specific: use a current template when available, otherwise keep critical information away from likely overlay edges without inventing universal percentages.

For two durations or ratios, share asset/style sections once and label variants clearly. Each ratio gets its own spatial block and materially different composition.

## 4. 生成前提醒

At most three bullets. Mention only real assumptions, asset conflicts, density risks, or a necessary split. Otherwise say `未发现明显资产冲突。`

## Timeline and numbering

- Start at 0 seconds.
- Adjacent boundaries match exactly.
- End at declared duration.
- Use half-width hyphen and at most one decimal.
- Number shots in the output language: Chinese may use `镜头一`, `镜头二`; English uses `Shot 1`, `Shot 2`. Keep one numbering system within a Clip.

## Constraint block

Keep five to eight scene-specific constraints. At least three cite concrete characters, props, positions, injuries, light states, or overlap facts. Put sound requirements last.
