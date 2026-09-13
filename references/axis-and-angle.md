# Axis and camera angle (轴线与机位角度)

<!-- RULE:CUT.GEOMETRY -->
Two rules decide whether a cut reads as a smooth continuation or as a jump: the **180° rule** (which side of the axis the camera lives on) and the **30° rule** (how much the camera angle changes between two shots of the same subject). Both are written into the prompt; neither can be repaired later.

## The 180° rule (轴线)

- The axis is the line between two people in an exchange, or the line of one person's movement or gaze. Choose a side when the scene starts and stay on it.
- Every shot in a continuous exchange stays on that side. A shot from the other side flips who is frame-left and frame-right; the audience reads it as the geography breaking, not as a new angle.
- Crossing is legal only with a visible cause: a neutral shot sitting on the axis (机位压在轴线上、跨肩正对), a continuous camera move that crosses on screen (弧移绕过人物), or a new establishing shot that re-declares the relation. Never cross silently — and never cross between two independently generated Clips.
- State the axis in the spatial block: 轴线在哪两个人之间、相机在轴线哪一侧、谁在画面左谁在画面右、谁朝向哪边.

## The 30° rule (角度变化)

- Two consecutive shots of the same subject must change the camera angle by roughly 30° or more, or change the framing size enough that the change reads as deliberate. Same subject + same size + near-identical angle = jump cut.
- 正反打 (reverse shots) are the standard legal alternation: A over B's shoulder, then B over A's shoulder — each on its own side of the axis, each at least 30° from the previous setup.
- Prefer stepping the size and the angle together: 全景 → 中景 → 近景 → 特写, or a genuinely different side (右前方 → 左前方 → 正侧).
- In a locked conversation, alternate 过肩 / 单人 / 反应 / 手部特写 rather than two nearly identical setups of the same person.

## Eyeline, height, and screen direction (视线·高低·运动方向)

- Match the gaze: in the reverse shot the listener looks back toward the position the previous shot established — left→right, right→left, and up or down by the real height difference.
- Keep the depth and height relation visible in every reverse shot (一高一低、一前一后、隔一张桌子), or the two people appear to swap rank and position.
- Preserve screen direction for movement and for a subject entering or leaving frame (see `continuity-ledger.md`).

## Write it into the prompt

- **Spatial block:** axis owner, camera side of the axis, who is frame-left/frame-right, height and depth relation.
- **Shot line:** the camera angle relative to the previous shot whenever the size change alone does not carry it — `机位由右前方移到左前方，角度变化约40°`.
- **Constraint block:** one named prohibition against the break this scene invites — `禁止两人左右互换`, `禁止机位跳到轴线另一侧`, `禁止出现两个同角度同景别的相邻镜头`.

## Avoid

- A reverse angle that mirrors the previous frame exactly; an exact flip reads as a jump, not as a new shot.
- Covering one line with two near-identical setups.
- Treating the axis as a post-production problem: if the shots are generated from prompts on both sides of the line, no edit fixes it.

See also `transitions.md` (hand-off clauses and cut mechanisms) and `camera-vocabulary.md` (the shot-line template).
