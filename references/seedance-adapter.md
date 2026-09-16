# Seedance adapter

<!-- RULE:LANGUAGE.CONTRACT -->
<!-- RULE:MODEL.CLAIM_PROVENANCE -->

Use this profile only when the selected target is Seedance. Follow the user's output language; keep descriptions causal, behavior-first, temporally explicit, and complete. Do not switch languages on an unverified assumption that one language performs better. The default delivery is uncompressed; brevity never overrides rule execution evidence.

## Clip lengths

- Use the user's supported 15- or 30-second setting.
- A 30-second Clip should contain enough state development to justify its length; use a midpoint reversal only when the script actually turns there. Do not stretch a 15-second beat merely to fill time.
- If dialogue/action density exceeds capacity, split into consecutive Clips and restate the incoming asset/state anchors for each independently generated Clip.

## Prompt structure

1. Segment title with duration, aspect ratio, target model, script range, cast, and scene.
2. `素材说明`: reference identity, assigned use, stable anchors, and non-mixing statement.
3. `一句话概述`: subject, place, event, style/camera strategy, and outgoing dramatic state.
4. `具体情节`: one `初始状态`, timestamped shots, and one `段尾定格帧＝下一段起幅`.
5. `全局补充`: hard specs, durable facts, allowed sound scope, and global named prohibitions.

Each timestamped shot writes the concrete results of applicable rules under functional fields: state change; incoming hand-off/state; visible action/performance; camera geometry and movement; visible detail/focus/light; dialogue/sound; outgoing landing; and shot-specific prohibition when a real risk exists. Do not replace those results with abstract instructions to obey a rule.

## Reference binding

When the platform binds references through uploaded image slots, `素材说明` binds each short anchor to the project's image number and assigned use, and never adds a conflicting full appearance description when a supplied reference owns appearance. Name the same number where a shot materially depends on that reference (identity, costume, environment, composition). See `sample-output.md`. Keep reference numbers stable across regenerated segments so one segment can be re-bound without rewriting unrelated segments.

## Shot line

Each shot includes, without loss:

- exact time range and meaningful state change
- incoming hand-off and inherited world state
- visible causal action, performance, dialogue, contact, or reaction
- shot size, height/view, axis side, relative angle/size change, dominant movement, start/path/landing, speed, and camera physical response
- sourced visible detail, focus/depth relation, and motivated light behavior
- dialogue timing and the three sound layers
- resulting state useful to the next shot and a shot-specific named prohibition when applicable

Use numerical aperture or focal length only on decisive shots where depth isolation, spatial compression, or wide-angle distortion changes the storytelling. Otherwise prefer observable directions such as shallow depth, deep focus, wide view, or compressed background.

Keep film-wide style facts in `一句话概述` and durable light/style facts in `全局补充`; write only visible shot-specific changes inside shots. Repeat an asset anchor where needed to make an independently generated segment self-contained.

## Compression order — explicit concise derivative only

Do not compress the default output. When the user explicitly asks for a concise derivative, remove in this order:

1. repeated camera wording
2. repeated light/style description
3. duplicate negative constraints
4. decorative particles and fabric motion
5. secondary movement that changes no state

Never remove identity, ownership, initiator, contact, displacement, dialogue, trigger placement, ending state, freeze state, main-light position, a named prohibition, or global style. The full order and its never-cut list live in `prompt-anatomy.md`.

## What must survive compilation

Compilation may change wording, but it must not delete: durable state (posture detail, binding marks, prop form 形状/成色/位置, injury, light direction), the three sound layers (环境底噪 / 材质动作声 / 身体声), inner beats inside a long block, each line's open/close time and its voice anchor's relative change, the axis and the angle change between consecutive shots, the unit's freeze-frame line, the sound landing at the end, and any named prohibition. If the format has no slot for a fact, keep it as a plain sentence rather than dropping it.

## Failure prevention

Use concentrated scene-specific constraints rather than generic quality phrases. Include concrete facts such as screen side, hand use, prop owner, exact overlap, unbroken action, and incoming emotional state.

Do not guarantee exact adherence. Recommend splitting only when density or state change makes one Clip unreliable.
