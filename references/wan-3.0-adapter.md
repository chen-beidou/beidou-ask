# Wan 3.0 adapter

<!-- RULE:LANGUAGE.CONTRACT -->
<!-- RULE:MODEL.CLAIM_PROVENANCE -->

Use this profile only when the user selects Wan 3.0. Treat hosted-product limits as changeable and prefer the user's current interface when it conflicts with this profile.

## Verified capability envelope

- Support text-to-video, first-frame or first-and-last-frame image-to-video, and reference-based video generation.
- Support generation up to 30 seconds at 30 fps in the official Alibaba Cloud preview API.
- Accept multimodal reference media; exact type, count, size, resolution, region, and availability depend on the current endpoint or product interface.
- Do not claim open-weight availability, exact prompt obedience, native dialogue quality, or a fixed reference quota unless verified for the user's endpoint.

## Prompt rendering

1. Keep one Clip centered on one objective and one changed state.
2. Use chronological, causal prose in the user's language with explicit subject, direction, contact, result, and sound event. Do not switch languages without model-specific evidence or user preference.
3. For 20–30 seconds, add enough causal development to justify the longer duration; use a midpoint reversal only when the scene actually turns there, rather than forcing one.
4. Use exact timestamps as editorial structure, not a guarantee of frame-accurate execution.
5. Put stable identity and reference bindings before shots; do not repeat global style in every shot.
6. For first/last-frame generation, make the first shot physically compatible with the start frame and make the final shot arrive at the supplied end frame without teleportation.
7. For reference-video or document inputs, cite only facts visible or stated in the source; do not invent unsupported details.

## Compression and risk control

Prefer fewer complete action units over dense cut counts. Concentrate constraints on identity, hand/prop ownership, screen direction, contact, and ending state. If the chosen Wan interface exposes different duration or asset limits, follow the interface and note the assumption in `生成前提醒`.

## Field observations (user-paid generations, 2026-08)

- **Prompt appearance can compete with reference appearance `[FIELD-OBSERVED]`.** When a supplied reference owns appearance, avoid redundant appearance traits in the prompt; keep action, expression, posture, and state. Do **not** assume Wan APIs understand literal `@Name`: bind references using the active Wan interface/media fields, and use the stable asset name as the textual identity key. See [input-contract.md](input-contract.md) asset anchors.
- Fight scenes can degrade into unreadable motion when a Clip packs dense multi-exchange choreography. Start from readable causal action units with an action-appropriate support/force chain, explicit contact/result/recovery, and camera motion that does not hide the exchange; split only when density defeats readability. See [model-defect-compensation.md](model-defect-compensation.md).
- Off-screen narration (OS/VO) makes visible characters mouth speech. Compensate: name the character and state `嘴巴自然闭合，无口型，无说话动作` inside the shot or constraint block. See [model-defect-compensation.md](model-defect-compensation.md).
