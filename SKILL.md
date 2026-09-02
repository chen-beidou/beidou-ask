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
- Output language: user language; Chinese by default. Add an English term in parentheses only on its first use within each Clip.
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
- For multiple Clips or later-scene continuation, read [references/continuity-ledger.md](references/continuity-ledger.md).
- For episodic or long-running projects, also read [references/project-continuity.md](references/project-continuity.md).
- For dialogue, overlap, breath, silence, music, or sound-led cuts, read [references/sound-direction.md](references/sound-direction.md).
- For Seedance, read [references/seedance-adapter.md](references/seedance-adapter.md).
- For Wan 3.0, read [references/wan-3.0-adapter.md](references/wan-3.0-adapter.md) and [references/model-defect-compensation.md](references/model-defect-compensation.md).
- For MiniMax H3, read [references/minimax-h3-adapter.md](references/minimax-h3-adapter.md) and [references/model-defect-compensation.md](references/model-defect-compensation.md).
- For any other model, preserve the core scene design and use only user-supplied or verified constraints; never transfer another model's limits by analogy.
- For failed generations or revision requests, read [references/failure-repair.md](references/failure-repair.md) and repair the narrowest responsible layer.
- Before final rendering, read [references/output-schema.md](references/output-schema.md).
- Use [references/golden-cases.md](references/golden-cases.md) only when a concrete pattern is needed; do not imitate its story content.

## Core workflow

1. Normalize inputs: model, duration, aspect ratio, medium, scene type, relationship, objective, opposition, outcome, assets, dialogue, sound, and delivery format.
2. Create short asset anchors only for supplied or story-required assets. Assume every named asset has a reference image: anchor with the bare `@Name`, no appearance descriptions in prompts. Only describe appearance (≤2 traits, marked inferred) when the user explicitly says an asset has no reference. Never generate art-asset prompts.
3. Build the causal scene spine internally: objective → pressure → resistance → leak/impact → counteraction → changed state.
4. For acting scenes, distinguish surface mask, underlying emotion, relationship goal, trigger, physiological leak, control strategy, speech behavior, listener response, and new relationship state.
5. Establish spatial power, eyeline axis, screen direction, key props, and starting state before listing shots.
6. Compile beats into shots. A camera change must reveal new information, not replay the same action or line.
7. Render model-ready Clips with exact timestamps, functional camera language, visible action, sound behavior, ending state, and concentrated constraints. Add numerical lens/aperture guidance only to decisive shots when useful.
8. Check timeline, shot count, assets, dialogue capacity, aspect-ratio rules, continuity, and model limits. For saved or multi-Clip outputs, run `node scripts/validate-storyboard.mjs <file>` when local execution is available.

## Non-negotiable invariants

- Every Clip begins at 0 seconds and ends exactly at its declared duration; timestamps are continuous, non-overlapping, and use at most one decimal place.
- Every Clip has exactly one spatial-position block and one ending-state block.
- Every shot states shot size, at least one angle/view/movement descriptor, and a visible action/result or complete dialogue line. Aperture and focal length are optional direction cues, not mandatory model controls.
- Every shot has exactly one primary camera move (chosen for the emotion it produces, per `camera-vocabulary.md`); a shot may add at most one micro-adjustment and must never stack multiple moves.
- Every shot carries at least one 环境压力, one 身体微动作, and one 声音锚点 (three-detail check, per `emotion-performance.md`), and ends on a clear destination image.
- Preserve every supplied dialogue line verbatim and in order. Never add, delete, paraphrase, merge, or invent dialogue unless the user explicitly authorizes rewriting. Do not split a line across shots; when it does not fit, extend or split the Clip rather than silently shortening it. Allow roughly 4–5 Chinese characters per second, then add time for silence, overlap, breath failure, or physical business.
- Dialogue mode: 15 seconds usually 5–8 shots; 30 seconds usually 8–12 shots.
- Live-action action mode: 15 seconds usually 5–14 shots by density (low 5–7, standard 7–10, high 10–14); 30 seconds scales by causal units rather than mechanically doubling shots.
- Do not cross the axis without a neutral shot or visible continuous camera move establishing the new relation.
- Preserve character identity, side, hand use, prop ownership, wounds, wardrobe, light, gaze, breath intensity, and emotional exposure across cuts and Clips.
- **Correctness gate (first wall, zero tolerance):** before any aesthetic choice, a Clip must pass 人物一致 / 站位不错位 / 运动轨迹连贯 / 不穿帮 / 视线动作轴 across every cut and every Clip. Order these as rigid facts, not as style. If a shot would break identity, position, direction of movement, prop or injury state, or the 180° axis, rewrite the shot — never film it for the look. Aesthetic language (camera, composition, emotion) is the second wall and is only layered on once the first holds.
- 9:16 is recomposed in depth and height; never describe it as a crop of 16:9.
- For off-screen narration (OS/VO) over a visible character, the shot or constraint block must state closed-mouth, no-lip-movement explicitly (`嘴巴自然闭合，无口型，无说话动作`); on MiniMax H3, narration never goes into a dialogue block.
- On Wan 3.0, one complete action unit per shot with an explicit bottom-up load chain; compensate defects in the prompt — never work around them by avoiding the model.
- Do not promise exact model obedience or claim visual success without inspecting the generated result.

## Output contract

Return only these sections unless the user asks for analysis or requests a narrow repair:

1. `美术资产对照卡`
2. `全局风格锁定`
3. `视频生成提示词`
4. `生成前提醒` — at most three bullets

For alternative durations or aspect ratios, share the asset card and global style once, then provide clearly labeled variants. Do not duplicate unchanged global text inside every Clip.

Do not expose internal beat scoring, continuity JSON, validator internals, or hidden reasoning.

For a repair request, return only the revised Clip or shots plus up to three short repair notes; do not repeat unchanged global sections.
