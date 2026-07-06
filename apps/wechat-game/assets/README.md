# WeChat Mini Game Asset Guide

This asset pack follows the redesign direction for 恐龙咚咚岛.

- Backgrounds are complete clean environment images.
- Backgrounds must not include dinosaurs, eggs, buttons, icons, panels, labels, cards, or bottom navigation.
- Dinosaurs, eggs, buttons, panels, icons, labels, cards, and nav items are independent sprite images.
- All runtime asset paths are declared in `apps/wechat-game/src/assets/manifest.js`.

## Backgrounds

Located in `apps/wechat-game/assets/backgrounds`.

Each file is a full `390 x 684` scene background:

- `home-clean.png`
- `story-clean.png`
- `hatch-clean.png`
- `works-clean.png`
- `parent-clean.png`

## Bottom Navigation

Located in `apps/wechat-game/assets/nav`.

The fixed bottom navigation is assembled from independent files:

- `nav-bg.png`
- `nav-works.png`
- `nav-hatch.png`
- `nav-parent.png`
- `nav-label-works.png`
- `nav-label-hatch.png`
- `nav-label-parent.png`

## Independent Sprites

Located in `apps/wechat-game/assets/sprites`.

- `dinos`: independent dinosaur character sprites.
- `eggs`: hatching-stage sprites.
- `panels`: title signs, boards, cards, rows, and input panels.
- `buttons`: story choices, hatch, refresh, save, and permission buttons.
- `icons`: music, toggles, slider, and metadata icons.
- `labels`: chips, badges, ribbons, statuses, and metadata text labels.

## Review Previews

Runtime composition previews are under `design/extracted`:

- `home/home-runtime-preview.png`
- `story/story-runtime-preview.png`
- `hatch/hatch-runtime-preview.png`
- `works/works-runtime-preview.png`
- `parent/parent-runtime-preview.png`
- `nav/nav-preview.png`
- `backgrounds/backgrounds-preview.png`

## Replacement Rule

When replacing art, keep the same manifest ID and replace only the matching PNG. Do not bake a component into a background image.

Examples:

- Replace `icon.nav.hatch` by editing `assets/nav/nav-hatch.png`.
- Replace home background by editing `assets/backgrounds/home-clean.png`.
- Do not export a home background that contains dinosaurs or bottom navigation.