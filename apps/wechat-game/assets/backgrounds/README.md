# Clean Background Assets

These backgrounds are runtime scene backgrounds for the WeChat mini game.

Every file is a complete opaque `390 x 684` scene. They must stay empty of gameplay/UI components.

## Files

| File | Scene | Requirement |
| --- | --- | --- |
| `home-clean.png` | Home | Island grassland with clear space for three character sprites |
| `story-clean.png` | Story | Story path or jungle entrance with clear space for character and dialogue overlays |
| `hatch-clean.png` | Hatch | Warm hatch clearing with clear space for egg and input panel overlays |
| `works-clean.png` | Works | Works hut exterior with clear space for the works list panel |
| `parent-clean.png` | Parent | Parent treehouse exterior with clear space for the settings panel |

## Review

Review contact sheet:

- `design/extracted/backgrounds/backgrounds-preview.png`

## Hard Rules

Do not bake any of these into a background:

- Dinosaur characters
- Eggs
- Buttons
- Icons
- Text labels
- Cards or panels
- Bottom navigation

Those pieces must remain separate sprite/UI assets.
