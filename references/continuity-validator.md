# Continuity state validator

The validator has two layers:

1. structural/timing/model-specific gates;
2. a cross-shot continuity state machine.

Validator version **3.0.1** adds bilingual Chinese/English parsing, relation-aware prop transactions, and geometry-backed world-to-screen verification while preserving v2.1 entity/prop/scene scoping.

<!-- RULE:CONTINUITY.WORLD_FIRST -->
**World state is authoritative.** `screen=left/right` is a camera-dependent projection, not a world coordinate. A stationary character can legitimately move from frame right to frame left after a camera relocation; the validator therefore resolves world-space continuity before judging screen-space continuity when geometry is available.

<!-- RULE:LANGUAGE.CONTRACT -->
The default remains ordinary storyboard prose. The canonical Chinese schema and English equivalents are both accepted for core blocks, shot labels, shot sizes, camera vocabulary, and tracked continuity fields. Hidden `CONTINUITY` annotations are for saved validation copies, CI, difficult continuity, or regression tests only. Do not expose them in the normal user-facing prompt and do not send them to the video model.

## Tracked state

Per character/entity:

```text
screen side      left / center / right
depth            foreground / midground / background
height           high / low
facing           left / right / camera / away_camera
movement         L>R / R>L / FRONT>BACK / BACK>FRONT / UP / DOWN / NONE
posture          standing / sitting / crouching / kneeling / lying / prone
entry / exit     left / right / top / bottom / depth
left hand        prop name / empty
right hand       prop name / empty
injuries         durable injury list
wardrobe         durable costume/wardrobe state
gaze             current gaze target
world_position   optional explicit world coordinate / zone / landmark
axis_id          optional action-axis identifier
axis_side        optional side of that action axis
```

Top-level world state may also track:

```text
props[]          owner / location / condition
scene{}          durable door/light/weather/damage keys
camera.position  optional world coordinate / zone
camera.facing    optional world-facing vector/value
camera.target    optional numeric look-at point
camera.yaw_deg   optional yaw in degrees when a target is unavailable
camera.axis_id   action axis currently used by the camera
camera.axis_side side of that axis occupied by the camera
axes{}           optional named axis definitions for reports / tooling
```

`world_position`, camera state, and named axes are primarily explicit-state fields. Do not pretend free prose gives precise 3D coordinates when it does not.

## Role-aware natural-language parsing

Spatial roles are parsed separately. In particular:

```text
@Mori位于画面右侧，面向画面左侧。
```

must become:

```text
screen = right
facing = left
```

The parser removes facing/gaze/movement predicates before extracting screen position, so a facing phrase cannot overwrite a position field.

Negated actions are not transition evidence. Phrases such as these do **not** legalize a state change:

```text
@Ling没有转身
@Ling没有移动
@Ling没有换手
@Ling未受伤
```

## Transition checks

The validator detects:

- `MOTION_REVERSAL` — movement direction reverses without a shown turn/reversal.
- `SCREEN_POSITION_JUMP` — left/right screen position jumps without movement evidence.
- `ENTRY_EXIT_MISMATCH` — entry/exit edges contradict established travel direction.
- `HAND_SWAP` — the same prop changes hands without a hand-transfer event.
- `HAND_PROP_APPEARS` / `HAND_PROP_DISAPPEARS` / `HAND_PROP_REPLACED`.
- `PROP_TELEPORT` — a tracked prop changes owner/location without a matching prop transfer/move.
- `PROP_CONDITION_JUMP` — prop condition changes without a matching prop damage/repair event.
- `POSTURE_JUMP` — posture changes without a visible transition.
- `INJURY_RESET` / `INJURY_APPEARS`.
- `WARDROBE_JUMP`.
- `GAZE_JUMP`.
- `FACING_FLIP`.
- `WORLD_POSITION_JUMP` — explicit world position changes without a move/reposition event for that entity.
- `AXIS_ID_JUMP` — entity action-axis id changes without reset/re-establishment.
- `ENTITY_AXIS_SIDE_JUMP` — an entity changes side of an axis without movement/turn/reset.
- `CAMERA_AXIS_CROSS` — camera crosses the same action axis without `camera_cross_axis` / `axis_reset`.
- `CAMERA_AXIS_ID_JUMP` — camera changes to another axis without re-establishing it.
- `SCENE_STATE_JUMP` — a durable scene key changes without a matching scene-key event.
- `LEGACY_EVENT_INFERRED_SCOPE` — an old string event was safely assigned to one unambiguous scope.
- `LEGACY_EVENT_AMBIGUOUS` — an old string event has multiple possible targets and is **not** allowed to authorize a transition.

## Natural-language mode

No special syntax is required for normal use:

```text
@Ling位于画面左侧，面向画面右侧，右手持手枪。
@Ling从画面左侧向右移动。
@Ling把手枪从右手换到左手。
@Ling从画面右侧出画。
@Ling左肩受伤，伤口持续流血。
```

Write observable facts. `保持一致`, `位置不变`, or `继续之前动作` alone cannot prove exact side/hand/direction state.

<!-- RULE:CONTINUITY.EVENT_SCOPE -->
## Relation / transaction parsing

A hand-off is not two unrelated state changes. It is one transaction with participants:

```text
actor → prop → target
```

Natural-language examples understood by v3.0 include:

```text
@Ling把手枪递给@Mori，@Mori右手接住。
@Mori从@Ling手中接过门禁卡。
@Ling hands the pistol to @Mori; @Mori receives it with his right hand.
@Mori receives the keycard from @Ling.
```

A valid relation may clear the source hand and populate the recipient hand in the same shot. It authorizes only the named participants and prop; it cannot excuse a third character suddenly gaining an object.

Preferred explicit form:

```json
{"type":"prop_transfer","actor":"@Ling","target":"@Mori","prop":"手枪","from_hand":"right_hand","to_hand":"right_hand"}
```

## Geometry-backed projection

When numeric world positions and a numeric camera are supplied, v3.0 can check world-to-screen consistency. Supported camera forms include `position + target`, `position + facing vector`, or `position + yaw_deg`. The engine projects each numeric `world_position` onto the camera right/forward basis and can emit:

- `SCREEN_PROJECTION_MISMATCH` — declared left/center/right conflicts with geometry.
- `DEPTH_PROJECTION_MISMATCH` — declared foreground/midground/background conflicts with a coarse geometry estimate.

This is a deterministic continuity check, not a full renderer: it does not model lens distortion, occlusion meshes, exact FOV clipping, or depth of field.

## Optional explicit state annotation

```html
<!-- CONTINUITY {
  "entities": {
    "@Ling": {
      "screen":"left",
      "facing":"right",
      "move":"L>R",
      "posture":"standing",
      "left_hand":"empty",
      "right_hand":"手枪",
      "injuries":["left_shoulder"],
      "wardrobe":"black_jacket",
      "gaze":"@Mori",
      "world_position":{"x":0,"y":0,"z":0},
      "axis_id":"dialogue-A",
      "axis_side":"north"
    }
  }
} -->
```

Props, scene, camera, and axes may be explicit too:

```html
<!-- CONTINUITY {
  "props": {
    "keycard":{"label":"门禁卡","owner":"@Ling","location":"jacket_pocket","condition":"intact"}
  },
  "scene":{"main_door":"open","key_light":"left"},
  "camera":{"position":{"x":0,"y":-4,"z":1.6},"axis_id":"dialogue-A","axis_side":"north"},
  "axes":{"dialogue-A":{"a":"@Ling","b":"@Mori"}}
} -->
```

### Scoped transition events — preferred format

Every event that can belong to a person, prop, or scene key should name its target.

```html
<!-- CONTINUITY {
  "events":[
    {"type":"turn","entity":"@Mori"},
    {"type":"hand_transfer","entity":"@Ling","prop":"手枪","from":"right_hand","to":"left_hand"},
    {"type":"prop_damage","prop":"门禁卡"},
    {"type":"scene_change","scene_key":"main_door"}
  ],
  "entities":{
    "@Ling":{"right_hand":"empty","left_hand":"手枪"}
  }
} -->
```

A scoped event authorizes only its target. `@Mori` turning cannot legalize `@Ling.facing`; damage to `门禁卡` cannot legalize damage to `手机`; a `window` event cannot legalize `main_door` changing.

Camera-axis transitions use:

```html
<!-- CONTINUITY {
  "events":[{"type":"camera_cross_axis"}],
  "camera":{"axis_id":"dialogue-A","axis_side":"south"}
} -->
```

Supported event types / aliases:

```text
turn / reversal
axis_reset / camera_cross_axis
hand_transfer / transfer
move / movement / reposition
posture_change
injury / injury_cause
recovery / treatment / heal
prop_move / pickup / drop / place / prop_transfer
prop_damage / prop_repair
wardrobe_change
gaze_change
scene_change / light_change / door_change / weather_change
```

### Legacy string events

Old syntax remains readable:

```html
<!-- CONTINUITY {"events":["turn"],"entities":{"@Ling":{"facing":"left"}}} -->
```

If exactly one legal target exists, v3.0 infers its scope and emits `LEGACY_EVENT_INFERRED_SCOPE`. If multiple entities/props/scene keys could be the target, it emits `LEGACY_EVENT_AMBIGUOUS` and **does not** use that event to excuse state changes.

New files should use scoped event objects.

### Patch semantics

- Omitted field = carry forward previous known state.
- `left_hand: "empty"` / `right_hand: "empty"` = explicitly empty that hand.
- `injuries: []` = explicitly no tracked injury.
- `move: "NONE"` = explicitly stopped.
- An explicit state change still needs a visible cause when causality matters.

## CLI

Normal validation:

```bash
node scripts/validate-storyboard.mjs storyboard.md
```

Target-model checks:

```bash
node scripts/validate-storyboard.mjs storyboard.md --model "Wan 3.0"
```

Export the state trace:

```bash
node scripts/validate-storyboard.mjs storyboard.md --state-report state-report.json
```

Strict continuity gate:

```bash
node scripts/validate-storyboard.mjs storyboard.md --strict-continuity
```

Combined:

```bash
node scripts/validate-storyboard.mjs storyboard.md --script script.txt --model "MiniMax H3" --state-report state-report.json --strict-continuity
```

## Reading the state report

`--state-report` writes:

```text
validator_version
source
model
strict_continuity
assets
findings[]
trace[]
final_state
```

`trace[]` stores the world snapshot after each spatial block, shot, or ending state. Find the first unexpected change rather than debugging only the final frame.

## Regression tests

Run:

```bash
node scripts/test-validator.mjs
```

The v3.0.1 suite contains **44 fixed regression/adversarial scenarios + 300 generated mutation cases = 344 cases**. It attacks position/facing role leakage, Chinese/English parsing drift, cross-entity event leakage, relational prop hand-offs, third-party authorization leaks, world-position changes, camera reprojection, geometry mismatch, prop/scene scope, action-axis changes, camera axis crossing, and negated-action parsing.

## Design rule

The state engine is a verifier, not a substitute for clear directing. If prose is ambiguous, rewrite the physical fact explicitly instead of teaching the validator to guess.


### Bilingual dialogue/verbatim validation

The validator extracts Chinese screenplay quotes, English spoken quoted lines, and MiniMax H3 `<d>[Language] ...</d>` payloads. With `--script`, supplied dialogue is checked against the source text after Unicode/whitespace normalization while preserving word order and punctuation content. Capacity warnings use language-aware planning estimates (Chinese characters vs. English words) rather than applying a Chinese character count to English dialogue. This is a planning warning, not a claim about exact actor speed.
