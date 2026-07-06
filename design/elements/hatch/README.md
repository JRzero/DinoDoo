# Hatch Suite Asset Batch

## Direction

Use `hatch-suite-v1.png` as the first visual target for the hatch screen asset batch.

This batch designs reusable hatch elements only. It is not a full screen composition and should not be treated as a screenshot slice source.

## Source Board

- `hatch-suite-v1.png`

## Required Assets

| Asset ID | Suggested File | Size | Background | Notes |
| --- | --- | ---: | --- | --- |
| `hatch.egg.idle` | `egg-idle.png` | 240 x 280 | Transparent PNG | Full cream egg with mint-green spots |
| `hatch.egg.cracking` | `egg-cracking.png` | 260 x 300 | Transparent PNG | Cracked egg with warm glow |
| `hatch.baby-dino` | `baby-dino.png` | 220 x 240 | Transparent PNG | Newly hatched small dinosaur |
| `hatch.egg.success` | `egg-success.png` | 260 x 300 | Transparent PNG | Egg shell and baby dinosaur composition |
| `panel.hatch.input` | `hatch-input-panel.png` | 320 x 160 | Transparent PNG | Cream input panel |
| `field.prompt` | `prompt-field.png` | 250 x 54 | Transparent PNG | Prompt input slot |
| `chip.blue` | `chip-blue.png` | 86 x 42 | Transparent PNG | Text: 蓝色 |
| `chip.sing` | `chip-sing.png` | 86 x 42 | Transparent PNG | Text: 会唱歌 |
| `chip.horn` | `chip-horn.png` | 86 x 42 | Transparent PNG | Text: 长角 |
| `chip.strawberry` | `chip-strawberry.png` | 86 x 42 | Transparent PNG | Text: 爱草莓 |
| `button.hatch.primary` | `button-start-hatch.png` | 180 x 58 | Transparent PNG | Text: 开始孵化 |
| `button.voice.small` | `button-voice.png` | 78 x 48 | Transparent PNG | Microphone icon |
| `button.image.small` | `button-image.png` | 78 x 48 | Transparent PNG | Image upload icon |
| `hatch.status.loading` | `status-loading.png` | 220 x 44 | Transparent PNG | Text: 孵化中... |
| `hatch.status.success` | `status-success.png` | 220 x 44 | Transparent PNG | Text: 孵化成功 |

## Hatch Layout Reference

Design coordinate system: `390 x 844`.

Content area: `390 x 684`.

| Element | Slot |
| --- | --- |
| Egg center | x=65 y=108 w=260 h=300 |
| Input panel | x=35 y=542 w=320 h=160 |
| Prompt field | x=70 y=560 w=250 h=46 |
| Chip: 蓝色 | x=52 y=575 w=86 h=42 |
| Chip: 会唱歌 | x=140 y=575 w=86 h=42 |
| Chip: 长角 | x=244 y=575 w=86 h=42 |
| Voice button | x=52 y=628 w=78 h=48 |
| Image button | x=260 y=628 w=78 h=48 |
| Primary hatch button | x=114 y=626 w=162 h=52 |

## States

| State | Requirement |
| --- | --- |
| idle | Egg is intact, input panel is empty, chips are optional prompts |
| recording | Voice button is active, status reads `录音中` |
| image-selected | Image button is active, status reads `已选择图片` |
| loading | Primary button is disabled, status reads `孵化中...`, egg uses cracking/glow state |
| success | Egg uses success/baby dinosaur state, status reads `孵化成功` |
| error | Keep panel visible and show a compact warning toast; do not hide user input |

## Text Rules

Must manually check these exact strings:

- 描述你想要的小恐龙...
- 蓝色
- 会唱歌
- 长角
- 爱草莓
- 开始孵化
- 录音中
- 已选择图片
- 孵化中...
- 孵化成功

Do not accept garbled, approximate, or visually similar Chinese characters.

## Acceptance

- Each element can be used as a standalone asset.
- No full-screen mobile screenshot, bottom navigation, logo, or background scenery is baked into this batch.
- Egg states, chips, buttons, and input panel remain visually separate.
- Same-family buttons use consistent size, baseline, lighting, bevel, and shadow.
- The hatch screen can be reconstructed from these elements without using a full screenshot.
- The style matches the selected direction: soft 3D, rounded, bright, tactile, child-friendly.
