## Context

The story engine currently returns two choices and the H5 draws two text-baked choice images. That prevents per-turn labels from matching backend data. The active dinosaur is rendered at 190x296 in the center-right of a 390x684 scene, which crowds the speech bubble and leaves the interaction hierarchy unbalanced.

## Goals / Non-Goals

**Goals:**

- Return exactly three short choices on every assistant story turn.
- Render those choices from backend data with independent blank button artwork.
- Reduce the dinosaur and title scale while preserving the current island background and voice control.
- Keep touch targets large enough for a young child.

**Non-Goals:**

- No open-ended LLM branching or new story persistence model.
- No redesign of home, hatch, works, or parent screens.
- No new image-generation dependency.

## Decisions

### Use a strict three-choice backend invariant

The story engine constructs three choices for initial, normal, and safety fallback turns. Tests assert the invariant so frontend layout can remain deterministic.

Alternative: let the frontend add a third local choice. Rejected because clients would display behavior not represented in the persisted story state.

### Use blank pill artwork plus DOM text

The H5 reuses existing independent blank orange and green pill assets. Three equal-width buttons are laid out in one row, with one color-adjusted variant for visual separation. Labels are rendered as live text and updated from `turn.choices`.

Alternative: generate new text-baked assets for every answer. Rejected because story answers are dynamic.

### Keep one-row answer choices

Three buttons of approximately 106x48 fit the 390px stage and preserve the familiar bottom-choice pattern. Backend choices remain short, with a five-to-six Chinese character target.

### Reduce character dominance

The active dinosaur moves to the right side at approximately 130x203. The speech bubble remains on the left, while the voice control and three choices form a compact lower interaction area.

## Risks / Trade-offs

- [Long provider choices may overflow] -> truncate display labels and keep the backend template choices short.
- [Color filtering can vary slightly by browser] -> retain identical geometry and high-contrast white labels.
- [Older stored sessions may contain two choices] -> normalize to three H5 fallback choices when rendering.