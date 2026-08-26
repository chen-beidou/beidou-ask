# Input contract

Normalize the request into this internal record without displaying it unless the user asks:

```text
target_model
duration_per_clip
aspect_ratio: 16:9 | 9:16
medium
scene_mode: dialogue | action | mixed | one_take
total_story_duration
characters_and_relationships
scene_objective
primary_opposition
required_end_state
assets
dialogue
sound_and_music
content_constraints
delivery_format
```

## Priority

1. Explicit current-turn choices.
2. Supplied assets and established project continuity.
3. Existing script facts.
4. Conservative defaults from `SKILL.md`.

Never override a named model, duration, aspect ratio, line of dialogue, character identity, or required outcome merely to simplify generation.

Treat supplied dialogue as immutable source text. Record authorized dialogue rewriting explicitly; absence of authorization means verbatim preservation.

## Asset anchors

Use `@Name（6—20 Chinese-character anchor）` the first time an asset appears in each independently generated Clip. Keep one to three visually distinctive traits. Later mentions use only the asset name.

If no visual description exists, use the bare `@Name` and mark it as missing in the asset card. For pure scripts, inferred appearance gets no more than two traits and the asset card says `外观为推断`.

Do not create image-generation prompts, fake uploaded assets, or invented formal state-asset names.

## When one question is necessary

Ask only if at least one of these is unknowable and alternatives would create different stories:

- Who the central character is.
- What relationship drives the scene.
- Whether a critical action succeeds.
- Which mutually exclusive ending is required.

Otherwise proceed with defaults and state material assumptions in `生成前提醒`.
