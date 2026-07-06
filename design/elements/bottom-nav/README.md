# Bottom Navigation Asset Batch

## Direction

Use `bottom-nav-suite-v1.png` as the first visual target for the bottom navigation asset batch.

The bottom navigation is fixed as:

- 作品
- 孵化
- 家长

The center item is **孵化** and must use a hatching egg / cracked shell / baby dinosaur idea. Do not use a microphone for the bottom navigation.

## Source Board

- `bottom-nav-suite-v1.png`

## Required Assets

| Asset ID | Suggested File | Size | Background | Notes |
| --- | --- | ---: | --- | --- |
| `nav.background` | `nav-bg.png` | 390 x 160 | Opaque PNG | Cream base with three raised pads, no icons, no labels |
| `nav.icon.works` | `nav-works.png` | 120 x 100 | Transparent PNG | Green book/work icon with paw print |
| `nav.icon.hatch` | `nav-hatch.png` | 140 x 120 | Transparent PNG | Spotted hatching egg with small baby dinosaur hint |
| `nav.icon.parent` | `nav-parent.png` | 120 x 100 | Transparent PNG | Parent-child icon with pink heart |
| `nav.label.works` | `nav-label-works.png` | 110 x 48 | Transparent PNG | Text: 作品 |
| `nav.label.hatch` | `nav-label-hatch.png` | 110 x 48 | Transparent PNG | Text: 孵化 |
| `nav.label.parent` | `nav-label-parent.png` | 110 x 48 | Transparent PNG | Text: 家长 |

## States

| State | Requirement |
| --- | --- |
| normal | Soft cream pad, icon centered, label aligned to the same baseline |
| active | Selected pad is slightly lifted/brighter, icon reads a little stronger |
| pressed | Pad compresses subtly, shadow shortens |

## Layout Slots

Design coordinate system: `390 x 844`.

Bottom navigation slot: `x=0, y=684, w=390, h=160`.

| Item | Column | Pad Slot | Icon Slot | Label Slot |
| --- | ---: | --- | --- | --- |
| 作品 | 0-130 | x=24 y=12 w=106 h=96 | x=43 y=22 w=60 h=58 | x=37 y=108 w=88 h=38 |
| 孵化 | 130-260 | x=142 y=0 w=106 h=112 | x=152 y=8 w=86 h=96 | x=151 y=108 w=88 h=38 |
| 家长 | 260-390 | x=260 y=12 w=106 h=96 | x=295 y=22 w=68 h=58 | x=296 y=108 w=88 h=38 |

## Acceptance

- The complete nav bar should visually match the original design draft structure.
- No black background or accidental transparent gaps behind the cream base.
- The middle label must read `孵化`.
- All Chinese text must be manually checked.
- Icons must feel like one family: same lighting, thickness, material, and shadow style.
- Assets must remain reusable as separate PNGs.
