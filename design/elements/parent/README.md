# Parent Suite Asset Batch

## Direction

Use `parent-suite-v1.png` as the first visual target for the parent/settings page asset batch.

This batch designs reusable parent page elements only. It is not a full screen composition and should not be treated as a screenshot slice source.

## Source Board

- `parent-suite-v1.png`

## Required Assets

| Asset ID | Suggested File | Size | Background | Notes |
| --- | --- | ---: | --- | --- |
| `parent.title` | `parent-title.png` | 290 x 92 | Transparent PNG | Wooden plaque, text: 家长树屋 |
| `parent.title.blank` | `parent-title-blank.png` | 290 x 92 | Transparent PNG | Same wooden plaque without text |
| `parent.settings-panel` | `parent-settings-panel.png` | 314 x 468 | Transparent PNG | Wooden frame with cream settings surface |
| `parent.setting-row` | `setting-row.png` | 280 x 72 | Transparent PNG | Reusable row with icon slot and control slot |
| `parent.row.sound` | `row-sound.png` | 280 x 72 | Transparent PNG | Text: 声音 |
| `parent.row.image` | `row-image.png` | 280 x 72 | Transparent PNG | Text: 图片 |
| `parent.row.music` | `row-music.png` | 280 x 72 | Transparent PNG | Text: 背景音乐 |
| `control.toggle.on` | `toggle-on.png` | 86 x 44 | Transparent PNG | Green on switch |
| `control.toggle.off` | `toggle-off.png` | 86 x 44 | Transparent PNG | Cream/gray off switch |
| `control.slider` | `slider.png` | 190 x 36 | Transparent PNG | Slider bar with knob |
| `control.stepper.minus` | `stepper-minus.png` | 36 x 36 | Transparent PNG | Minus control |
| `control.stepper.plus` | `stepper-plus.png` | 36 x 36 | Transparent PNG | Plus control |
| `parent.time-label` | `time-label-30.png` | 70 x 40 | Transparent PNG | Text: 30分钟 |
| `chip.theme.island` | `chip-island.png` | 58 x 34 | Transparent PNG | Text: 岛屿 |
| `chip.theme.forest` | `chip-forest.png` | 58 x 34 | Transparent PNG | Text: 森林 |
| `chip.theme.snow` | `chip-snow.png` | 58 x 34 | Transparent PNG | Text: 雪地 |
| `chip.theme.desert` | `chip-desert.png` | 58 x 34 | Transparent PNG | Text: 沙漠 |
| `button.parent.save` | `button-save-settings.png` | 225 x 58 | Transparent PNG | Text: 保存设置 |
| `button.permission.voice` | `button-voice-permission.png` | 150 x 56 | Transparent PNG | Text: 语音权限 |
| `button.permission.image` | `button-image-permission.png` | 150 x 56 | Transparent PNG | Text: 图片权限 |
| `icon.parent.clock` | `icon-clock.png` | 54 x 54 | Transparent PNG | Clock icon |
| `icon.parent.microphone` | `icon-microphone.png` | 54 x 54 | Transparent PNG | Microphone icon |
| `icon.parent.image` | `icon-image.png` | 54 x 54 | Transparent PNG | Image icon |
| `icon.parent.music` | `icon-music.png` | 54 x 54 | Transparent PNG | Music note icon |
| `icon.parent.palette` | `icon-palette.png` | 54 x 54 | Transparent PNG | Theme palette icon |
| `icon.parent.shield` | `icon-shield.png` | 54 x 54 | Transparent PNG | Parent/safety icon |
| `toast.saved` | `toast-saved.png` | 160 x 44 | Transparent PNG | Text: 已保存 |
| `toast.permission` | `toast-permission.png` | 180 x 44 | Transparent PNG | Text: 需要授权 |

## Parent Layout Reference

Design coordinate system: `390 x 844`.

Content area: `390 x 684`.

| Element | Slot |
| --- | --- |
| Title plaque | x=50 y=128 w=290 h=92 |
| Settings panel | x=38 y=216 w=314 h=468 |
| Row 1 | x=55 y=250 w=280 h=72 |
| Row 2 | x=55 y=330 w=280 h=72 |
| Row 3 | x=55 y=410 w=280 h=72 |
| Theme chips | x=70 y=505 w=250 h=34 |
| Save button | x=82 y=600 w=225 h=58 |

## States

| State | Requirement |
| --- | --- |
| toggle-on | Green track, knob on right, readable active state |
| toggle-off | Cream/gray track, knob on left, lower contrast |
| slider-normal | Knob centered on track, plus/minus controls visible |
| slider-dragging | Knob raised slightly, shadow stronger |
| chip-selected | Green chip with cream text |
| chip-normal | Cream chip with brown text |
| save-normal | Green primary button, full contrast |
| save-pressed | Button compresses subtly, shadow shortens |
| save-disabled | Lower contrast but text remains readable |
| permission-needed | Show warning toast `需要授权` beside the related control |

## Text Rules

Must manually check these exact strings:

- 家长树屋
- 声音
- 图片
- 背景音乐
- 30分钟
- 岛屿
- 森林
- 雪地
- 沙漠
- 保存设置
- 语音权限
- 图片权限
- 已保存
- 需要授权

Do not accept garbled, approximate, or visually similar Chinese characters.

## Acceptance

- Each element can be used as a standalone asset.
- No full-screen mobile screenshot, bottom navigation, logo, or background scenery is baked into this batch.
- The settings panel is separate from rows, controls, chips, buttons, and toasts.
- Rows share one size and text baseline.
- Toggle controls share one size and clearly show on/off states.
- Theme chips share one size and selected/unselected states.
- The parent page can be reconstructed from these elements without using a full screenshot.
- The style matches the selected direction: soft 3D, rounded, bright, tactile, child-friendly.
