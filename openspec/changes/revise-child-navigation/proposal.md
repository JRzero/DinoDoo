## Why

The child-facing bottom navigation currently labels the home route as Works and keeps a Parent entry in the primary child flow. The labels, icons, and destinations should match the actual information architecture and remain easy for young children to understand.

## What Changes

- Rename the child home entry to Park and give it a new standalone dinosaur-park icon.
- Keep Hatch as the prominent center action.
- Replace the right-side Parent entry with Works, routing directly to the works gallery.
- Keep the parent screen implementation available internally, but remove it from the child primary navigation.
- Make home and story routes share the Park active navigation state.

## Capabilities

### New Capabilities
- `child-primary-navigation`: A consistent three-entry child navigation contract for park, hatch, and works routes.

### Modified Capabilities

## Impact

- `apps/h5/index.html`: navigation labels and semantic button IDs.
- `apps/h5/app.js`: route mapping, click bindings, and navigation artwork composition.
- `apps/h5/styles.css`: navigation button positioning and active-state styling.
- `apps/h5/assets/game-elements/runtime-current`: new transparent park icon asset.
