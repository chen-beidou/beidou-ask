# Transitions and hand-offs (转场与衔接)

<!-- RULE:TRANSITION.HANDOFF -->
A cut is a hand-off, not a restart. Each new shot states what it continues from; each Clip opens from the previous Clip's ending state.

## Within a Clip

- Every shot after the first opens by naming its hand-off in one short clause: 承接上一镜的转身 / 动作未停 / 顺势 / 同时 / 话音未落. This tells the model the action and the audio continue rather than restart.
- Name the cut mechanism when it matters: **动作切** (cut inside a motion — 出拳一半、转身途中), **遮挡切** (a foreground body or object wipes the frame), **焦点接力** (focus travels and the cut lands where attention already is), **声音桥** (the next beat's sound starts before its picture). Pick one mechanism; do not stack several in a sentence.
- The incoming shot must not replay the action or line the outgoing shot already completed.

## Across Clips

- Clip N+1 opens from Clip N's ending state — position, hands, props, injuries, light, audio tail. Restate the minimum incoming state in its spatial block.
- Each independently generated Clip must stand alone; a 「承接上一段」 opening clause is allowed but may not depend on the previous Clip's rendered video.
- Audio across a boundary: use an explicit audio handoff/edit plan, or keep a spoken line inside one Clip — never duplicate the same words on both sides.
- Movement across a boundary follows the enter/exit rule in `continuity-ledger.md`.

<!-- RULE:CUT.GEOMETRY -->
## Cut geometry (轴线与角度)

A hand-off clause keeps the action fluid; the axis and the angle keep the space readable. Both are decided at the cut, in the prompt.

- **180° rule.** Every shot of an exchange stays on the chosen side of the axis. Declare it in the spatial block (轴线在哪两个人之间、相机在哪一侧、谁在画面左/右). Crossing is legal only through a neutral shot on the axis or a continuous camera move that crosses on screen — never silently, and never between independently generated Clips.
- **30° rule.** Two consecutive shots of the same subject change the camera angle by roughly 30° or more, or change framing size enough to read as deliberate. Same subject + same size + near-identical angle reads as a jump cut.
- **Eyeline match.** The reverse shot looks back toward the position the previous shot established, and restates the height/depth relation so the two people do not appear to swap rank.
- See `axis-and-angle.md` for the crossing methods, reverse-shot staging, and the constraint wording.

## Edit-level transitions

黑场、渐隐、叠化、字幕卡 belong to the edit unless the script asks for them; when they do, name the boundary they land on and keep them out of per-shot camera language.

## Forbidden

- A state jump across a cut with no shown cause (position, light, prop, injury).
- The same action or the same line appearing on both sides of a cut.
- A transition word with no mechanism behind it (无缝转场、丝滑过渡 as decoration).
