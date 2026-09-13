# MiniMax H3 adapter

<!-- RULE:LANGUAGE.CONTRACT -->
<!-- RULE:MODEL.SYNTAX_PRECEDENCE -->
<!-- RULE:MODEL.CLAIM_PROVENANCE -->

Use this profile only when the user selects MiniMax H3. Do not confuse it with MiniMax M3, which is a text, coding, and agentic model with video understanding rather than the corresponding video generator.

## Verified capability envelope

- Support multimodal context containing text, images, video, and audio, with video plus native stereo-audio output.
- Support 4–15 second output, up to 2K, and multiple aspect ratios including 16:9 and 9:16 in the official H3 release description.
- Treat exact public API fields, reference quotas, hosted resolution tiers, and regional availability as interface-dependent until verified.

## Official prompt grammar (machine-facing layer)

The **official MiniMax H3 prompt-writing guide wins over the generic beidou output language contract for the machine-facing prompt body**. Keep user-facing explanation/asset cards in the user's language, but render H3 syntax fields and descriptive prose in English as required by the official guide; preserve the original language and punctuation inside dialogue/lyrics `<d>` blocks and visible on-screen text.

Select the actual workflow first:

- **T2VA** — text to audiovisual video.
- **I2VA** — image as exact first frame.
- **FL2VA** — exact first and last frames.
- **L2VA** — image as exact last frame.
- **Full-reference / Ref2VA** — use the official six-section reference rewrite format when the active H3 interface uses full-reference mode.

For T2VA/I2VA/FL2VA/L2VA, the final machine prompt uses the official three core fields in this order:

```text
[optional official image-alignment instruction for I2VA / FL2VA / L2VA]

integrated_multimodal_description: [Shot 1] ... [Shot 2] At 00:03.500, the camera cuts to ...

overall_soundscape: ...

non_diegetic_music: ...
```

Rules inherited from the official guide:

1. `[Shot 1]` has no cut timestamp; every later shot begins with a strictly increasing `At MM:SS.mmm, ...` cut time inside the video duration.
2. Camera motion is natural English inside the shot, with motion type and only meaningful amplitude/speed modifiers.
3. Speaking subjects keep stable `(S1)`, `(S2)` IDs across shots. Put identity/action/delivery outside `<d>`; put only `[Language]` + verbatim spoken text inside `<d>`.
4. Voiceover uses `says in an off-screen voiceover`; when that character is visible, explicitly keep the lips closed.
5. A spoken line that crosses a cut uses the official continuation mechanism (`<scenetrans>` where applicable) and states that audio continues, rather than repeating the words.
6. `overall_soundscape` summarizes ambience/physical/non-verbal human sound and does not duplicate dialogue. `non_diegetic_music` is audience-only music or `N/A`.
7. For I2VA/FL2VA/L2VA, use the exact alignment instruction required by the official H3 guide; do not paraphrase it.

The generic beidou Clip/shot plan remains the **director planning layer**. The H3 adapter compiles that plan into this official machine grammar instead of pasting the generic schema directly.

## What must survive compilation

The official grammar may reformat our wording, but nothing may be deleted on the way in:

- durable state (posture detail, binding marks, prop form 形状/成色/位置, injury, light direction) stays as descriptive prose inside the shot;
- the three sound layers (环境底噪 / 材质动作声 / 身体声) land in `overall_soundscape`; anything that could be mistaken for music is labeled 非音乐 and `non_diegetic_music` stays `N/A` unless the user asks for score;
- inner beats stay inside the shot's prose — H3 cut times are cut times, not beats;
- each line keeps its open/close timing and its voice anchor's relative change, written outside `<d>` as delivery and identity;
- the axis side and the angle change between consecutive shots stay in the shot prose;
- the unit's freeze-frame line and any named prohibition stay in the readable plan and are repeated in the constraint line rather than dropped.

## Delivery form

Keep both layers in one delivery: the readable Chinese director plan (asset card, style lock, spatial block, per-shot lines) stays visible, and the compiled English machine prompt is delivered as **one clearly marked copy-ready block** the user copies into H3 as a whole. Never interleave the two grammars shot by shot.

- Compile each Clip's shots into `[Shot 1] ... [Shot 2] At MM:SS.mmm, ...`. A later shot's cut time equals the previous shot's end time in the plan: plan shots `0-2.4秒` and `2.4-5.2秒` → `[Shot 1] ... At 00:02.400, the camera cuts to ...`（计划里的 2.4 秒 = 00:02.400）.
- Keep speaking IDs `(S1)`, `(S2)` stable across shots and keep `<d>` payloads verbatim in the original language.
- The Chinese plan keeps shot numbering, 机位高度, 起幅→落幅, 速度, and 镜头物理响应; the machine layer states the same camera behavior in natural English so the two layers agree.
- Name the marked block in the delivery's 怎么用 line so the user knows exactly what to paste, and keep the per-Clip reference numbers beside it.

## Planning rules before compilation

1. Keep each generated unit within the selected H3 interface's supported duration.
2. Design sound with the picture: bind dialogue, breath, impact, ambience, and silence to visible causes.
3. Assign each multimodal reference a role—identity, motion, environment, composition, or audio—and prohibit unwanted transfer.
4. Keep dialogue verbatim and allocate real performance time.
5. Prefer compact causal actions and a clear ending state over decorative camera stacks.

## Field observation (user-paid generations, 2026-08)

- Off-screen narration (OS/VO) makes visible characters mouth speech. Compensate: name the character and state `嘴巴自然闭合，无口型，无说话动作` inside the shot or constraint block. Off-screen narration must never be placed in a `<d>` dialogue block — that block commands on-screen speech; route narration through the soundscape/narration field. See [model-defect-compensation.md](model-defect-compensation.md).

Render the delivery label as `MiniMax H3`.
