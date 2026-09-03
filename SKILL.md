---
name: beidou-ask
description: Design, rewrite, or repair production-ready cinematic shot instructions and video-model prompts for dialogue, action, mixed, and continuous scenes. Use for layered emotional performance, verbatim script dialogue, asset continuity, sound direction, selectable framing, or prompts targeting Seedance 2.x, Wan 3.0, and MiniMax H3. Do not use to generate character or scene artwork, storyboard grids, or to claim a rendered video has been visually verified without inspecting it.
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
- Read user-stored preference (project memory / CLAUDE.md) where present: 画幅, 时长, 风格, 节奏, 语言 carry priority above built-in defaults.
- Director style: optional. On request, apply exactly one lens from `director-styles.md` to unify the look; it never changes narrative facts or dialogue.

Do not ask about routine parameters that can use these defaults. Ask one necessary question only when the central subject, relationship, or required outcome cannot be inferred without materially changing the scene.

## Route the request

Read only the references needed for the current request:

- Always normalize the request with [references/input-contract.md](references/input-contract.md).
- For emotion, acting, dialogue, confrontation, interrogation, confession, negotiation, or reconciliation, read [references/emotion-performance.md](references/emotion-performance.md), [references/dramatic-beats.md](references/dramatic-beats.md), and [references/dialogue-mode.md](references/dialogue-mode.md).
- For fights, chases, weapons, impacts, spells, destruction, or physical comedy, read [references/dramatic-beats.md](references/dramatic-beats.md) and [references/action-mode.md](references/action-mode.md).
- For mixed dialogue/action scenes, read both mode references and classify each Clip separately.
- For choosing a camera movement that carries meaning, read [references/camera-vocabulary.md](references/camera-vocabulary.md).
- For power, dominance, or relationship position in the frame, read [references/spatial-power.md](references/spatial-power.md).
- For composition and 9:16 vertical staging, read [references/composition.md](references/composition.md).
- For an optional director-style look, read [references/director-styles.md](references/director-styles.md) and apply it as a lens (never a rewrite).
- For Kling prompts, read [references/kling-adapter.md](references/kling-adapter.md).
- For 9:16, reframing, social platforms, or any aspect-ratio choice, read [references/aspect-ratio.md](references/aspect-ratio.md).
- For multiple Clips or later-scene continuation, read [references/continuity-ledger.md](references/continuity-ledger.md) and [references/continuity-validator.md](references/continuity-validator.md) when mechanical validation is available.
- For episodic or long-running projects, also read [references/project-continuity.md](references/project-continuity.md).
- For dialogue, overlap, breath, silence, music, or sound-led cuts, read [references/sound-direction.md](references/sound-direction.md).
- For Seedance, read [references/seedance-adapter.md](references/seedance-adapter.md).
- For Wan 3.0, read [references/wan-3.0-adapter.md](references/wan-3.0-adapter.md) and [references/model-defect-compensation.md](references/model-defect-compensation.md).
- For MiniMax H3, read [references/minimax-h3-adapter.md](references/minimax-h3-adapter.md) and [references/model-defect-compensation.md](references/model-defect-compensation.md).
<!-- RULE:MODEL.SCOPE -->
- For any other model, preserve the core scene design and use only user-supplied or verified constraints; never transfer another model's limits or defect workarounds by analogy. If a cross-model heuristic is useful, label it experimental rather than mandatory.
- For model limits, defect claims, or empirical workaround rules, follow [references/evidence-policy.md](references/evidence-policy.md); update [references/test-ledger.md](references/test-ledger.md) when new generation evidence is available.
- For failed generations or revision requests, read [references/failure-repair.md](references/failure-repair.md) and repair the narrowest responsible layer.
- Before final rendering, read [references/output-schema.md](references/output-schema.md).
- Use [references/golden-cases.md](references/golden-cases.md) only when a concrete pattern is needed; do not imitate its story content.

## Core workflow

1. Normalize inputs: model, duration, aspect ratio, medium, scene type, relationship, objective, opposition, outcome, assets, dialogue, sound, and delivery format.
<!-- RULE:ASSET.BINDING -->
2. Create short asset anchors only for supplied or story-required assets. Treat the asset name as the stable internal identity key. Render `@Name` only when the selected platform/interface actually supports or already uses `@` reference binding; otherwise use the adapter's reference mechanism or the stable bare name. Do not duplicate appearance descriptions when a supplied reference owns appearance. Only describe appearance (≤2 traits, marked inferred) when the user explicitly says an asset has no reference. Never generate art-asset prompts.
3. Build the causal scene spine internally: objective → pressure → resistance → leak/impact → counteraction → changed state.
4. For acting scenes, distinguish surface mask, underlying emotion, relationship goal, trigger, physiological leak, control strategy, speech behavior, listener response, and new relationship state.
5. Establish spatial power, eyeline axis, screen direction, key props, and starting state before listing shots.
6. Compile beats into shots. A camera change must reveal new information, not replay the same action or line.
7. Render model-ready Clips with exact timestamps, functional camera language, visible action, sound behavior, ending state, and concentrated constraints. Add numerical lens/aperture guidance only to decisive shots when useful.
8. Check timeline, shot count, assets, dialogue capacity, aspect-ratio rules, continuity, and model limits. For saved or multi-Clip outputs, run `node scripts/validate-storyboard.mjs <file> --model "<target model>"` when local execution is available; omit `--model` for model-agnostic validation. When continuity is complex, add `--state-report <report.json>` and inspect the first state transition that produces a finding; use `--strict-continuity` for final delivery gates. Relational changes (give/pass/receive) are transactions: bind actor + target + prop + hands when known. For package changes, run `node scripts/release-check.mjs`; do not ship if the repository consistency gate or the full regression suite fails.

## Non-negotiable invariants

- Every Clip begins at 0 seconds and ends exactly at its declared duration; timestamps are continuous, non-overlapping, and use at most one decimal place.
- Every Clip has exactly one spatial-position block and one ending-state block.
- Every shot states shot size, at least one angle/view/movement descriptor, and a visible action/result or complete dialogue line. Aperture and focal length are optional direction cues, not mandatory model controls.
<!-- RULE:CAMERA.INTENT -->
- **Dominant camera intention.** Each shot has one dominant camera intention. A simple shot normally uses one clear move or a locked camera. A composite move is allowed only when its phases form one causal camera sentence with an explicit trigger, path, hand-off, and landing; never stack unrelated moves just for variety. See `camera-vocabulary.md`.
<!-- RULE:DETAIL.BY_FUNCTION -->
- Shot-detail requirements follow shot function rather than a universal checklist. Performance/dialogue shots use the three-detail check (环境压力 + 身体微动作 + 声音锚点). Action shots prioritize force/contact/displacement/recovery plus a readable sound or material response. Inserts/details require a clear story function and visible state change. Decisive or held shots should land on a clear destination image; transitional micro-shots only need an unambiguous hand-off to the next shot.
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

Return exactly four functional sections unless the user asks for analysis or requests a narrow repair. Localize the section labels to the output language. Chinese defaults are:

1. `美术资产对照卡`
2. `全局风格锁定`
3. `视频生成提示词`
4. `生成前提醒` — at most three bullets

For English output, use natural equivalents such as `Asset Reference Card / Global Style Lock / Video Generation Prompt / Preflight Notes`; do not mix languages merely to preserve a heading.

For alternative durations or aspect ratios, share the asset card and global style once, then provide clearly labeled variants. Do not duplicate unchanged global text inside every Clip.

Do not expose internal beat scoring, continuity JSON, validator internals, or hidden reasoning. Optional `CONTINUITY` HTML annotations belong only in an internal/saved validation artifact and must not be included in the normal user-facing prompt or sent to the video model.

For a repair request, return only the revised Clip or shots plus up to three short repair notes; do not repeat unchanged global sections.
