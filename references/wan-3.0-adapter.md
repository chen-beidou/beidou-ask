# Wan 3.0 adapter

Use this profile only when the user selects Wan 3.0. Treat hosted-product limits as changeable and prefer the user's current interface when it conflicts with this profile.

## Verified capability envelope

- Support text-to-video, first-frame or first-and-last-frame image-to-video, and reference-based video generation.
- Support generation up to 30 seconds at 30 fps in the official Alibaba Cloud preview API.
- Accept multimodal reference media; exact type, count, size, resolution, region, and availability depend on the current endpoint or product interface.
- Do not claim open-weight availability, exact prompt obedience, native dialogue quality, or a fixed reference quota unless verified for the user's endpoint.

## Prompt rendering

1. Keep one Clip centered on one objective and one changed state.
2. Use chronological, causal Chinese prose with explicit subject, direction, contact, result, and sound event.
3. For 20–30 seconds, design a midpoint reversal instead of stretching a shorter beat.
4. Use exact timestamps as editorial structure, not a guarantee of frame-accurate execution.
5. Put stable identity and reference bindings before shots; do not repeat global style in every shot.
6. For first/last-frame generation, make the first shot physically compatible with the start frame and make the final shot arrive at the supplied end frame without teleportation.
7. For reference-video or document inputs, cite only facts visible or stated in the source; do not invent unsupported details.

## Compression and risk control

Prefer fewer complete action units over dense cut counts. Concentrate constraints on identity, hand/prop ownership, screen direction, contact, and ending state. If the chosen Wan interface exposes different duration or asset limits, follow the interface and note the assumption in `生成前提醒`.
