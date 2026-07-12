## Why

The current story screen gives the child only two fixed, text-baked choices and renders the active dinosaur so large that it competes with the dialog. The story experience needs a calmer composition and exactly three dynamic choices on every turn.

## What Changes

- **BREAKING**: change the story turn contract from exactly two choices to exactly three choices.
- Return three safe, short choices from the initial turn, normal turns, and safety fallback turns.
- Replace text-baked story choice images with reusable blank button artwork and dynamic labels.
- Reduce the active dinosaur and title scale so dialog and choices remain visually dominant.
- Submit H5 story choices to the existing backend turn API and render the returned text and choices.

## Capabilities

### New Capabilities
- `three-choice-story`: Three-option story turns, dynamic story choice rendering, and the revised mobile story composition.

### Modified Capabilities

## Impact

- `server/cmd/api` story engine response contract and tests.
- `apps/h5` story state, backend turn integration, choice controls, scene layout, and independent button assets.
- Existing clients that assume exactly two choices must update to consume three.