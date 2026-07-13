## Context

The Works route currently renders one featured work and two compact cards inside a tall cabinet. Dynamic prompts and saved-work counts make the layout uneven, while only three works are reachable.

## Goals / Non-Goals

**Goals:**
- Keep one dinosaur visually dominant and all metadata inside fixed bounds.
- Provide obvious previous/next paging with visible position feedback.
- Preserve the existing tropical workshop background, shared header, refresh behavior, and bottom navigation.

**Non-Goals:**
- No API or artifact schema changes.
- No swipe gesture dependency or new framework.
- No changes to Home, Hatch, or Story routes.

## Decisions

- Store a zero-based `worksPage` in frontend state and derive the active list from the same fallback order already used by the Works route.
- Wrap previous and next navigation, because a child can keep tapping without reaching a dead end.
- Render one existing featured card at a stable size; reuse the current dinosaur cutouts and runtime text instead of generating composite screenshots.
- Use one independent cream-clay arrow image for both directions, rotating the next control in CSS to keep both sides identical.
- Render at most five dots plus a numeric counter so large collections remain readable.

## Risks / Trade-offs

- [Long prompts can overflow] -> Clamp description to two centered lines in a fixed text area.
- [Refresh can reduce collection size] -> Clamp `worksPage` before every render.
- [A single card shows less at once] -> Paging makes every item reachable and improves focus for the target age group.


## Content Alignment Refinement

- The dinosaur artwork uses a smaller fixed slot raised within the blue display area.
- Generic card titles are replaced by the first concise Chinese dinosaur phrase from the prompt.
- Child-facing descriptions remove trailing English generation metadata and clamp to 28 Chinese characters in two lines.
- Chinese dinosaur-type keywords select the matching transparent dinosaur artwork before page-index fallback.
