# Model defect compensation (field-verified)

Two defects verified by the user's own paid generations. The response to both is to compensate inside the prompt — never to avoid the model. Apply these rules whenever the target model is Wan 3.0 or MiniMax H3, and prefer them even on other models unless the user says otherwise.

## Defect 1: Wan 3.0 fight scenes degrade

Complex exchanges collapse into unreadable flailing. Compensate by simplifying what one Clip asks the model to render:

- One complete action unit per shot: initiation → contact → displacement → recovery. No multi-hit exchanges inside a single shot; put a second exchange in the next shot instead.
- Write the load chain explicitly, bottom-up: 脚底蹬地 → 腰胯转动 → 拳/械到达接触点 → 受击方沿受力方向位移 → 踉跄后站稳. Name the contact point and the displacement direction for every strike.
- Keep the camera readable: 固定机位 or 缓慢推进 during exchanges. Avoid fast orbits, spins, or whip pans while bodies are moving fast.
- If more than two characters are in frame, the others hold position, block a route, or threaten — only one pair exchanges in this Clip.
- Write beats as physical facts (contact, displacement, recovery), never as speed adjectives (凌厉, 快如闪电, 密集对攻).

## Defect 2: lip movement during off-screen narration (OS/VO) — Wan 3.0 AND MiniMax H3

When the audio is narration or an off-screen line, visible characters still mouth speech. Suppress it explicitly:

- In every shot where a visible character must stay silent while audio plays, write the constraint verbatim, naming the character:
  `XX嘴巴自然闭合，无口型，无说话动作，表情与呼吸正常。`
- Do not rely on global instructions; repeat the closed-mouth fact inside the shot line or the constraint block of that Clip.
- MiniMax H3 only: off-screen narration must NOT be placed in a `<d>` dialogue block — that block commands on-screen speech. Route narration through the soundscape/narration field instead.
- Add one `生成前提醒` bullet noting that these constraints reduce but do not eliminate the defect; a re-roll is the fallback and is not a storyboard error.

## Validation hooks

`scripts/validate-storyboard.mjs` enforces these mechanically:

- A Clip marked 画外音/旁白/VO/OS whose body lacks a closed-mouth/no-lip constraint raises a warning.
- An action Clip (动作/打斗/追逐/武打) whose body lacks load-chain vocabulary raises a warning.
- With `--script <file>`, every quoted dialogue line in the Clips must appear verbatim in the script (error if not).
