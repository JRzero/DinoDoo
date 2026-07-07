# Bottom Navigation Asset Batch

## Direction

The bottom navigation is a fixed H5 element group assembled from one base image, three independent icon PNGs, and three independent label PNGs.

Fixed order:

- 作品
- 孵化
- 家长

The center item is **孵化** and must use a hatching egg / cracked shell / baby dinosaur idea. Do not use a microphone for the bottom navigation.

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

## Layout Slots

Design coordinate system: `390 x 844`.
Bottom navigation slot: `x=0, y=684, w=390, h=160`.

| Item | Column | Icon Slot | Label Slot |
| --- | ---: | --- | --- |
| 作品 | 0-130 | `x=52 y=49 w=60 h=58` | `x=38 y=108 w=88 h=38` |
| 孵化 | 130-260 | `x=152 y=18 w=86 h=96` | `x=150 y=108 w=88 h=38` |
| 家长 | 260-390 | `x=274 y=49 w=68 h=58` | `x=264 y=108 w=88 h=38` |

## Alignment Notes

- Icon slots are tuned by visible alpha bounds, not by full PNG canvas size.
- Labels share the same `y=108` label band so text sits below the raised pads without touching the bottom edge.
- The right label intentionally starts at `x=264` because the label PNG has transparent side padding; this centers the visible `家长` text under the right pad.

## Acceptance

- The complete nav bar should visually match the original design draft structure.
- Icons sit inside the raised pads rather than floating above them.
- Labels sit in the bottom label band and align to their icon/pad centers.
- No black background or accidental transparent gaps behind the cream base.
- All Chinese text must be manually checked.
- Assets must remain reusable as separate PNGs.
