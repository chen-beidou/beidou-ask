# Seedance adapter

Use concise, causal Chinese descriptions. Prefer visible behavior and exact temporal order over long style adjective stacks.

## Clip lengths

- Use the user's supported 15- or 30-second setting.
- A 30-second Clip needs a midpoint reversal; do not stretch a 15-second beat.
- If dialogue/action density exceeds capacity, split into consecutive Clips and restate the incoming asset/state anchors for each independently generated Clip.

## Prompt structure

1. Clip title with duration, aspect ratio, mode, and medium.
2. One spatial-position block.
3. Timestamped shots.
4. One ending-state block.
5. One concentrated constraint block.

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

Never remove identity, ownership, initiator, contact, displacement, dialogue, trigger placement, ending state, or global style.

## Failure prevention

Use concentrated scene-specific constraints rather than generic quality phrases. Include concrete facts such as screen side, hand use, prop owner, exact overlap, unbroken action, and incoming emotional state.

Do not guarantee exact adherence. Recommend splitting only when density or state change makes one Clip unreliable.
