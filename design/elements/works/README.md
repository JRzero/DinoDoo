# Works Element Asset Batch

## Direction

The H5 works page must be assembled from reusable elements, not from a full-screen screenshot. Runtime previews are QA evidence only.

## Required Assets

| Asset ID | File | Size | Background | Notes |
| --- | --- | ---: | --- | --- |
| `works.title` | `works-title.png` | 290 x 92 | Transparent PNG | Wooden plaque, text: `????` |
| `works.list-panel` | `works-board.png` | 310 x 468 | Transparent PNG | Wooden frame with cream surface, no embedded cards |
| `works.card.featured` | `work-card-featured.png` | 280 x 220 | Transparent PNG | Large work card with image slot and info area |
| `works.card.normal` | `work-card-normal.png` | 135 x 190 | Transparent PNG | Small work card with image slot and info area |
| `works.ribbon.featured` | `ribbon-featured.png` | 120 x 42 | Transparent PNG | Text: `????` |
| `button.works.refresh` | `button-refresh-works.png` | 138 x 48 | Transparent PNG | Text: `????` |
| `works.empty` | `works-empty-panel.png` | 250 x 150 | Transparent PNG | Empty state panel, text: `?????` |
| `meta.date` | `meta-date.png` | 80 x 32 | Transparent PNG | Date text style, sample: `2024.05.20` |
| `meta.paw` | `meta-paw.png` | 42 x 42 | Transparent PNG | Paw-print marker |
| `meta.crown` | `meta-crown.png` | 36 x 36 | Transparent PNG | Crown marker |
| `meta.heart` | `meta-heart.png` | 36 x 36 | Transparent PNG | Heart marker |
| `meta.leaf` | `meta-leaf.png` | 36 x 36 | Transparent PNG | Leaf marker |

## H5 Works Layout Reference

Design coordinate system: `390 x 844`.
Content area: `390 x 684`; bottom nav: `390 x 160`.

| Element | Slot |
| --- | --- |
| Title plaque | `x=50 y=128 w=290 h=92` |
| Works list panel | `x=40 y=216 w=310 h=468` |
| Featured card | `x=55 y=246 w=280 h=220` |
| Featured ribbon | `x=62 y=250 w=120 h=42` |
| Featured dinosaur thumbnail | `x=142 y=272 w=112 h=116` |
| Featured text | starts around `x=82 y=402` |
| Normal card left | `x=55 y=486 w=135 h=190` |
| Normal card right | `x=200 y=486 w=135 h=190` |
| Normal dinosaur thumbnail | card-relative `x=44 y=18 w=58 h=70` |
| Normal text | card-relative starts around `x=14 y=128` |
| Refresh button | `x=126 y=636 w=138 h=48` |
| Empty state panel | `x=70 y=330 w=250 h=150` |

## States

| State | Requirement |
| --- | --- |
| populated | Featured card first, normal cards below, dinosaur thumbnails visible, refresh button available |
| empty | Empty state panel visible, no card placeholders |
| refresh | Refresh button is a real HTML hotspot above the PNG asset |

## Acceptance

- Each visible card element can be used as a standalone asset.
- No full-screen mobile screenshot, bottom navigation, logo, or background scenery is baked into this batch.
- The list panel is separate from cards, ribbons, metadata, thumbnails, and refresh button.
- Text and metadata must not overlap the image slots or each other.
- The works page can be reconstructed from these elements without using a full screenshot.
