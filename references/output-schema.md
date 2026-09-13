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
| 资产引用 | 文字短锚点 | 本段用途 | 参考图号 | 请用户核对 |
|---|---|---|---|---|
| @角色名 | 关键外观词 | 本段用途 | {{Image 1}} | 图与锚点是否一致 |
```

List only assets used in the generated scene. Do not include art-generation prompts. When the project binds references by image number, carry that number in 参考图号 and repeat it in each Clip's 本段参考 line; when the interface binds by uploaded slot or media field, name that slot instead. Write a half-width space after an `@Name` that is followed directly by Chinese text (`@阿成 抬眼看向@小满`), so each name token stays machine-separable for continuity validation. For characters who speak, append the voice anchor to 文字短锚点 (音色、说话底速、口音咬字、气息、口头习惯, three to five words); every later delivery note is written relative to that anchor.

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
本段参考：{{Image 1}}、{{Image 2}}

空间站位：……；主光在画面右上方，影子朝画面左侧，冷白顶灯与窗外暖色霓虹冷暖对撞。

镜头一（0-2.4秒）：全景（wide shot），低机位仰拍（low angle），固定（static，无抖动）：……
镜头二（2.4-5.2秒）：承接抬眼的动作未停（动作切），中景（medium shot），平视（eye-level），缓慢推进（push in，起幅中景→落幅近景，慢速，镜头随她抬头微抬）：……；关键表演需要时附“浅景深、85mm长焦方向”。

结尾状态：……；主光方向与影子方向不变。
约束：……；保留……声，无音乐，无字幕。
```
```

For Chinese output, professional audiovisual terms use `中文（English）` on first use within each Clip only. For English output, use the English term directly. Aperture/focal annotations are optional and remain in the chosen output language.

<!-- RULE:DIALOGUE.CONTINUITY -->
### Per-shot writing rules

<!-- RULE:CAMERA.INTENT -->
- **Dominant camera intention.** Keep one dominant camera intention per shot. Simple shots use one clear move or a locked camera. A composite path is allowed only when it is one motivated camera sentence: trigger → phase 1 → hand-off/occlusion/focus relay → phase 2 → landing. Do not stack unrelated moves.
- **Prompt clarity order.** Unless a verified model adapter requires another grammar, lead each shot with the subject and visible action, then camera/view, then light/style. This is an authoring convention for clarity and compression, not a universal claim about token weighting; a model-specific official grammar takes precedence.
<!-- RULE:SHOT.TEMPLATE -->
- **Executable shot line.** Every shot line writes 机位高度, 主运镜 with 起幅→落幅 when it moves, 速度, and 镜头物理响应 before the content: `镜头二（2.4-5.2秒）：承接……（动作切），中景（medium shot），平视（eye-level），缓慢推进（push in，起幅中景→落幅近景，慢速，镜头随她抬头微抬）：……`. A locked shot writes 固定 plus its physical response (无抖动 / 轻微手持颤抖) and no path. Aperture and focal length stay optional (see `camera-vocabulary.md`).
<!-- RULE:LIGHT.CONTINUITY -->
- **Light facts.** The 全局风格锁定 carries the film-wide light signature once; 空间站位 carries the scene's current light state (which side the key light sits on, which way shadows fall); a shot line carries only light facts that shot can see (a shadow edge moving, a face crossing into light, a lamp switching, a car light sweeping by); a decisive shot may land one light event. Source direction, color temperature, and contrast survive cuts and change only with a visible cause (see `lighting.md`).
<!-- RULE:TRANSITION.HANDOFF -->
- **Cut hand-off.** Every shot after the first opens with its hand-off clause (承接……/动作未停/顺势/同时/话音未落) and names its cut mechanism when it matters (动作切/遮挡切/焦点接力/声音桥). The incoming shot never replays an action or line the outgoing shot finished. Across Clips, restate the minimum incoming state (see `transitions.md`).
<!-- RULE:CUT.GEOMETRY -->
- **Cut geometry.** State the axis in the spatial block (轴线在哪两个人之间、相机在哪一侧、谁在画面左/右、谁朝向哪边). Two consecutive shots of the same subject change the camera angle by roughly 30° or more, or change framing size enough to read as deliberate; write the angle change into the shot line when size alone does not carry it (`机位由右前方移到左前方，角度变化约40°`). Crossing the axis needs a neutral shot or a visible continuous camera move. See `axis-and-angle.md`.
<!-- RULE:DETAIL.BY_FUNCTION -->
- **Shot-function detail check.** Performance/dialogue shots use 环境压力 + 身体微动作 + 声音锚点. Action shots prioritize force/contact/displacement/recovery plus readable sound/material response. Inserts/details require a clear story function + visible state change. Do not force performance details into every shot (see `emotion-performance.md` and `action-mode.md`). Every shot still carries at least one sourced, in-size, story-serving detail — a material or state fact, not an adjective pile (see `detail.md`).
- **Shot landing.** Decisive/held/performance shots end on a destination image. Inserts and cut-on-action bridge shots end on a precise hand-off state instead of forcing an extra emotional landing (see `emotion-performance.md`).
- **Dialogue continuity.** A spoken line may cross a motivated visual cut only when the audio remains one continuous sequence with no repeated/restarted words. Across independently generated Clips, keep the line intact unless an explicit audio handoff is planned.
<!-- RULE:VOICE.IDENTITY -->
- **Voice anchor.** Every speaking character carries one voice anchor in the asset card (three to five words: 音色、说话底速、口音咬字、气息、口头习惯). The per-line note writes only the relative change against it (`压低音量，比平时更慢`) and never re-describes the voice. The anchor is durable state and changes only with a shown cause. See `sound-direction.md`.
<!-- RULE:DIALOGUE.TIMING -->
- **Per-line timing.** Each spoken line carries its own open and close time inside the shot window plus any inner breath gap (`（2.6秒开口，4.4秒收，句中留0.2秒气口）`). A shot-level time block alone leaves pace, breath placement, and lip movement to the model. See `dialogue-mode.md`.
<!-- RULE:SOUND.LANDING -->
- **Sound landing.** The unit's last shot states how the sound ends — 硬切静默 / 渐弱收尾 / 留一口气 / 素材声自然收 — so no closing musical swell is invented. See `sound-direction.md`.


<!-- RULE:CONTINUITY.EVENT_SCOPE -->
### Machine continuity validation

Normal user-facing output remains clean. For an internal saved validation copy only, ambiguous continuity can be disambiguated with a hidden `<!-- CONTINUITY {...} -->` annotation immediately after a shot. The validator also works without annotations by extracting state from ordinary Chinese or English prose. When annotations declare transitions, use entity/prop/scene-scoped event objects; for hand-offs between people use a relational `prop_transfer` transaction with actor, target, prop, and hands when known. Ambiguous global events are not a valid continuity excuse. See `continuity-validator.md`.

When a state matters across a cut, prefer explicit observable wording in the shot itself: exact screen side, movement direction, hand/prop, posture, injury, entry/exit, or facing. Do not rely only on `保持一致` or `继续之前动作`.

<!-- RULE:ASPECT.SAFE_ZONE -->
### 9:16 recomposition

For 9:16, write the 空间站位 to show depth and height — 一高一低、一前一后、遮挡、台阶、玻璃对位 — never as a crop of 16:9. UI safe areas are platform-specific: use a current template when available, otherwise keep critical information away from likely overlay edges without inventing universal percentages.

For two durations or ratios, share asset/style sections once and label variants clearly. Each ratio gets its own spatial block and materially different composition.

## 4. 生成前提醒

At most three bullets, plus any mandatory model-defect safety reminders, which do not count toward the limit. Mention only real assumptions, asset conflicts, density risks, or a necessary split. Otherwise say `未发现明显资产冲突。`

The first line of the delivery states the 怎么用 usage note and the delivery form: which sections are shared, which block is copied per Clip, and how the reference numbers bind. For an adapter with a machine-facing layer, name the marked block the user copies. `sample-output.md` shows the target shape.

<!-- RULE:PROMPT.LAYERS -->
### Time, beats, and the freeze frame

- **Beats inside a block.** A time block longer than about four seconds, or one that contains an emotional turn, is written as inner beats: `0-1秒：眼睑绷紧、睫毛连颤；1-2.5秒：缓缓睁开、瞳孔收缩`. Beats give the model a micro-sequence instead of one loose sentence.
- **Freeze-frame hand-off.** The unit's last shot ends on the freeze frame the next unit starts from, stated once: `定格帧=下一段起幅：……` (see `continuity-ledger.md`).
- **Ten layers.** Before calling a prompt finished, check it against the ten-layer anatomy in `prompt-anatomy.md` — especially durable state, visible detail, sound floor, inner beats, and named prohibitions, which are the layers most often missing.

## Timeline and numbering

- Start at 0 seconds.
- Adjacent boundaries match exactly.
- End at declared duration.
- Use half-width hyphen and at most one decimal.
- Number shots in the output language: Chinese may use `镜头一`, `镜头二`; English uses `Shot 1`, `Shot 2`. Keep one numbering system within a Clip.

## Constraint block

Keep five to eight scene-specific constraints. At least three cite concrete characters, props, positions, injuries, light states, or overlap facts. Put sound requirements last.
