## Why

The works gallery still uses a flat legacy title, board, and gradient card set that does not match the polished clay-and-cream visual language now used by Home, Hatch, and the child navigation. The gallery needs independent reusable assets and a composition that feels like the same product.

## What Changes

- Recompose the works page with the shared DinoDoo logo and wooden subtitle plaque used by Hatch.
- Replace the legacy board with a new independent cream-clay display cabinet asset.
- Replace featured and compact cards with independently generated clay card assets.
- Reuse the established green primary button and orange stitched badge assets for refresh and featured states.
- Preserve live work data, the three-item layout, refresh behavior, and fixed bottom navigation.

## Capabilities

### New Capabilities
- unified-works-gallery: A visually unified, runtime-composed works gallery using independent reusable assets.

### Modified Capabilities

## Impact

- apps/h5/app.js: works asset manifest and scene coordinates.
- apps/h5/index.html: cache version only.
- apps/h5/assets/game-elements/runtime-current: new works cabinet and card assets.
- design/generated/works-gallery-v2: retained source assets and visual QA evidence.
