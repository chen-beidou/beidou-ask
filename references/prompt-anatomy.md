# Prompt anatomy (提示词十层)

<!-- RULE:PROMPT.LAYERS -->
A complete prompt is built in ten layers. Each layer answers a question the model would otherwise answer for itself — and every answer a model improvises is a place the output drifts. Write facts, not adjectives: a layer is finished when its content could be understood by someone who has never seen the scene and never read the script.

| # | Layer | Answers | Rules live in |
|---|---|---|---|
| 1 | Hard spec | how long, what ratio, what medium, which dialogue language, music/subtitles or not | `SKILL.md` defaults, adapter files |
| 2 | Facts | who is where, in what relation, holding which prop, under which main light | `output-schema.md`, `spatial-power.md` |
| 3 | Durable state | posture detail, binding/bandage method, prop form, injuries, light and shadow direction, moisture — everything that must survive a cut | `continuity-ledger.md` |
| 4 | Action | start → direction → force → pause → end; who receives force and how the body answers; weight and support point | `action-mode.md`, `emotion-performance.md` |
| 5 | Camera | shot size, camera height, dominant move (start→end framing), speed, camera physical response, perspective, depth layering | `camera-vocabulary.md` |
| 6 | Visible detail | material and micro-performance facts, sized to the shot | `detail.md` |
| 7 | Sound | ambience floor + material action sound + body sound, plus dialogue | `sound-direction.md` |
| 8 | Time | beats inside a time block, and the freeze frame the next unit starts from | `output-schema.md` |
| 9 | Named prohibitions | the specific deformation this shot invites — not generic quality words | `output-schema.md` constraint block |
| 10 | No-loss delivery | whether every applicable rule has visible execution evidence; compression is allowed only for an explicitly requested derivative | below |

## Priority when layers compete

Narrative fact > durable state > dialogue > blocking/axis > action causality > camera > detail > sound > polish.

Detail and sound lose to story. A beautifully described material that fights the blocking or buries the line gets cut, not kept.

## Compression order — explicit concise derivative only

The default delivery is uncompressed. Never delete rule execution evidence merely because the prompt is long. When the user explicitly requests a concise derivative, remove in this order:

1. repeated camera wording
2. repeated light/style description
3. duplicate negative constraints
4. decorative particles and fabric motion that carry no state
5. secondary movement that changes nothing

Never cut: identity, ownership, initiator, contact, displacement, dialogue, trigger placement, ending/freeze state, main-light position, or a named prohibition that answers a defect already observed in this project.

## Detail is not volume

No layer means "more is better". Every fact must be **sourced** (supplied asset, scene facts, or script), **visible at its shot size**, and **story-serving**. A pile of adjectives renders as mush and buries the action; when in doubt, cut the detail that competes with the focal action.

## Which layers are usually missing

In practice the thin layers are 3, 6, 7, 8, 9 — durable state, material detail, sound floor, inner beats, and named prohibitions. Layers 1, 2, and 5 are the ones writers fill first; check the lower half of the table before calling a prompt finished.

> 坏例：`他害怕地后退，气氛紧张。`
> 好例：`他上身后缩、背抵岩壁，右手在泥地上抓紧、指缝挤出湿泥；藤蔓勒进小臂的吱声压过水声；额角干泥被汗浸开，顺着太阳穴流到下颌，悬而不落。`
