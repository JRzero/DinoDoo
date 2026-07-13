## Why

The current Works page fixes three dinosaurs into one cabinet, which becomes visually uneven as names, prompts, and the number of saved works vary. A child-friendly paged gallery will keep one dinosaur as the clear focus and make every saved dinosaur easy to browse.

## What Changes

- Replace the fixed featured-plus-two-card layout with a single-work carousel.
- Add previous and next controls, page dots, and a visible current/total counter.
- Keep the shared logo, wooden subtitle, cream-clay materials, refresh action, and fixed bottom navigation.
- Clamp the active page when refreshed data changes and wrap navigation at both ends.

## Capabilities

### New Capabilities
- `works-carousel`: Browse saved dinosaur works one at a time with clear paging feedback and child-friendly controls.

### Modified Capabilities

## Impact

- H5 Works scene composition and state in `apps/h5/app.js`.
- Works interaction hotspots in `apps/h5/index.html` and `apps/h5/styles.css`.
- One new independent carousel arrow raster asset; no backend or API changes.
