# beidou-ask

面向 AI 视频生成的电影化分镜 Skill。它把剧本、场景构思和现有美术资产整理为逐镜头、带时间戳、可直接投喂视频模型的提示词。

## 支持范围

- Seedance 2.x
- Wan 3.0
- MiniMax H3
- 15 秒、30 秒及按当前模型上限拆分的连续 Clip
- 16:9 横屏和 9:16 竖屏
- 对白、情绪、对峙、打斗、追逐和混合场景
- 逐字保留剧本台词
- 角色、道具、空间、情绪与跨集连续性
- 分镜结构自动校验

## 安装

下载仓库中的 `beidou-ask.zip`，将其作为 Skill 导入；也可以直接复制仓库内除 `README.md` 和压缩包以外的技能文件。

Skill 的主入口是 [`SKILL.md`](SKILL.md)。

## 仓库结构

```text
beidou-ask/
├── SKILL.md
├── CHANGELOG.md
├── agents/
│   └── openai.yaml
├── policies/
│   ├── canonical-rules.json
│   └── model-claims.json
├── references/
│   ├── seedance-adapter.md
│   ├── wan-3.0-adapter.md
│   ├── minimax-h3-adapter.md
│   └── ...
├── scripts/
│   └── validate-storyboard.mjs
└── beidou-ask.zip
```

## 校验分镜文件

安装 Node.js 后运行：

```text
node scripts/validate-storyboard.mjs <storyboard.md>
```

校验器会检查 Clip 结构、时间戳连续性、景别、机位或运镜、结尾状态、约束块和部分资产引用问题。

## 输出边界

本 Skill 只生成分镜和视频模型提示词，不生成人物或场景美术资产，不在未检视成片时宣称生成效果已经验证。
