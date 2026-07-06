# Home Suite Asset Batch

## Direction

Use `home-suite-v1.png` as the first visual target for the home screen asset batch.

This batch designs reusable elements only. It is not a full screen composition and should not be treated as a screenshot slice source.

## Source Board

- `home-suite-v1.png`

## Required Assets

| Asset ID | Suggested File | Size | Background | Notes |
| --- | --- | ---: | --- | --- |
| `brand.logo` | `home-logo.png` | 350 x 145 | Transparent PNG | Wooden sign with exact text: 恐龙咚咚岛 |
| `brand.title-plaque` | `wood-title-plaque.png` | 290 x 92 | Transparent PNG | Reusable blank wooden title plaque |
| `decor.music-button` | `music-button.png` | 72 x 72 | Transparent PNG | Yellow-orange round button with white music note |
| `decor.music-notes` | `music-notes.png` | 96 x 96 | Transparent PNG | Small colorful music-note decorations |
| `guide.home-text` | `home-guide-text.png` | 300 x 36 | Transparent PNG | Text: 选择一只恐龙，开始故事吧！ |
| `dino.xiaobao` | `dino-xiaobao.png` | 240 x 280 | Transparent PNG | Orange happy T-rex |
| `dino.huahua` | `dino-huahua.png` | 230 x 250 | Transparent PNG | Pink triceratops girl |
| `dino.gulu` | `dino-gulu.png` | 240 x 260 | Transparent PNG | Teal long-neck dinosaur |
| `dino.adai` | `dino-adai.png` | 230 x 250 | Transparent PNG | Boyish triceratops-like dinosaur |
| `badge.xiaobao` | `badge-xiaobao.png` | 140 x 54 | Transparent PNG | Orange stitched badge, text: 小暴 |
| `badge.huahua` | `badge-huahua.png` | 140 x 54 | Transparent PNG | Pink stitched badge, text: 花花 |
| `badge.gulu` | `badge-gulu.png` | 140 x 54 | Transparent PNG | Teal stitched badge, text: 咕噜 |
| `badge.adai` | `badge-adai.png` | 140 x 54 | Transparent PNG | Orange/green stitched badge, text: 阿呆 |
| `home.pedestal.large` | `pedestal-large.png` | 170 x 64 | Transparent PNG | Grass + stone platform for main dinosaur |
| `home.pedestal.small` | `pedestal-small.png` | 150 x 58 | Transparent PNG | Grass + stone platform for side dinosaurs |
| `decor.sun` | `sun-smile.png` | 96 x 96 | Transparent PNG | Smiling sun |
| `decor.pawprints` | `pawprints.png` | 120 x 80 | Transparent PNG | Colored paw prints |
| `decor.leaves` | `leaves.png` | 160 x 120 | Transparent PNG | Tropical leaves |
| `decor.flowers-rocks` | `flowers-rocks.png` | 180 x 120 | Transparent PNG | Flowers, rocks, grass clumps |
| `decor.path-stones` | `path-stones.png` | 160 x 120 | Transparent PNG | Rounded stepping stones |

## Home Layout Reference

Design coordinate system: `390 x 844`.

Content area: `390 x 684`.

| Element | Slot |
| --- | --- |
| Logo | x=20 y=30 w=350 h=145 |
| Music button | x=335 y=34 w=54 h=54 |
| Guide text | x=45 y=198 w=300 h=36 |
| 小暴 character | x=112 y=245 w=170 h=188 |
| 小暴 badge | x=124 y=430 w=142 h=54 |
| 花花 character | x=0 y=445 w=178 h=223 |
| 花花 badge | x=28 y=626 w=142 h=54 |
| 咕噜 character | x=214 y=445 w=174 h=222 |
| 咕噜 badge | x=228 y=626 w=142 h=54 |

## Character Rules

- Characters must be independent transparent PNGs, not baked into the background.
- All characters share one lighting direction: warm light from upper left.
- 阿呆 must feel boyish and distinct from 花花.
- 花花 should keep the pink triceratops girl identity.
- 咕噜 should remain teal and gentle.
- 小暴 should remain the primary orange happy T-rex.

## Text Rules

Must manually check these exact strings:

- 恐龙咚咚岛
- 选择一只恐龙，开始故事吧！
- 小暴
- 花花
- 咕噜
- 阿呆

Do not accept garbled, approximate, or visually similar Chinese characters.

## Acceptance

- Each element can be used as a standalone asset.
- No background scenery is baked into character, badge, or button assets.
- Badge sizes and text baselines are consistent.
- The home screen can be reconstructed from these elements without using a full screenshot.
- The style matches the original draft: soft 3D, rounded, bright, tactile, child-friendly.
