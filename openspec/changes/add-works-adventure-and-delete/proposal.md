## Why

The works carousel currently displays hatched dinosaurs as passive cards, so the creation loop stops before children can use their dinosaur in a story. The H5 also exposes no way to remove an unwanted generated work even though the backend already supports artifact deletion.

## What Changes

- Make the active works card a clear entry point into Story Path and start a new adventure with that dinosaur's name, description, and image.
- Keep the selected work dinosaur visible as the story companion while the generated story uses its profile.
- Add a child-safe two-step delete control for persisted and locally stored works.
- Synchronize deletion with backend media cleanup, local storage, carousel pagination, and the empty/demo state.
- Keep built-in demo dinosaurs available for adventures but prevent deleting them.

## Capabilities

### New Capabilities
- `works-adventure-management`: Covers starting a story from a work and safely deleting persisted or local works from the carousel.

### Modified Capabilities

None.

## Impact

- H5 works and story state, card hotspots, accessibility labels, and mobile layout.
- Play-session creation payload and story engine support for a custom dinosaur profile.
- Existing artifact deletion API usage and associated frontend error handling.
- Frontend interaction tests and Go API/story-engine tests.
