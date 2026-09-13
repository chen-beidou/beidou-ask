# Detail layer (细节层)

<!-- RULE:DETAIL.BY_FUNCTION -->
Details make a frame believable — but only when they are visible, sourced, and story-serving. Detail requirements stay tied to shot function and shot size: this file says where detail comes from, what each size can carry, and how to convert an emotion word into something the model can render.

## Three rules

1. **Sourced.** Detail comes from the asset set (reference images, world bible), the scene facts, or the script. A supplied reference owns appearance; the prompt owns visible *state* — 磨损、汗、尘、湿发、血迹、褶皱. Never invent traits that fight a supplied reference.
2. **Visible at the shot size.** A detail the lens cannot see is not written. See the size table below.
3. **Story-serving first.** Prefer the detail that carries meaning: 磨损的扶手=时间, 汗=压力, 卡住的拉链=失控. Decoration that competes with the focal action is cut.

## Material and surface layer (材质与表面)

| Shot size | Can carry |
|---|---|
| 大特写 / 特写 | 皮肤纹理与血丝、汗与油光、唇部干裂、毛发成绺或打结、布纹经纬、金属划痕与缺口、水膜反光、苔痕、印子与压痕 |
| 中景 / 中近景 | 道具磨损与成色、手部行为、领口袖口状态、衣料褶皱与垂坠、装备接缝、旧疤与临时伤 |
| 全景 / 大全景 | 环境痕迹：水渍、车辙、脚印、烟灰、划痕、堆积的碎屑、天光在表面上的走向 |

Concrete beats abstract: 脏/旧/破 alone does not render — write 哪里脏、什么材质、怎么旧 (干裂起白边的泥渍 / 磨破绽线的肩头 / 断口发黄的骨头).

## Micro-performance anchors (微观表演锚点)

Emotion words are not renderable; muscle and surface anchors are. Convert before writing:

| Abstract | Write instead |
|---|---|
| 狠戾 | 眉心下压、下眼睑绷起、咬肌在脸颊顶出硬块、下颌线绷紧 |
| 害怕 | 鼻翼扩张、喉结滚动、颈侧筋线随呼吸跳动、额汗顺太阳穴流下 |
| 强忍 | 喉头一顿、后槽牙咬紧、鼻息加重、眼皮压下一线 |
| 震动 | 瞳孔先缩后放、眨眼停了一拍、嘴唇抿住、吸气变深 |

Pair each anchor with a **time shape**: where it starts, what triggers it, where it holds, where it lands (see the 起始→触发→停顿→落点 rule in `output-schema.md` and the channels table in `emotion-performance.md`). Frequency belongs here too when it matters: 睫毛连颤两下、指尖抖了三次、一跳一跳的青筋.

## Medium and air (介质层)

Visible air sells the render: 光柱里的浮尘、湿气的雾感、呼吸的白汽、水汽在冷表面的结露、雨幕的密度. Rules:

- A medium only shows where motivated light crosses it (a light beam, a lamp, an opening) — otherwise it is fog with no cause.
- Air can also carry trajectory: 动作带起的尘、爪风掀起的发、落地扬起的灰.
- Keep the medium state durable across cuts like any other state (湿气浓度、雨量、尘量).

## Prop form anchors (道具形态锚点)

For any prop that appears in more than one unit, fix three things: **形状** (大小与轮廓), **成色** (材质与新旧，断口/缺口/磨损色), **位置** (谁的哪只手、画面哪一侧、在场上的落点). Models deform props across generations more often than they deform faces; the three anchors are what keep 腿骨、碎石、藤蔓、钥匙 recognizable between units. Track them in `continuity-ledger.md`.

## Forbidden

- Invented appearance that conflicts with supplied references.
- Detail piles that bury the action or the dialogue.
- Micro detail in a wide shot where nothing can read it.
- Medium effects (雾、尘、白汽) with no motivated light behind them.
