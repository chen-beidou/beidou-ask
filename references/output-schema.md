# Output schema

Return these four sections by default.

## 1. 美术资产对照卡

```markdown
| 资产引用 | 文字短锚点 | 本段用途 | 请用户核对 |
|---|---|---|---|
```

List only assets used in the generated scene. Do not include art-generation prompts.

## 2. 全局风格锁定

```text
风格锁定：{媒介来源}，{渲染方式}，{角色质感}，{运动质感}，{材质语言}，{光影色彩}。
特殊风格化：不启用。全片保持普通风格锁定，不额外叠加梦境、回忆、监控、漫画化或游戏UI。
```

Enable a special style only when the story requires one, and state its exact shot range.

## 3. 视频生成提示词

```markdown
### Clip 01｜15秒｜9:16｜对峙模式｜真人写实

```text
空间站位：……

镜头一（0-2.4秒）：中景（medium shot）固定拍摄（static shot），……
镜头二（2.4-5.2秒）：近景（close-up）缓慢推进（push in），……；关键表演需要时附“浅景深、85mm长焦方向”。

结尾状态：……
约束：……；保留……声，无音乐，无字幕。
```
```

Professional audiovisual terms use `中文（English）` on first use within each Clip only. Aperture and focal annotations stay Chinese when used, but are optional and reserved for functionally important shots.

For two durations or ratios, share asset/style sections once and label variants clearly. Each ratio gets its own spatial block and materially different composition.

## 4. 生成前提醒

At most three bullets. Mention only real assumptions, asset conflicts, density risks, or a necessary split. Otherwise say `未发现明显资产冲突。`

## Timeline and numbering

- Start at 0 seconds.
- Adjacent boundaries match exactly.
- End at declared duration.
- Use half-width hyphen and at most one decimal.
- Use Chinese shot numbering: `镜头一`, `镜头二`, etc.

## Constraint block

Keep five to eight scene-specific constraints. At least three cite concrete characters, props, positions, injuries, light states, or overlap facts. Put sound requirements last.
