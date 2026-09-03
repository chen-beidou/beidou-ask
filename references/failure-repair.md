# Failure diagnosis and local repair

Inspect evidence from the rendered Clip when available. Repair the **narrowest responsible layer** and keep unaffected story, assets, shots, and timing stable.

## Coded failure taxonomy

| 症状 | 窄层 | 定向修复 | 易发模型 |
|---|---|---|---|
| 台词读得整齐、无呼吸 | 台词·声音 | 加目标驱动的打断、重叠、听者策略变化 | H3 尤甚 |
| 情绪过大/演过 | 表演 | 减少泄漏通道；加主动自控 + 关系目标 | 均 |
| 情绪读不出来 | 表演·覆盖 | 加一个具体泄漏 + 一个注意到它的听者 | 均 |
| 口吃像模型故障 | 表演·声音 | 失败集中到一个触发词；绑嘴唇、吸气、重启 | Seedance/H3 |
| 30s 后半段重复 | 戏剧性 | 加中点信息/道具/空间/战术翻转 | 均 |
| 人物换边 / 位置漂移 | 空间·连续 | 重申轴线、屏幕侧、中立过场 | Seedance 多镜 |
| 道具换手 / 消失 | 资产·连续 | 锁归属、手、摆放、转移镜头 | 均 |
| 动作切后重复 | 动作·覆盖 | 后镜标为上一镜的延续；删重复起手 | Kling |
| 打击无力度 | 动作·声音 | 标接触点、力向量、位移、恢复、材质声 | Wan 3.0 已观察；其他模型按需试验 |
| 竖屏像裁剪 | 画幅 | 纵深/高度重构图；居中脸、手、触发物 | 均 |
| 对白塞不下 | 时序 | 延长某一镜头；获许才改词；或拆段 | 均 |
| 镜头运动堆叠 | 镜头·模型 | 砍到一镜一主运动 | Kling 尤甚 |
| 脸 / 义体位置崩 | 模型·外观 | 降为局部措辞 + 重申身份锚；不整段重画 | Wan/H3 |
| 打斗糊成一团 | 模型 | 一镜一完整动作单元 + 自底向上承力链 | Wan 3.0 |
| 旁白时嘴巴动 | 模型 | 对已验证模型加 `嘴巴自然闭合，无口型，无说话动作` | Wan 3.0 / H3；其他模型先标记实验性 |
| 开放式运动挂起 | 模型 | 给运动指定终点 | Kling |

## Repair output

Return the revised shots or Clip only, plus up to three short notes naming the fixed failure. Do not regenerate global style or unaffected Clips unless their contract must change.

After repair, recheck incoming state, outgoing state, timestamps, dialogue capacity, and aspect-ratio composition.
