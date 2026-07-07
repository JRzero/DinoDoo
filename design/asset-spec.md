# DinoDoo Element Asset Specification

## Direction

The product is assembled from a mini-game style element library. Runtime screens must be composed from an empty environment background plus independent transparent PNG sprites.

Core rules:

- Design independent elements first, then compose them in H5 and WeChat game runtimes.
- Backgrounds are environment only. They must not include characters, eggs, icons, buttons, text panels, cards, bottom navigation, path stones, or pedestal/platform sprites.
- Characters, buttons, icons, panels, labels, cards, decorations, path stones, and pedestals are exported as independent transparent PNG assets.
- Design coordinate baseline: `390 x 844`; content area: `390 x 684`; bottom navigation: `390 x 160`.
- Visual style: soft 3D toy texture, tropical island, cream UI panels, wooden title boards, orange/green/teal accents.

## Runtime Backgrounds

| ID | File | Size | Requirement |
| --- | --- | ---: | --- |
| `bg.home` | `home-empty.png` | 390 x 684 | Empty island grassland environment for the home composition |
| `bg.story` | `story-empty.png` | 390 x 684 | Empty story path or jungle entrance environment |
| `bg.hatch` | `hatch-empty.png` | 390 x 684 | Empty hatch forest clearing environment |
| `bg.works` | `works-empty.png` | 390 x 684 | Empty works hut exterior environment |
| `bg.parent` | `parent-empty.png` | 390 x 684 | Empty parent treehouse exterior environment |

Legacy `*-clean.png` files can remain as reference material, but H5 runtime composition must use `*-empty.png`.

## Brand And Decorations

| ID | Suggested Size | Content |
| --- | ---: | --- |
| `brand.logo` | 350 x 145 | Wooden logo board, text `恐龙咚咚岛` |
| `decor.music-button` | 72 x 72 | Round yellow music button |
| `decor.pawprints` | 120 x 80 | Colored paw prints |
| `decor.path-stones` | 160 x 120 | Transparent stepping-stone path |
| `home.pedestal.large` | 170 x 64 | Main dinosaur platform |
| `home.pedestal.small` | 150 x 58 | Lower dinosaur platforms |

## Characters

| Character | Export | Notes |
| --- | ---: | --- |
| `小暴` | 240 x 280 | Orange happy T-rex |
| `阿呆` | 230 x 250 | Boyish triceratops-like dinosaur |
| `咕噜` | 240 x 260 | Teal long-neck dinosaur |

Every character keeps a transparent PNG body and a matching independent name badge.

## Bottom Navigation

Fixed tabs: `作品` / `孵化` / `家长`.

| Element | Size | Content |
| --- | ---: | --- |
| `nav.background` | 390 x 160 | Cream base with three raised pads, no icons or labels baked in |
| `nav.icon.works` | 120 x 100 | Green work/book icon |
| `nav.icon.hatch` | 140 x 120 | Hatching egg icon; no microphone |
| `nav.icon.parent` | 120 x 100 | Parent-child icon with heart |
| `nav.label.works` | 110 x 48 | `作品` |
| `nav.label.hatch` | 110 x 48 | `孵化` |
| `nav.label.parent` | 110 x 48 | `家长` |

Current H5 nav slots:

| Element | Slot |
| --- | --- |
| `nav.background` | `x=0 y=684 w=390 h=160` |
| `nav.icon.works` | `x=52 y=733 w=60 h=58` |
| `nav.icon.hatch` | `x=152 y=702 w=86 h=96` |
| `nav.icon.parent` | `x=274 y=733 w=68 h=58` |
| `nav.label.works` | `x=38 y=792 w=88 h=38` |
| `nav.label.hatch` | `x=150 y=792 w=88 h=38` |
| `nav.label.parent` | `x=264 y=792 w=88 h=38` |

## Acceptance

- Any single element must look complete on a transparent background.
- Any runtime background must not contain UI components or characters.
- The H5 source must not use full-screen screenshots, runtime preview PNGs, or `/assets/components/` as implementation assets.
- All interactive controls must keep real HTML hit targets above the visual image layers.
- The browser QA screenshots for all five routes must match the runtime preview evidence at the configured tolerance.
