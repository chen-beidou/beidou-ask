# Kling adapter (Kling 3.x)

Use for prompts targeting Kling 3.0 Turbo / Omni. Structure and syntax differ from Seedance: Kling is **camera-first** and speaks a compact, comma-separated film-crew shorthand.

## Prompt structure

```
Scene → Characters → Action → Camera → Audio
```

Write it as comma-separated shorthand, camera motion stated **before** the subject action (opposite of Seedance).

## Length

- Single take: **40–80 words** (image-to-video: 20–40).
- Under 80 words with explicit camera direction beats a long, descriptive prompt.
- Keep 1–3 actions maximum; more than ~4–5 distinct nouns breaks it.

## Camera syntax

Pair a movement with a target — "dollies in on her eyes", not just "dolly in" — and specify the **endpoint** (open-ended motion has a high hang rate).

- Directional language: `slow push in`, `pull back`, `pan left`, `tilt up`.
- Numeric camera control (when the platform exposes it): `camera_control: forward_up`, `advanced_camera_control.movement_type: pan|tilt|zoom`, `movement_value: -5`.
- Intensity adverbs: `gently`, `quickly`, `barely perceptibly`.

## Rules

- **One primary camera move per shot.** Stacking moves = the model chooses chaos.
- **State camera before action**: `Slow push in on [subject + action], [environment], [lighting], [mood].`
- Chinese/English performs evenly (unlike Seedance/Wan's Chinese edge).
- Best for **held single takes** and multi-shot scenes; feeds multi-shot sequences natively.

## Avoid

- >4–5 distinct nouns per prompt.
- "slow motion" in the negative prompt (does nothing on Kling).
- Stacking multiple camera moves.
- Open-ended motion with no endpoint — always state where the shot lands.

## Multi-shot sequences

Combine into one scene-level prompt with explicit subject + action + lens + light kept identical across cuts so the sequence holds; keep the character identity block and environment anchor verbatim.
