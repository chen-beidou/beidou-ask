<!-- RULE:LANGUAGE.CONTRACT -->
<!-- RULE:MODEL.SYNTAX_PRECEDENCE -->

# Output schema

## Planning schema vs. model machine grammar

This file defines the complete readable director plan. Before delivery to a target model, compile it through that model's adapter. A verified adapter may change field language, reference syntax, dialogue tags, or timestamp syntax while preserving story facts, durable state, dialogue, causal action, geometry, sound, prohibitions, and outgoing state. Never force this readable schema into a model whose verified machine grammar requires another form.

## Default delivery: one complete uncompressed segment

Every independently generated segment is self-contained. Do not require the user to combine an external asset card, style block, prompt block, and reminder block. Use this order:

1. segment header and source range
2. `素材说明`
3. `一句话概述`
4. `具体情节`
5. `全局补充`

Do not compress the default delivery. A concise derivative is allowed only when the user explicitly requests it; it never replaces the complete rule-auditable version.

```markdown
# 第01段｜15秒｜9:16｜Seedance 2.5

对应剧本：第18—20句
出场人物：@阿成、@小满
场景：@公寓客厅

【素材说明】
...

【一句话概述】
...

【具体情节】

初始状态：...

### 0—3秒｜镜头标题｜状态变化：...

承接与状态：...

画面动作：...

摄影机：...

可见细节与光影：...

台词与声音：...

镜头落点：...
本镜禁止：...

段尾定格帧＝下一段起幅：...

【全局补充】

硬规格：...

持久固定事实：...

全段禁止项：...
```

<!-- RULE:ASSET.BINDING -->
## 素材说明

List only assets used in the segment. For each asset, bind the platform reference token or slot to:

- identity/name
- assigned use
- supplied stable anchors
- voice anchor for a speaking character
- what must not be borrowed from that asset when ambiguity exists

When the project binds references by image number, repeat the stable number in every independently generated segment. Use `@Name` only when the selected interface supports it. A supplied reference owns appearance; do not add conflicting invented appearance. Write a half-width space after an `@Name` followed directly by Chinese prose so the token remains machine-separable.

## 一句话概述

Write one sentence containing subject, place, event, medium/style, dominant camera strategy, and the outgoing dramatic state. This is the causal overview, not a substitute for timestamped execution.

## 具体情节

### 初始状态

<!-- RULE:ASPECT.SAFE_ZONE -->

Write the world state before the first shot:

- identity and character count
- world position, screen projection, depth, height, distance, orientation, posture, gaze
- hand use, prop ownership/form/condition, wardrobe, dirt, injury, restraint
- movement direction and unfinished motion
- axis owner and camera side of axis
- motivated key light, shadow direction, temperature/contrast
- durable medium/weather state and ambience floor
- whether any other people are present

World state is authoritative; screen side is only its current camera projection. For 9:16, stage through depth and height rather than describing a crop. Keep eyes, mouth, hands, and trigger props inside the current delivery surface's usable region.

### Timestamped shot block

Every shot header carries its exact time range, a functional title, and the meaningful state change earned by the shot. A new angle that changes no information, emotion, tactical advantage, spatial relation, physical action, or decision is decorative and must be removed.

Use these functional fields. Do not replace them with abstract rules.

#### 承接与状态

<!-- RULE:TRANSITION.HANDOFF -->

The first shot opens from `初始状态`. Every later shot names the unfinished action, gaze, sound, occlusion, or focus it inherits and one cut mechanism when relevant: 动作切 / 遮挡切 / 焦点接力 / 声音桥 / 视线匹配. Never replay an action or line already completed.

#### 画面动作

Write observable causal execution:

- dialogue/performance: trigger → physiological leak → control strategy → listener response → changed relation
- action: initiation → defense/evasion/contact → force direction/displacement → recovery choice → changed tactical state
- insert/detail: one readable focal event → visible consequence

Use inner beats inside a block over about four seconds or containing a turn. State direction, side, hand, contact point, support/balance, physical response, and resulting state when applicable.

<!-- RULE:CAMERA.INTENT -->
<!-- RULE:SHOT.TEMPLATE -->
<!-- RULE:CUT.GEOMETRY -->
#### 摄影机

Write shot size, camera height/view, axis side, relative angle/size change, one dominant camera intention, start framing → path → landing framing, speed, and camera physical response. A locked shot states fixed plus its response. A composite move is legal only as one triggered causal camera sentence.

Resolve geometry in text before delivery:

- name the camera's concrete side of the 180° axis
- for consecutive shots of the same subject, state a roughly 30° or greater setup change, or a framing change large enough to read deliberately
- if crossing the axis, show a neutral-axis shot or a visible continuous crossing move
- preserve eyeline, height/depth relation, and travel direction

Do not output `遵守30度规则` or `不要越轴` as a substitute for calculated camera placement.

<!-- RULE:DETAIL.BY_FUNCTION -->
<!-- RULE:LIGHT.CONTINUITY -->
#### 可见细节与光影

Write at least one sourced, in-size, story-serving material/state detail; the real-focus subject, foreground/background defocus, and any motivated focus transfer; and only light behavior visible in this shot. Source direction, color temperature, contrast, shadow direction, weather, moisture, dust, and other durable medium state survive cuts unless a visible cause changes them.

Performance-led shots include environment pressure, one body micro-action, and one sound anchor. Action shots prioritize contact/force/displacement/recovery plus readable material response. Do not invent detail that conflicts with supplied assets or cannot be seen at the shot size.

<!-- RULE:VOICE.IDENTITY -->
<!-- RULE:DIALOGUE.TIMING -->
<!-- RULE:DIALOGUE.CONTINUITY -->
<!-- RULE:SOUND.LANDING -->
#### 台词与声音

Preserve supplied dialogue verbatim and in order. Give each spoken line its open time, close time, inner breath gap/overlap when relevant, and only the relative delivery change against the character's fixed voice anchor. A line may cross a motivated visual cut inside one continuous generation only when its audio remains one uninterrupted word sequence.

Write the three sound layers across the segment and where they change:

- environment floor
- material/action sound
- body sound

State sound perspective when framing/distance changes. Label sustained caused tones as non-music when they could be mistaken for score. Apply closed-mouth/no-lip OS/VO compensation only for a verified model/interface defect or when the user requests it. The final shot states the sound landing: hard cut, fade, held breath, or natural source tail.

<!-- RULE:CONTINUITY.WORLD_FIRST -->
#### 镜头落点

<!-- RULE:CONTINUITY.EVENT_SCOPE -->

Write the outgoing state needed by the next shot: world position, posture, gaze, hands, props, injury, movement direction, emotional exposure, durable environment/light state, unfinished motion, and audio tail. The next shot's `承接与状态` must begin from this state. Do not use generic `保持一致` where exact observable facts can prove continuity.

#### 本镜禁止

Name the concrete deformation or continuity failure invited by this shot: prop swaps hand, contact has no receiving force, movement teleports, a line restarts, an OS speaker moves lips, focus lands on the wrong subject, or light flips direction. Omit only when no real shot-specific risk exists. Never use generic quality phrases.

<!-- RULE:PROMPT.LAYERS -->
### 段尾定格帧＝下一段起幅

Write the exact state the next independently generated segment starts from: positions, posture, gaze, hands, props, injury, wardrobe, light, air/weather, expression, unfinished motion, and audio tail. This is the outgoing contract for regeneration and extension.

## 全局补充

Keep three functions:

- `硬规格`: duration, ratio, medium, dialogue language, music/subtitle/watermark state
- `持久固定事实`: identity, voice, wardrobe, prop form/ownership, scene structure, durable injury/restraint, main-light direction, persistent environment state
- `全段禁止项`: five to eight concrete unit-wide risks

This block summarizes durable facts; it never replaces per-shot execution. Necessary repetition at a cut is allowed and must not be removed for brevity.

## Timeline and numbering

- Start at 0 seconds.
- Adjacent boundaries match exactly.
- End at declared duration.
- Use one timestamp style consistently and at most one decimal place.
- Number segments consistently in the output language.

## Model-specific machine layer

When an adapter requires a separate machine grammar, preserve this complete readable plan and add one clearly marked compiled block. State which block is copied. Do not blend grammars or delete facts that lack a dedicated machine field; keep them as plain instructions when the adapter allows it.

## Repair delivery

For a narrow repair, return only the revised segment or shots plus the minimum affected incoming/outgoing state. Preserve unchanged facts and do not rewrite unrelated segments.
