# Parent Element Asset Batch

## Direction

The H5 parent/settings page must be assembled from reusable elements, not from a full-screen screenshot. Runtime previews are QA evidence only.

## Required Assets

| Asset ID | File | Size | Background | Notes |
| --- | --- | ---: | --- | --- |
| `parent.title` | `parent-title.png` | 290 x 92 | Transparent PNG | Wooden plaque, text: `????` |
| `parent.settings-panel` | `parent-board.png` | 314 x 468 | Transparent PNG | Wooden frame with cream settings surface |
| `parent.row.sound` | `row-sound.png` | 280 x 72 | Transparent PNG | Text: `??` |
| `parent.row.image` | `row-image.png` | 280 x 72 | Transparent PNG | Text: `??` |
| `parent.row.music` | `row-music.png` | 280 x 72 | Transparent PNG | Text: `????` |
| `control.toggle.on` | `toggle-on.png` | 86 x 44 | Transparent PNG | Green on switch |
| `control.toggle.off` | `toggle-off.png` | 86 x 44 | Transparent PNG | Cream/gray off switch |
| `control.slider` | `slider.png` | 190 x 36 | Transparent PNG | Slider bar with minus and plus marks |
| `parent.time-label` | `time-label-30.png` | 70 x 40 | Transparent PNG | Text: `30??` |
| `chip.theme.island` | `chip-island.png` | 58 x 34 | Transparent PNG | Text: `??` |
| `chip.theme.forest` | `chip-forest.png` | 58 x 34 | Transparent PNG | Text: `??` |
| `chip.theme.snow` | `chip-snow.png` | 58 x 34 | Transparent PNG | Text: `??` |
| `chip.theme.desert` | `chip-desert.png` | 58 x 34 | Transparent PNG | Text: `??` |
| `button.permission.voice` | `button-voice-permission.png` | 140 x 50 | Transparent PNG | Text: `????` |
| `button.permission.image` | `button-image-permission.png` | 140 x 50 | Transparent PNG | Text: `????` |
| `button.parent.save` | `button-save-settings.png` | 225 x 58 | Transparent PNG | Text: `????` |
| `toast.saved` | `toast-saved.png` | 160 x 44 | Transparent PNG | Text: `???` |

## H5 Parent Layout Reference

Design coordinate system: `390 x 844`.
Content area: `390 x 684`; bottom nav: `390 x 160`.

| Element | Slot |
| --- | --- |
| Title plaque | `x=50 y=128 w=290 h=92` |
| Settings panel | `x=38 y=216 w=314 h=468` |
| Row 1 sound | `x=55 y=244 w=280 h=72` |
| Row 2 image | `x=55 y=324 w=280 h=72` |
| Row 3 music | `x=55 y=404 w=280 h=72` |
| Toggle 1 | `x=248 y=260 w=72 h=40` |
| Toggle 2 | `x=248 y=340 w=72 h=40` |
| Toggle 3 | `x=248 y=420 w=72 h=40` |
| Daily slider | `x=68 y=484 w=190 h=36` |
| Daily time label | `x=268 y=482 w=70 h=40` |
| Theme chips | `x=70/132/194/256 y=522 w=58 h=34` |
| Permission buttons | `x=52/198 y=558 w=140 h=50` |
| Save button | `x=82 y=616 w=225 h=58` |

## Acceptance

- Each element can be used as a standalone asset.
- No full-screen mobile screenshot, bottom navigation, logo, or background scenery is baked into this batch.
- The settings panel is separate from rows, controls, chips, buttons, and toasts.
- Rows share one size and text baseline.
- The lower control area must keep four readable rows: daily time, theme chips, permission buttons, save button.
- Toggle controls share one size and clearly show on/off states.
- The parent page can be reconstructed from these elements without using a full screenshot.
