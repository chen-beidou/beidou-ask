# Seedance adapter

<!-- RULE:LANGUAGE.CONTRACT -->
<!-- RULE:MODEL.CLAIM_PROVENANCE -->

Use this profile only when the selected target is Seedance. Follow the user's output language; keep descriptions concise, causal, behavior-first, and temporally explicit. Do not switch languages on an unverified assumption that one language performs better.

## Clip lengths

- Use the user's supported 15- or 30-second setting.
- A 30-second Clip should contain enough state development to justify its length; use a midpoint reversal only when the script actually turns there. Do not stretch a 15-second beat merely to fill time.
- If dialogue/action density exceeds capacity, split into consecutive Clips and restate the incoming asset/state anchors for each independently generated Clip.

## Prompt structure

1. Clip title with duration, aspect ratio, mode, and medium.
2. One spatial-position block.
3. Timestamped shots.
4. One ending-state block.
5. One concentrated constraint block.

## Reference binding

When the platform binds references through uploaded image slots, the prompt body repeats the short anchor and the project's image number, and never a full appearance description when a supplied reference owns appearance. Carry the numbers from the asset card's 参考图号 column into each Clip's 本段参考 line, then name the same numbers where the shot depends on that reference (identity, costume, environment, composition). See `sample-output.md`. Keep the reference numbers stable across regenerated Clips so a single Clip can be re-bound without rewriting the asset card.

## Shot line

Each shot includes:

- exact time range
- shot size plus angle/view/movement
- visible action, dialogue, contact, or reaction
- resulting state useful to the next shot

Use numerical aperture or focal length only on decisive shots where depth isolation, spatial compression, or wide-angle distortion changes the storytelling. Otherwise prefer observable directions such as shallow depth, deep focus, wide view, or compressed background.

Keep global style outside Clips. Repeat an asset anchor only on its first appearance within an independently generated Clip.

## Compression order

When the prompt is too long, remove in this order:

1. repeated camera wording
2. repeated light/style description
3. duplicate negative constraints
4. decorative particles and fabric motion
5. secondary movement that changes no state

Never remove identity, ownership, initiator, contact, displacement, dialogue, trigger placement, ending state, freeze state, main-light position, a named prohibition, or global style. The full order and its never-cut list live in `prompt-anatomy.md`.

## What must survive compilation

The concise causal rewrite may change wording, but it must not delete: durable state (posture detail, binding marks, prop form 形状/成色/位置, injury, light direction), the three sound layers (环境底噪 / 材质动作声 / 身体声), inner beats inside a long block, each line's open/close time and its voice anchor's relative change, the axis and the angle change between consecutive shots, the unit's freeze-frame line, the sound landing at the end, and any named prohibition. If the format has no slot for a fact, keep it as a plain sentence rather than dropping it.

## Failure prevention

Use concentrated scene-specific constraints rather than generic quality phrases. Include concrete facts such as screen side, hand use, prop owner, exact overlap, unbroken action, and incoming emotional state.

Do not guarantee exact adherence. Recommend splitting only when density or state change makes one Clip unreliable.
