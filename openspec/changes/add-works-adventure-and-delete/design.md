## Context

The H5 works carousel is rendered from `state.artifacts`, with backend artifacts normalized into a shared card model and demo works used only as an empty fallback. Story Path currently renders one of three built-in dinosaurs and creates sessions using only a built-in dinosaur code. The API already exposes `DELETE /api/v1/artifacts/{id}` and removes generated and source media, but the H5 does not call it.

## Goals / Non-Goals

**Goals:**
- Turn the current works card into an obvious adventure entry point without interfering with carousel arrows.
- Carry a work's image, name, and description into Story Path and story generation.
- Provide a deliberate two-step delete action that updates backend/local state and carousel pagination.
- Keep the interaction usable at the fixed 390 x 844 H5 stage.

**Non-Goals:**
- Editing or renaming works.
- Restoring deleted works or adding a recycle bin.
- Deleting built-in demo dinosaurs.
- Changing the story choice model or image generation provider.

## Decisions

1. **Use a transparent card hotspot plus a separate delete pill.** The card body starts an adventure, while a small visible delete pill sits in the card header. Separate controls avoid ambiguous taps and keep carousel arrows independent.
2. **Use a two-step delete confirmation in place.** The first tap changes `删除` to `确认`; the second tap performs the request. This avoids a visually inconsistent browser dialog and reduces accidental deletion by children.
3. **Pass a custom dinosaur profile in the play-session request.** The frontend sends the work artifact ID, name, and description. The backend resolves persisted artifacts when possible, sanitizes the profile, and stores it in story state. Local works can use the same request fields without requiring persistence.
4. **Keep the selected work image in frontend story state.** Story rendering uses the work image with the existing fallback dinosaur asset. The backend remains responsible for narrative profile and LLM prompts, while the H5 owns display composition.
5. **Reuse the existing artifact DELETE endpoint.** Persisted works call the API; local works are removed from local storage. Demo works hide the delete control.

## Risks / Trade-offs

- **Custom profile text could be too long or unsafe** -> Clamp lengths and pass text through the existing safety guard before story generation.
- **Deleting the final persisted work could reveal demo works** -> Treat demos as an intentional empty-state adventure set and hide their delete control.
- **Overlapping hotspots could trigger the wrong action** -> Give delete and arrow controls a higher z-index than the card adventure hotspot and verify tap targets in Playwright.
- **Backend deletion can fail while UI state changes** -> Remove persisted works only after a successful `204`; show an inline status and retain the card on failure.

