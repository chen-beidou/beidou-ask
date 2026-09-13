# Lighting direction (光影控制)

<!-- RULE:LIGHT.CONTINUITY -->
Light is a controllable fact, not ambience. The model renders visible light behavior — source, direction, contrast, color — so every lighting choice is written as an observable fact, never as a mood word.

## Decide three things per scene

1. **Motivation** — where the light physically comes from: 窗/天光/顶灯/台灯/火光/屏幕/霓虹/车灯. No unmotivated glow.
2. **Direction and shape** — 顺光/侧光/逆光/顶光/底光, plus hardness: 硬光 leaves a readable shadow edge, 柔光 wraps the face.
3. **Ratio and color** — 高反差/低反差, and the temperature relation: 单一色温, or a deliberate 冷暖对撞.

## Where each layer carries it

| Layer | Carries |
|---|---|
| 全局风格锁定 | the film-wide light signature once: source family, color, contrast |
| 空间站位 | the scene's current light state: which side the key light sits, which way shadows fall |
| 镜头行 | only light facts this shot can see: a shadow edge moving, a face crossing into light, a lamp switching, a passing reflection |
| 决定性镜头 | may land one **light event** — 灯闪、影扫过脸、走进光里、逆光剪影成形 — written as visible action, not as an adjective |

## Continuity

- Source direction, color temperature, and contrast are durable state: they survive cuts and change only with a visible cause (someone opens a curtain, a lamp is switched, a car passes).
- A character moving toward or away from a light changes how the light sits on them — write that change where it happens, never as an unexplained reset.
- A light change that must land across a Clip boundary is stated at the boundary (last shot or ending state).

## Forbidden

- Mood-only light words with no behavior: 高级光影, 氛围光, cinematic lighting — the model cannot render them.
- Unmotivated sources, a different light every shot, or a direction flip without cause.
- A light change carrying emotion the blocking does not support — see the one-to-one metaphor rule in `camera-vocabulary.md`.

## Example

> 坏例：灯光很有氛围。
> 好例：走廊尽头一盏冷白顶灯，两人影子朝镜头方向拉长；他侧身半步，左脸进阴影，右脸被灯打亮。
