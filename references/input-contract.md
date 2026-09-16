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

0. User-stored preference (project memory / CLAUDE.md): default 画幅, 时长, 风格, 节奏, 语言, 目标模型, and the project's own shot-line template (for example `机位高度·主运镜(起幅→落幅)·速度, 镜头物理响应`).
1. Explicit current-turn choices.
2. Supplied assets and established project continuity.
3. Existing script facts.
4. Conservative defaults from `SKILL.md`.

Never override a named model, duration, aspect ratio, line of dialogue, character identity, or required outcome merely to simplify generation.

Treat supplied dialogue as immutable source text. Record authorized dialogue rewriting explicitly; absence of authorization means verbatim preservation.

## Asset anchors

Treat each named asset as a stable **internal identity key**. Do not assume that every target platform interprets `@Name` as a reference binding.

- If the user's interface already uses `@Name`, or the selected adapter explicitly supports that syntax, render the first binding as bare `@Name`.
- If the platform uses uploaded reference slots, media fields, IDs, or another binding mechanism, use that mechanism and keep the visible prompt anchored by the stable asset name without inventing `@` semantics.
- If the project binds references by image number (`{{Image N}}` or 图N), carry that number in the asset card's 参考图号 column and repeat it in each Clip's 本段参考 line, so a regenerated Clip can be re-bound without rewriting the card.
- When a supplied reference owns appearance, do not restate appearance traits unless needed to distinguish a temporary visible state (for example wet hair, torn sleeve, fresh blood).
- Only when the user explicitly says an asset has no reference image may the asset card carry at most two inferred appearance traits, marked `外观为推断`.

Do not create image-generation prompts, fake uploaded assets, invented formal state-asset names, or unsupported platform binding syntax.

## When one question is necessary

Ask only if at least one of these is unknowable and alternatives would create different stories:

- Who the central character is.
- What relationship drives the scene.
- Whether a critical action succeeds.
- Which mutually exclusive ending is required.

Otherwise proceed with defaults and state material assumptions in the segment header or `全局补充`.
