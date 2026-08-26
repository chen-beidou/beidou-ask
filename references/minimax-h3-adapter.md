# MiniMax H3 adapter

Use this profile only when the user selects MiniMax H3. Do not confuse it with MiniMax M3, which is a text, coding, and agentic model with video understanding rather than the corresponding video generator.

## Verified capability envelope

- Support multimodal context containing text, images, video, and audio, with video plus native stereo-audio output.
- Support 4–15 second output, up to 2K, and multiple aspect ratios including 16:9 and 9:16 in the official H3 release description.
- Treat exact public API fields, reference quotas, hosted resolution tiers, and regional availability as interface-dependent until verified.

## Prompt rendering

1. Keep each Clip within the selected interface's supported duration; default to 15 seconds when no duration is supplied.
2. Design sound with the picture: bind dialogue, breath, impact, ambience, and silence to visible causes and timestamps.
3. Use multimodal references by role—identity, motion, environment, or audio—and do not ask one reference to control unrelated attributes.
4. Keep dialogue verbatim. Allocate time for speech and reaction; split the Clip rather than compressing the words.
5. Prefer compact causal actions and explicit ending state over long camera-specification stacks.
6. Use timestamps as structured intent, not a promise of frame-accurate execution.

Render the delivery label as `MiniMax H3`.
