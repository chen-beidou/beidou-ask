---
name: beidou-ask
description: Design, rewrite, or repair production-ready cinematic shot instructions and video-model prompts for dialogue, action, mixed, and continuous scenes. Use for layered emotional performance, verbatim script dialogue, asset continuity, sound direction, voice identity anchors, per-line dialogue timing, selectable framing, light continuity, cut hand-offs and transitions, axis and camera-angle continuity (180°/30°), material detail, prompt-completeness checks and compression, or prompts targeting Seedance 2.x, Wan 3.0, and MiniMax H3. Do not use to generate character or scene artwork, storyboard grids, or to claim a rendered video has been visually verified without inspecting it.
---

# beidou ask

Turn scripts, scene ideas, and existing visual assets into executable cinematic shot instructions. Design dramatic causality before camera coverage, preserve user choices, and keep outputs compact enough for the target video model.

## Defaults

- Target model: user choice; otherwise Seedance 2.x-compatible language.
- Clip duration: user choice; otherwise 15 seconds.
- Aspect ratio: user choice; otherwise 9:16 for short drama/social delivery and 16:9 for explicitly cinematic or landscape projects.
- Medium: follow supplied assets; otherwise live-action realism.
- Sound: production sound and dialogue, no music or subtitles unless requested.
<!-- RULE:LANGUAGE.CONTRACT -->
<!-- RULE:MODEL.SYNTAX_PRECEDENCE -->
- Output language: follow the user. Chinese is the fallback only when no language is implied. In Chinese output, add the standard English audiovisual term in parentheses on first use within each Clip; in English output, use standard English terms directly and do not force Chinese labels back in.
- Read user-stored preference (project memory / CLAUDE.md) where present: 画幅, 时长, 风格, 节奏, 语言, 目标模型, and a project shot-line template (for example `机位高度·主运镜(起幅→落幅)·速度, 镜头物理响应`) carry priority above built-in defaults.
- Director style: optional. On request, apply exactly one lens from `director-styles.md` to unify the look; it never changes narrative facts or dialogue.

Do not ask about routine parameters that can use these defaults. Ask one necessary question only when the central subject, relationship, or required outcome cannot be inferred without materially changing the scene.

## Route the request

Read only the references needed for the current request:

- Always normalize the request with [references/input-contract.md](references/input-contract.md).
- For emotion, acting, dialogue, confrontation, interrogation, confession, negotiation, or reconciliation, read [references/emotion-performance.md](references/emotion-performance.md), [references/dramatic-beats.md](references/dramatic-beats.md), and [references/dialogue-mode.md](references/dialogue-mode.md).
- For fights, chases, weapons, impacts, spells, destruction, or physical comedy, read [references/dramatic-beats.md](references/dramatic-beats.md) and [references/action-mode.md](references/action-mode.md).
- For mixed dialogue/action scenes, read both mode references and classify each Clip separately.
- For choosing a camera movement that carries meaning, or for the executable shot-line template (机位高度·起幅→落幅·速度·镜头物理响应), read [references/camera-vocabulary.md](references/camera-vocabulary.md).
- For light motivation, direction, ratio, color, or light continuity across cuts, read [references/lighting.md](references/lighting.md).
- For what detail a shot needs, where that detail comes from, and how large it can read, read [references/detail.md](references/detail.md).
- For how much a prompt must contain, the ten-layer completeness check, layer priority, and what to cut first when the prompt is too long, read [references/prompt-anatomy.md](references/prompt-anatomy.md).
- For cut hand-offs, cut mechanisms, and transitions between shots or Clips, read [references/transitions.md](references/transitions.md).
- For the 180° axis, the 30° angle rule, reverse-shot staging, eyeline match, or a cut that reads as a jump, read [references/axis-and-angle.md](references/axis-and-angle.md).
- For power, dominance, or relationship position in the frame, read [references/spatial-power.md](references/spatial-power.md).
- For composition and 9:16 vertical staging, read [references/composition.md](references/composition.md).
- For an optional director-style look, read [references/director-styles.md](references/director-styles.md) and apply it as a lens (never a rewrite).
- For Kling prompts, read [references/kling-adapter.md](references/kling-adapter.md).
- For 9:16, reframing, social platforms, or any aspect-ratio choice, read [references/aspect-ratio.md](references/aspect-ratio.md).
- For multiple Clips or later-scene continuation, read [references/continuity-ledger.md](references/continuity-ledger.md) and [references/continuity-validator.md](references/continuity-validator.md) when mechanical validation is available.
- For episodic or long-running projects, also read [references/project-continuity.md](references/project-continuity.md).
- For dialogue, overlap, breath, silence, voice identity anchors, sound landing at the end of a unit, music, or sound-led cuts, read [references/sound-direction.md](references/sound-direction.md).
- For Seedance, read [references/seedance-adapter.md](references/seedance-adapter.md).
- For Wan 3.0, read [references/wan-3.0-adapter.md](references/wan-3.0-adapter.md) and [references/model-defect-compensation.md](references/model-defect-compensation.md).
- For MiniMax H3, read [references/minimax-h3-adapter.md](references/minimax-h3-adapter.md) and [references/model-defect-compensation.md](references/model-defect-compensation.md).
<!-- RULE:MODEL.SCOPE -->
- For any other model, preserve the core scene design and use only user-supplied or verified constraints; never transfer another model's limits or defect workarounds by analogy. If a cross-model heuristic is useful, label it experimental rather than mandatory.
- For model limits, defect claims, or empirical workaround rules, follow [references/evidence-policy.md](references/evidence-policy.md); update [references/test-ledger.md](references/test-ledger.md) when new generation evidence is available.
- For failed generations or revision requests, read [references/failure-repair.md](references/failure-repair.md) and repair the narrowest responsible layer.
- Before final rendering, read [references/output-schema.md](references/output-schema.md).
- Use [references/golden-cases.md](references/golden-cases.md) only when a concrete pattern is needed; do not imitate its story content.
- Follow [references/sample-output.md](references/sample-output.md) as the format baseline for the complete, uncompressed delivery; it is a shape reference, never a story to reuse.

## Core workflow

1. Normalize inputs: model, duration, aspect ratio, medium, scene type, relationship, objective, opposition, outcome, assets, dialogue, sound, and delivery format.
<!-- RULE:ASSET.BINDING -->
2. Create short asset anchors only for supplied or story-required assets. Treat the asset name as the stable internal identity key. Render `@Name` only when the selected platform/interface actually supports or already uses `@` reference binding; otherwise use the adapter's reference mechanism or the stable bare name. Do not duplicate appearance descriptions when a supplied reference owns appearance. Only describe appearance (≤2 traits, marked inferred) when the user explicitly says an asset has no reference. Never generate art-asset prompts.
3. Build the causal scene spine internally: objective → pressure → resistance → leak/impact → counteraction → changed state.
4. For acting scenes, distinguish surface mask, underlying emotion, relationship goal, trigger, physiological leak, control strategy, speech behavior, listener response, and new relationship state. Fix each speaking character's voice anchor once (音色、说话底速、口音咬字、气息、口头习惯).
5. Establish spatial power, eyeline axis, screen direction, key props, the scene's light state (motivated source, shadow direction, color relation), the axis side the camera lives on, and starting state before listing shots.
6. Compile beats into shots. A camera change must reveal new information, not replay the same action or line. Every shot after the first opens by naming its hand-off from the previous shot, and names the cut mechanism when it matters. Each shot carries at least one sourced, in-size, story-serving detail.
7. Render model-ready Clips with exact timestamps; every shot line carries 机位高度 + 主运镜(起幅→落幅) + 速度 + 镜头物理响应, then visible action, sound behavior, ending state, and concentrated constraints. A time block over about four seconds, or one containing a turn, is written as inner beats; each spoken line carries its own open/close time; the unit's last shot states how the sound lands and lands on the freeze frame the next unit starts from. Add numerical lens/aperture guidance only to decisive shots when useful.
8. Check timeline, shot count, assets, dialogue capacity, aspect-ratio rules, continuity, and model limits. For saved or multi-Clip outputs, run `node scripts/validate-storyboard.mjs <file> --model "<target model>"` when local execution is available; omit `--model` for model-agnostic validation. When continuity is complex, add `--state-report <report.json>` and inspect the first state transition that produces a finding; use `--strict-continuity` for final delivery gates. Relational changes (give/pass/receive) are transactions: bind actor + target + prop + hands when known. For package changes, run `node scripts/release-check.mjs`; do not ship if the repository consistency gate or the full regression suite fails.

## Non-negotiable invariants

- Every Clip begins at 0 seconds and ends exactly at its declared duration; timestamps are continuous, non-overlapping, and use at most one decimal place.
- Every Clip has exactly one spatial-position block and one ending-state block.
- Every shot states shot size, at least one angle/view/movement descriptor, and a visible action/result or complete dialogue line. Aperture and focal length are optional direction cues, not mandatory model controls.
<!-- RULE:SHOT.TEMPLATE -->
- **Executable shot line.** Every shot line carries 机位高度 (低机位仰拍/平视/高机位俯拍 or an explicit height), 主运镜 with 起幅→落幅 when the camera moves, 速度, and 镜头物理响应 — how the camera itself reacts (无抖动/轻微手持颤抖/随脚步起伏/随动作微沉). A locked shot states 固定 and its physical response; it needs no path. Aperture and focal length stay optional. See `camera-vocabulary.md`.
<!-- RULE:CAMERA.INTENT -->
- **Dominant camera intention.** Each shot has one dominant camera intention. A simple shot normally uses one clear move or a locked camera. A composite move is allowed only when its phases form one causal camera sentence with an explicit trigger, path, hand-off, and landing; never stack unrelated moves just for variety. See `camera-vocabulary.md`.
<!-- RULE:LIGHT.CONTINUITY -->
- **Light is state, not ambience.** Name the motivated source, its direction and hardness, and the ratio/temperature relation. Source direction, color temperature, and contrast survive cuts and change only with a visible cause (a lamp switched, a curtain opened, a car passing). Never write mood-only light words. See `lighting.md`.
<!-- RULE:TRANSITION.HANDOFF -->
- **Every cut is a hand-off.** Each shot after the first names what it continues from (承接/动作未停/顺势/同时/话音未落) and, when it matters, its cut mechanism (动作切/遮挡切/焦点接力/声音桥). No shot replays an action or a line the previous shot already finished. See `transitions.md`.
<!-- RULE:DETAIL.BY_FUNCTION -->
- Shot-detail requirements follow shot function rather than a universal checklist. Performance/dialogue shots use the three-detail check (环境压力 + 身体微动作 + 声音锚点). Action shots prioritize force/contact/displacement/recovery plus a readable sound or material response. Inserts/details require a clear story function and visible state change. Decisive or held shots should land on a clear destination image; transitional micro-shots only need an unambiguous hand-off to the next shot. Every shot still carries at least one sourced, in-size, story-serving detail. See `detail.md`.
<!-- RULE:PROMPT.LAYERS -->
- **Ten-layer completeness.** A finished prompt carries all ten layers: hard spec, facts, durable state, action, camera, visible detail, sound (ambience floor + material action + body), time, named prohibitions, and an explicit no-loss delivery pass. The thin layers are durable state, visible detail, sound floor, inner beats, and named prohibitions — check those before delivering. Beats belong inside a long block (`0-1秒：……；1-2.5秒：……`); the unit's last shot states the freeze frame the next unit starts from; constraints name the specific deformation this scene invites rather than generic quality words. Do not compress the default delivery or delete a rule's concrete execution evidence because the prompt is long. Use the compression order in `prompt-anatomy.md` only when the user explicitly requests a concise derivative. See `prompt-anatomy.md`.
<!-- RULE:VOICE.IDENTITY -->
- **Voice identity anchor.** Every speaking character carries one voice anchor in the asset card (音色、说话底速、口音咬字、气息、口头习惯, three to five words). Per-line delivery writes only the relative change against it. The anchor is durable state: it survives cuts and changes only with a shown cause. See `sound-direction.md`.
<!-- RULE:DIALOGUE.TIMING -->
- **Per-line dialogue timing.** Every spoken line carries its own open and close time inside its shot window plus any inner breath gap — `（2.6秒开口，4.4秒收，句中留0.2秒气口）`. A shot-level time block alone leaves pace, breath, and lip movement to the model. See `dialogue-mode.md`.
<!-- RULE:SOUND.LANDING -->
- **Sound landing.** The unit's last shot states how its sound ends (硬切静默 / 渐弱收尾 / 留一口气 / 素材声自然收). An unstated ending is where a closing musical swell gets invented, which is the usual source of unwanted score. See `sound-direction.md`.
<!-- RULE:CUT.GEOMETRY -->
- **Cut geometry.** Cuts obey the 180° axis and the 30° angle rule. Declare the axis (who sits frame-left/right, which side the camera is on) in the spatial block; make each consecutive shot of the same subject change angle by roughly 30° or change size enough to read as deliberate; crossing the axis needs a neutral shot or a visible continuous camera move. See `axis-and-angle.md`.
<!-- RULE:DIALOGUE.CONTINUITY -->
- Preserve every supplied dialogue line verbatim and in order. Never add, delete, paraphrase, merge, or invent dialogue unless the user explicitly authorizes rewriting. A line may continue across a cut **inside the same continuous audio/generation segment** when the words do not restart or duplicate and the cut has a clear visual reason; across independently generated Clips, keep the line intact unless an explicit audio handoff/edit plan is part of the workflow. Use measured actor/audio duration when available; otherwise treat roughly 4–5 Chinese characters/sec or 2–3 English words/sec as planning estimates, then add time for silence, overlap, breath failure, or physical business.
- Dialogue mode: 15 seconds usually 5–8 shots; 30 seconds usually 8–12 shots.
- Live-action action mode: 15 seconds usually 5–14 shots by density (low 5–7, standard 7–10, high 10–14); 30 seconds scales by causal units rather than mechanically doubling shots.
- Do not cross the axis without a neutral shot or visible continuous camera move establishing the new relation.
- Preserve character identity, side, hand use, prop ownership, wounds, wardrobe, light, gaze, breath intensity, and emotional exposure across cuts and Clips.
<!-- RULE:CONTINUITY.WORLD_FIRST -->
- **Correctness gate (first wall, zero tolerance):** before any aesthetic choice, a Clip must pass 人物一致 / 世界站位连续 / 运动轨迹连贯 / 不穿帮 / 视线动作轴 across every cut and every Clip. **World state is authoritative; screen position is a camera-dependent projection.** A camera change may legitimately move a stationary subject from frame right to frame left, but a subject may not teleport in world space. If identity, world position, movement, prop or injury state, or the 180° axis breaks without a shown cause, rewrite the shot. Aesthetic language is the second wall and is layered on only after the first holds.
- 9:16 is recomposed in depth and height; never describe it as a crop of 16:9.
- For off-screen narration (OS/VO), apply closed-mouth/no-lip compensation **only when the selected model/interface has that verified defect** (currently Wan 3.0 and MiniMax H3 in `model-defect-compensation.md`). On MiniMax H3, narration never goes into a `<d>` dialogue block. On other models, do not promote this workaround to a hard rule without evidence.
- On Wan 3.0, treat dense action as a model-scoped readability risk `[FIELD-OBSERVED]`: start from causal action units with an action-appropriate support/force chain, contact/result/recovery, and readable camera coverage; split only when density makes the exchange unclear. Do not force a grounded-human load template onto actions whose physics differ.
- Do not promise exact model obedience or claim visual success without inspecting the generated result.

## Output contract

Return each independently generated segment as one complete, self-contained, uncompressed prompt. The visible structure follows the official Seedance-style information order while remaining model-adapter aware:

1. segment header and source range
2. `素材说明` / `Material references`
3. `一句话概述` / `One-sentence overview`
4. `具体情节` / `Timed scene`
5. `全局补充` / `Global facts and prohibitions`

Inside `具体情节`, render one `初始状态` block, timestamped shots, and one `段尾定格帧＝下一段起幅` line. Each shot exposes the concrete results of every applicable rule instead of delegating judgment to the video model. Use these functional fields when applicable:

- `状态变化` — the information, emotion, tactical, spatial, physical, or decision state earned by the shot
- `承接与状态` — incoming world state, unfinished action/audio, and one cut mechanism
- `画面动作` — causal visible action or performance, including contact/force/recovery when physical action drives the shot
- `摄影机` — size, height/view, axis side, relative angle/size change, one dominant move, start→path→landing, speed, and physical response
- `可见细节与光影` — sourced in-size detail, focus/depth relation, motivated light behavior, and any caused change
- `台词与声音` — verbatim line, open/close/breath timing, voice-anchor delta, OS/VO mouth behavior when model-scoped, and the three sound layers
- `镜头落点` — outgoing position, posture, gaze, hands, props, injury, motion, emotional exposure, and audio tail needed by the next shot
- `本镜禁止` — shot-specific named failure risks; omit only when no real shot-specific risk exists

Do not output abstract rules such as `遵守30度规则`, `注意连续性`, or `增强打击感` in place of execution. Calculate and write the result: concrete camera positions and angle delta, inherited state, force/contact/displacement/recovery, exact focus relation, or timed dialogue behavior. Keep the full evidence even when it repeats a durable fact needed at the cut.

`全局补充` contains hard specs, durable facts that truly span the unit, allowed sound scope, and global named prohibitions. It does not replace per-shot execution. Do not compress the default output. Only create a concise derivative when the user explicitly asks, and label it as a derivative that does not replace the full rule-auditable version.

For adapters with a separate machine grammar (for example MiniMax H3), keep the full readable plan and add one clearly marked compiled machine-facing block; never blend the grammars. State which block is copied and how references bind.

For alternative durations or aspect ratios, provide separately labeled, self-contained variants. Preserve the same story facts and outgoing state, but write ratio-specific initial staging and shots.

Do not expose internal beat scoring, continuity JSON, validator internals, hidden calculations, or chain-of-thought. Optional `CONTINUITY` HTML annotations belong only in an internal/saved validation artifact and must not be included in the normal user-facing prompt or sent to the video model.

For a repair request, return only the revised segment or shots plus the minimum affected incoming/outgoing state. Do not repeat unaffected segments.
