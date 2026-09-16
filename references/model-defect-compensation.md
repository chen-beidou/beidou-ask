# Model defect compensation

<!-- RULE:MODEL.SCOPE -->
The observations below come from user-paid generations and are **model-scoped field observations**, not universal laws. Apply a workaround only to the model(s) named by that defect. Never promote it to another model merely by analogy. On an untested model, the same wording may be tried only as an `EXPERIMENTAL` heuristic and should not become a hard invariant until reproduced. See `evidence-policy.md`.

## Defect 1: Wan 3.0 fight scenes degrade `[FIELD-OBSERVED]`

Complex exchanges collapse into unreadable flailing. Compensate by simplifying what one Clip asks the model to render:

- Start with one readable causal action unit per shot: initiation → contact/clear interaction → displacement/result → recovery/new state. If a multi-hit exchange is essential, keep it only when each contact and result remains readable; otherwise split the exchange.
- Describe the force chain that actually applies to the action. For a grounded human strike this may be 脚底/支撑 → 躯干/关节传力 → 接触点 → 受力方向 → 恢复；for aerial, seated, vehicle, firearm, creature, or non-human motion, use the relevant support/impulse chain instead of forcing a foot-to-hip template.
- Keep camera motion subordinate to action readability. A locked/slow camera is one reliable option, but a motivated tracking or composite move is allowed when it does not hide the causal contacts.
- In multi-character scenes, limit simultaneous precision choreography to what can remain causally legible; background characters may still move when their motion has a clear task and does not compete with the focal exchange.
- Write beats primarily as physical facts (contact/interaction, displacement/result, recovery). Speed/quality adjectives may supplement those facts, but must not replace the causal action description.

## Defect 2: lip movement during off-screen narration (OS/VO) — Wan 3.0 AND MiniMax H3 `[FIELD-OBSERVED]`

When the audio is narration or an off-screen line, visible characters still mouth speech. Suppress it explicitly:

- In every shot where a visible character must stay silent while audio plays, write the constraint verbatim, naming the character:
  `XX嘴巴自然闭合，无口型，无说话动作，表情与呼吸正常。`
- Do not rely on global instructions; repeat the closed-mouth fact inside the shot line or the constraint block of that Clip.
- MiniMax H3 only: off-screen narration must NOT be placed in a `<d>` dialogue block — that block commands on-screen speech. Route narration through the soundscape/narration field instead.
- Add one short post-prompt safety note stating that these constraints reduce but do not eliminate the defect; a re-roll is the fallback and is not a storyboard error. This note is mandatory and may never be dropped for brevity.

## Validation hooks

`scripts/validate-storyboard.mjs` keeps model-specific checks scoped behind `--model` and also runs model-agnostic world-state comparison:

- A Wan 3.0 / MiniMax H3 Clip marked 画外音/旁白/VO/OS whose body lacks a closed-mouth/no-lip constraint raises a warning.
- A Wan 3.0 action Clip (动作/打斗/追逐/武打) whose body lacks load/contact/displacement/recovery vocabulary raises a warning.
- With `--script <file>`, every quoted dialogue line in the Clips must appear verbatim in the script (error if not).
- Across all models, adjacent shots are compared for movement reversal, screen-position jumps, hand swaps, prop teleportation, posture jumps, injury resets/appearance, entry/exit mismatch, and facing flips. See `continuity-validator.md`.
