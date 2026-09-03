# Camera vocabulary (镜头运动语义表)

<!-- RULE:DIRECTING.NO_ONE_TO_ONE_METAPHOR -->
Camera movement is motivated behavior, not decoration. Every move must answer *what it says about the character or scene*. Pick a movement the way you pick a line of dialogue.

<!-- RULE:CAMERA.INTENT -->
## The rule: one dominant camera intention

- Choose **one dominant camera intention** per shot. For most short AI-video shots, that intention is best expressed by one clear move or a locked camera.
- A **composite move is allowed** when the phases form one causal camera sentence: `起始构图 → 画内触发 → 路径阶段A → 遮挡/人物/焦点接力 → 路径阶段B → 终点构图`. The phases must serve the same viewing task.
- Do **not** stack unrelated moves (`pan + push in + crane`) merely to sound cinematic. If removing a phase changes nothing the audience learns or feels, remove it.
- A **static shot is a valid choice**. Stillness can read as control, paralysis, observation, ritual, distance, or simply clarity; infer meaning from the scene rather than assigning it automatically. Do not move the camera just to prove you know how.

## Motion → meaning table

| Motion | Semantics | Use for |
|---|---|---|
| 手持 handheld | 混乱 / 生猛 / 临场 / 偷窥 / 幽闭 | 打戏、追逐、濒死、急促紧张、纪实感 |
| 缓推 dolly in | 缩小观看距离、提高细节权重 | 当可见信息或表演需要逐步占据注意力 |
| 拉远 pull back | 抽离 / 孤立 / 揭示全境 | 从特写抽出人物渺小，或揭示身后的事物 |
| 平移 track | 跟随、并置、揭示 | 跟人走、沿墙暴露多重关系、并置对照 |
| 稳定器 steadicam | 漂浮 / 梦境 / 如入其境 | 跟人上楼、"边走边谈"、持续但不晃的流动 |
| 摇臂/上升 crane up | 改变高度关系并扩展空间信息 | 揭示环境、重排人物与空间、从局部过渡到整体 |
| 急推 snap push | 冲击 / 眩晕 / 逼近 | 转折瞬间、记忆闪回、逼近危险 |
| 甩摇 whip pan | 拒绝 / 闪避 / 骤转 | 角色猛然转头不看、快速转移注意力 |
| 升降/俯仰 tilt | 重排垂直信息、视线与尺度 | 跟随高度变化、揭示上下空间或改变主体/环境关系 |
| 静态 locked-off | 固定观察关系，放大画内变化 | 控制、僵持、观察、无力或仪式感均可能；由画内行为决定 |
| 推拉变焦 dolly zoom | 眩晕 / 失重 / 孤立 | 角色瞬间失衡、四周压过来（Jaws 式，几秒内） |
| 焦点切换 rack focus | 引导视线/转移注意力 | 前景与后景的意义交替、暗示注意点 | 

## Micro-adjustments (optional)

- 轻微手持颤抖 handheld tremble — 加真实感，勿在静物/凝视镜头用
- 微焦点带过 gentle rack focus — 把视线从一个细节转到另一个
- 缓慢俯仰 slow tilt — 表现高度/威压变化

## Forbidden

- `dynamic camera`、`cinematic`、`beautiful movement` 等抽象词 — 模型不渲染，用具体方向词
- 无共同观看任务的多段运镜堆叠；复合运镜必须是一条有触发、有接力、有终点的摄影机句子
- 无动机运镜：镜头动了但没揭示新信息、没推进情绪 → 删

## Decision template

> 这个镜头的观看任务是什么？→ 先确定观众必须看见的动作/信息/关系 → 再选择能完成该任务的机位与运动 → 若运动只制造风格而妨碍可读性，删掉或简化。
