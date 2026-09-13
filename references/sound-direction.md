# Sound direction

Sound is causal action, not decoration.

## Three sound layers (三层声音)

Write all three in every Clip. A prompt that names only dialogue leaves the soundscape empty, and the model fills silence with music — the cheapest way to make a scene feel generic.

| Layer | Contains | Example |
|---|---|---|
| 环境底噪（持续层） | room tone and its character: 洞腔低频回响、雨幕密度、室内空调声、远处可命名的环境声 | 洞里滴水声与低频回响、洞外雨声隔着岩壁闷响 |
| 材质动作声 | the sound the material makes: 藤蔓纤维绷紧的吱响、爪刮石、布料擦岩壁、骨屑落湿石的黏响 | 布鞋碾过碎石、金属"咔"、皮革拉伸 |
| 身体声 | the body as audible proof of state: 呼吸粗细、吞咽、鼻息、喉音、颤抖时的齿音 | 吞咽声、粗重鼻息、吸气发颤 |

## Dry and wet (干湿对比)

Reverb is information. 机械音、系统音、内心提示音用无混响的干声（贴耳、无空间感）; 现实动作声用带空间回响的湿声. The contrast is what makes a system voice feel non-human without saying so.

## Labeling sounds that could be mistaken for music

低频嗡鸣、脉冲、心跳式节奏 must be written as sound with a cause and explicitly marked 非音乐/无配乐, or the model may render score. Same for any sustained tone that outlives its cause.

## Voice identity anchors (声音锚点)

<!-- RULE:VOICE.IDENTITY -->
Give every speaking character one voice anchor, fixed once in the asset card, three to five words: 音色（低沉/沙哑/清亮）、说话底速（偏慢/偏快）、咬字与口音习惯、气息（底气足/带气声）、口头习惯（尾音压着、断句短、爱重复）. A dialogue line then writes only the **relative change** against that baseline — `（压低音量，比平时更慢）` — and never re-describes the voice itself. The anchor is durable state: it survives cuts and changes only with a shown cause (喊过、受伤、力竭、刚哭过). Without it the same character's voice drifts between independently generated Clips, and a voice actor has no target to match.

## Sound landing at the end of a unit (段末收音)

<!-- RULE:SOUND.LANDING -->
State how the unit's sound ends, in the last shot or in the constraint block: 硬切静默 / 渐弱收尾 / 留一口气（气息未平）/ 素材声自然收. An unstated ending is a hole, and the hole is usually filled with a closing musical swell — the most common source of unwanted score in a no-music project. If the unit ends on silence, name which silence it is and what sound is still running underneath it.

## Track separately

- dialogue wording and speaker
- breath onset/failure/recovery
- overlap start and end
- silence type and duration
- body sound: swallow, fabric, footstep, impact
- prop sound: paper, glass, weapon, door, chair
- ambience and perspective
- music presence and transition, only when requested

## Silence types

Name the cause:

- searching for a word
- suppressing emotion
- listening for danger
- deciding whether to lie
- waiting for the other person to withdraw
- breath physically unavailable

Avoid an unexplained `pause`.

<!-- RULE:DIALOGUE.CONTINUITY -->
## Overlap

State who interrupts and where:

```text
角色B在角色A最后一个词的尾音尚未结束时轻声抢入，重叠约0.3秒。
```

Use overlap for pressure, rescue, excitement, denial, or intimacy. Do not overlap every exchange.


### Dialogue across cuts

A cut does not imply an audio restart. If one spoken line continues over a reaction or insert, keep a single word sequence and state where the visual cut occurs relative to the continuing audio. Across independently generated Clips, use a deliberate audio handoff/edit plan or keep the line inside one Clip; never duplicate the same words on both sides of a boundary.

## Speech failure

Tie failure to body and meaning: mouth forms before sound, inhale fails, throat closes, swallow replaces a word, the line restarts with a substitute, or an ordinary line becomes suddenly complete because the relationship goal is easier to serve than the self-confession.

## Perspective

Sound changes with distance and framing. A close-up may reveal breath and fabric; a wide shot restores room tone and spatial echoes. Do not make every effect equally loud.

## Default mix

Preserve intelligible dialogue, breath, body, prop, and relevant ambience. No music and no subtitles unless the user asks.
