# Camera vocabulary (镜头运动语义表)

Camera movement is motivated behavior, not decoration. Every move must answer *what it says about the character or scene*. Pick a movement the way you pick a line of dialogue.

## The rule: one primary move per shot

- Choose **one dominant move** per shot. Layer at most **one subtle micro-adjustment** (slight handheld tremble, a gentle rack focus).
- Never stack three moves in one shot (`pan + push in + crane` reads as aimless and the model renders mush).
- A **static shot is a valid, powerful choice** — stillness reads as control. Do not move the camera just to prove you know how.

## Motion → meaning table

| Motion | Semantics | Use for |
|---|---|---|
| 手持 handheld | 混乱 / 生猛 / 临场 / 偷窥 / 幽闭 | 打戏、追逐、濒死、急促紧张、纪实感 |
| 缓推 dolly in | 客观下压的情绪重量 | 推向人脸的动作/当机立断瞬间（斯皮尔伯格式） |
| 拉远 pull back | 抽离 / 孤立 / 揭示全境 | 从特写抽出人物渺小，或揭示身后的事物 |
| 平移 track | 跟随、并置、揭示 | 跟人走、沿墙暴露多重关系、并置对照 |
| 稳定器 steadicam | 漂浮 / 梦境 / 如入其境 | 跟人上楼、"边走边谈"、持续但不晃的流动 |
| 摇臂/上升 crane up | 荣耀、升腾、俯瞰宿命 | 英雄起身、战局收束、俯视战场 |
| 急推 snap push | 冲击 / 眩晕 / 逼近 | 转折瞬间、记忆闪回、逼近危险 |
| 甩摇 whip pan | 拒绝 / 闪避 / 骤转 | 角色猛然转头不看、快速转移注意力 |
| 升降/俯仰 tilt | 高低权力的视觉化 | 俯拍压人 / 仰拍扬人 |
| 静态 locked-off | 静止 = 权力 | 强势一方不动如山、对峙的僵硬 |
| 推拉变焦 dolly zoom | 眩晕 / 失重 / 孤立 | 角色瞬间失衡、四周压过来（Jaws 式，几秒内） |
| 焦点切换 rack focus | 引导视线/转移注意力 | 前景与后景的意义交替、暗示注意点 | 

## Micro-adjustments (optional)

- 轻微手持颤抖 handheld tremble — 加真实感，勿在静物/凝视镜头用
- 微焦点带过 gentle rack focus — 把视线从一个细节转到另一个
- 缓慢俯仰 slow tilt — 表现高度/威压变化

## Forbidden

- `dynamic camera`、`cinematic`、`beautiful movement` 等抽象词 — 模型不渲染，用具体方向词
- 一镜堆叠三种以上运动
- 无动机运镜：镜头动了但没揭示新信息、没推进情绪 → 删

## Decision template

> 这个镜头想对观众做什么情绪？→ 选能表达它的运动 → 检查该运动是否也揭示新信息 → 若两者冲突，砍运动保信息。
