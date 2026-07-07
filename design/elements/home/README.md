# Home Element Asset Batch

## Direction

The H5 home screen must be assembled from reusable mini-game elements, not from a full-screen screenshot. The background is an empty environment layer; path stones, pedestals, dinosaurs, badges, title, music, and bottom navigation are independent PNG elements.

## Required Assets

| Asset ID | File | Size | Background | Notes |
| --- | --- | ---: | --- | --- |
| `bg.home.empty` | `backgrounds/home-empty.png` | 390 x 684 | Opaque PNG | Empty island environment only; no dinosaurs, labels, title, buttons, pedestals, or nav |
| `brand.logo` | `home-logo.png` | 350 x 145 | Transparent PNG | Wooden sign with text: `恐龙咚咚岛` |
| `decor.music-button` | `music-button.png` | 72 x 72 | Transparent PNG | Yellow-orange round button with white music note |
| `guide.home-text` | `home-guide-text.png` | 300 x 36 | Transparent PNG | Text: `选择一只恐龙，开始故事吧!` |
| `dino.xiaobao` | `dino-xiaobao.png` | 240 x 280 | Transparent PNG | Orange happy T-rex |
| `dino.adai` | `dino-adai.png` | 230 x 250 | Transparent PNG | Boyish triceratops-like dinosaur |
| `dino.gulu` | `dino-gulu.png` | 240 x 260 | Transparent PNG | Teal long-neck dinosaur |
| `badge.xiaobao` | `badge-xiaobao.png` | 140 x 54 | Transparent PNG | Orange stitched badge, text: `小暴` |
| `badge.adai` | `badge-adai.png` | 140 x 54 | Transparent PNG | Orange stitched badge, text: `阿呆` |
| `badge.gulu` | `badge-gulu.png` | 140 x 54 | Transparent PNG | Teal stitched badge, text: `咕噜` |
| `decor.path-stones` | `path-stones.png` | 160 x 120 | Transparent PNG | Independent stepping-stone path |
| `decor.pawprints` | `pawprints.png` | 120 x 80 | Transparent PNG | Colored paw prints |
| `home.pedestal.large` | `pedestal-large.png` | 170 x 64 | Transparent PNG | Main dinosaur platform |
| `home.pedestal.small` | `pedestal-small.png` | 150 x 58 | Transparent PNG | Lower dinosaur platforms |

## H5 Home Layout Reference

Design coordinate system: `390 x 844`.
Content area: `390 x 684`; bottom nav: `390 x 160`.

| Element | Slot |
| --- | --- |
| Empty background | `x=0 y=0 w=390 h=684` |
| Logo | `x=20 y=30 w=350 h=145` |
| Music button | `x=335 y=34 w=54 h=54` |
| Guide text | `x=45 y=198 w=300 h=36` |
| Path stones | `x=112 y=500 w=166 h=124` |
| Pawprints | `x=164 y=492 w=122 h=82` |
| Main pedestal | `x=102 y=388 w=186 h=70` |
| Left pedestal | `x=4 y=586 w=166 h=64` |
| Right pedestal | `x=226 y=596 w=160 h=62` |
| 小暴 character | `x=100 y=220 w=194 h=226` |
| 小暴 badge | `x=124 y=426 w=142 h=54` |
| 阿呆 character | `x=-8 y=438 w=186 h=202` |
| 阿呆 badge | `x=20 y=610 w=142 h=54` |
| 咕噜 character | `x=232 y=454 w=174 h=188` |
| 咕噜 badge | `x=232 y=620 w=142 h=54` |

## Acceptance

- Runtime code must use the mini-game element library and must not use full-screen reference images as implementation assets.
- Backgrounds must stay empty of gameplay/UI components.
- Pedestals and path stones are drawn as independent transparent PNG elements on top of the empty background.
- Browser QA preview can be regenerated from the composed H5 page, but preview files are evidence only.
