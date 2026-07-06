# Bottom Navigation Runtime Assets

These are standalone runtime assets for the fixed bottom navigation.

They are generated as independent elements, not cropped from a full screen screenshot.

## Assets

| File | Size | Usage |
| --- | ---: | --- |
| `nav-bg.png` | 390 x 160 | Opaque cream navigation base |
| `nav-works.png` | 120 x 100 | Works icon |
| `nav-hatch.png` | 140 x 120 | Hatch icon |
| `nav-parent.png` | 120 x 100 | Parent icon |
| `nav-label-works.png` | 110 x 48 | Label: 作品 |
| `nav-label-hatch.png` | 110 x 48 | Label: 孵化 |
| `nav-label-parent.png` | 110 x 48 | Label: 家长 |

## Preview

Review composition:

- `design/extracted/nav/nav-preview.png`

## Layout Slots

Coordinate system: `390 x 160`.

| Element | Slot |
| --- | --- |
| `nav-bg.png` | x=0 y=0 w=390 h=160 |
| `nav-works.png` | x=43 y=18 w=60 h=58 |
| `nav-hatch.png` | x=152 y=2 w=86 h=96 |
| `nav-parent.png` | x=295 y=18 w=68 h=58 |
| `nav-label-works.png` | x=37 y=108 w=88 h=38 |
| `nav-label-hatch.png` | x=151 y=108 w=88 h=38 |
| `nav-label-parent.png` | x=296 y=108 w=88 h=38 |

## Notes

- Labels are deterministic rendered PNGs so Chinese text stays stable.
- Icons are transparent PNGs generated independently from the design board.
- Keep the bottom navigation fixed across all pages.
