# Works Suite Asset Batch

## Direction

Use `works-suite-v1.png` as the first visual target for the works/gallery page asset batch.

This batch designs reusable works page elements only. It is not a full screen composition and should not be treated as a screenshot slice source.

## Source Board

- `works-suite-v1.png`

## Required Assets

| Asset ID | Suggested File | Size | Background | Notes |
| --- | --- | ---: | --- | --- |
| `works.title` | `works-title.png` | 290 x 92 | Transparent PNG | Wooden plaque, text: 作品小屋 |
| `works.title.blank` | `works-title-blank.png` | 290 x 92 | Transparent PNG | Same wooden plaque without text |
| `works.list-panel` | `works-list-panel.png` | 310 x 468 | Transparent PNG | Wooden frame with cream surface, no embedded cards |
| `works.card.featured` | `work-card-featured.png` | 280 x 220 | Transparent PNG | Large work card |
| `works.card.normal` | `work-card-normal.png` | 135 x 190 | Transparent PNG | Small work card |
| `works.image-frame.large` | `work-image-frame-large.png` | 250 x 130 | Transparent PNG | Empty rounded image slot |
| `works.image-frame.small` | `work-image-frame-small.png` | 118 x 86 | Transparent PNG | Empty rounded image slot |
| `works.ribbon.featured` | `ribbon-featured.png` | 120 x 42 | Transparent PNG | Text: 精选作品 |
| `works.ribbon.new` | `ribbon-new.png` | 120 x 42 | Transparent PNG | Text: 新孵化 |
| `button.works.refresh` | `button-refresh-works.png` | 138 x 48 | Transparent PNG | Text: 刷新作品 |
| `works.empty` | `works-empty-panel.png` | 250 x 150 | Transparent PNG | Text: 还没有作品 |
| `meta.date` | `meta-date.png` | 80 x 32 | Transparent PNG | Date text style, sample: 2024.05.20 |
| `meta.paw` | `meta-paw.png` | 42 x 42 | Transparent PNG | Paw-print marker |
| `meta.crown` | `meta-crown.png` | 36 x 36 | Transparent PNG | Crown marker |
| `meta.heart` | `meta-heart.png` | 36 x 36 | Transparent PNG | Heart marker |
| `meta.leaf` | `meta-leaf.png` | 36 x 36 | Transparent PNG | Leaf marker |

## Works Layout Reference

Design coordinate system: `390 x 844`.

Content area: `390 x 684`.

| Element | Slot |
| --- | --- |
| Title plaque | x=50 y=128 w=290 h=92 |
| Works list panel | x=40 y=216 w=310 h=468 |
| Featured card | x=55 y=246 w=280 h=220 |
| Featured ribbon | x=62 y=250 w=120 h=42 |
| Normal card left | x=55 y=486 w=135 h=190 |
| Normal card right | x=200 y=486 w=135 h=190 |
| Refresh button | x=126 y=636 w=138 h=48 |
| Empty state panel | x=70 y=330 w=250 h=150 |

## States

| State | Requirement |
| --- | --- |
| loading | List panel visible, cards replaced with cream skeleton placeholders |
| populated | Featured card first, normal cards below, refresh button available |
| empty | Empty state panel visible, no card placeholders |
| pressed | Refresh button compresses subtly, shadow shortens |
| disabled | Refresh button becomes lower contrast, text remains readable |

## Text Rules

Must manually check these exact strings:

- 作品小屋
- 精选作品
- 新孵化
- 刷新作品
- 还没有作品
- 小暴
- 花花
- 咕噜
- 2024.05.20

Do not accept garbled, approximate, or visually similar Chinese characters.

## Acceptance

- Each element can be used as a standalone asset.
- No full-screen mobile screenshot, bottom navigation, logo, or background scenery is baked into this batch.
- The list panel is separate from cards, ribbons, and metadata.
- Featured and normal cards use consistent corner radius, paper color, shadow, and text baseline.
- Ribbons share one size and alignment style.
- The works page can be reconstructed from these elements without using a full screenshot.
- The style matches the selected direction: soft 3D, rounded, bright, tactile, child-friendly.
