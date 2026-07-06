# Home Element Asset Batch

## Direction

The H5 home screen must be assembled from reusable elements, not from a full-screen screenshot. Use the runtime preview only as QA evidence.

## Required Assets

| Asset ID | File | Size | Background | Notes |
| --- | --- | ---: | --- | --- |
| `brand.logo` | `home-logo.png` | 350 x 145 | Transparent PNG | Wooden sign with exact text: `恐龙咚咚岛` |
| `decor.music-button` | `music-button.png` | 72 x 72 | Transparent PNG | Yellow-orange round button with white music note |
| `guide.home-text` | `home-guide-text.png` | 300 x 36 | Transparent PNG | Text: `选择一只恐龙，开始故事吧!` |
| `dino.xiaobao` | `dino-xiaobao.png` | 240 x 280 | Transparent PNG | Orange happy T-rex |
| `dino.adai` | `dino-adai.png` | 230 x 250 | Transparent PNG | Boyish triceratops-like dinosaur |
| `dino.gulu` | `dino-gulu.png` | 240 x 260 | Transparent PNG | Teal long-neck dinosaur |
| `badge.xiaobao` | `badge-xiaobao.png` | 140 x 54 | Transparent PNG | Orange stitched badge, text: `小暴` |
| `badge.adai` | `badge-adai.png` | 140 x 54 | Transparent PNG | Orange stitched badge, text: `阿呆` |
| `badge.gulu` | `badge-gulu.png` | 140 x 54 | Transparent PNG | Teal stitched badge, text: `咕噜` |
| `decor.pawprints` | `pawprints.png` | 120 x 80 | Transparent PNG | Colored paw prints |
| `decor.path-stones` | `path-stones.png` | 160 x 120 | Transparent PNG | Reserved; do not draw on H5 home while the clean background already includes the stone path |
| `home.pedestal.large` | `pedestal-large.png` | 170 x 64 | Transparent PNG | Reserved; do not draw on H5 home while the clean background already includes circular platforms |
| `home.pedestal.small` | `pedestal-small.png` | 150 x 58 | Transparent PNG | Reserved; do not draw on H5 home while the clean background already includes circular platforms |

## H5 Home Layout Reference

Design coordinate system: `390 x 844`.
Content area: `390 x 684`; bottom nav: `390 x 160`.

| Element | Slot |
| --- | --- |
| Logo | `x=20 y=30 w=350 h=145` |
| Music button | `x=335 y=34 w=54 h=54` |
| Guide text | `x=45 y=198 w=300 h=36` |
| 小暴 character | `x=112 y=245 w=170 h=188` |
| 小暴 badge | `x=124 y=430 w=142 h=54` |
| 阿呆 character | `x=0 y=422 w=178 h=193` |
| 阿呆 badge | `x=28 y=614 w=142 h=54` |
| 咕噜 character | `x=214 y=424 w=174 h=188` |
| 咕噜 badge | `x=228 y=614 w=142 h=54` |
| Pawprints | `x=150 y=486 w=120 h=80` |

## Acceptance

- Characters, badges, buttons, and title are standalone transparent PNGs.
- Runtime code must not use `home-runtime-preview.png`, `home-final-390.png`, or `/assets/components/` as implementation assets.
- Runtime code must not redraw separate pedestal patches on top of the background circles.
- Browser QA preview can be regenerated from the composed H5 page, but preview files are evidence only.
