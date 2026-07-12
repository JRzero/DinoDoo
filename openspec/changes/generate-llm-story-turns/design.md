## Context

The Go API currently owns story state and safety checks but creates story text and choices from local arrays. The H5 already consumes `turn.text` and `turn.choices`, so the provider can be introduced behind the existing API contract without exposing credentials or provider details to the browser.

## Goals / Non-Goals

**Goals:**

- Generate coherent story turns from the selected dinosaur, theme, goal, recent turns, and selected choice.
- Parse model output into a strict internal structure with one story beat and exactly three short choices.
- Keep latency bounded and preserve a deterministic child-safe fallback.
- Remove speech and free-text controls from the story screen so interaction is limited to generated choices.

**Non-Goals:**

- No streaming tokens, long-form stories, memory across sessions, or direct browser-to-provider calls.
- No model-generated images or audio in the story turn path.
- No replacement of the existing session persistence format.

## Decisions

### Introduce a small story generator interface

`StoryEngine` receives a `StoryGenerator` implementation. The production generator calls an OpenAI-compatible `/chat/completions` endpoint; tests use a deterministic fake. This keeps network behavior out of story state logic.

Alternative: call the provider directly from HTTP handlers. Rejected because safety, normalization, fallback, and tests belong with story generation rather than transport routing.

### Request and validate JSON

The model is instructed to return structured text, choices, and expression fields. The server strips optional markdown fences, decodes JSON, trims text, deduplicates choices, enforces exactly three choices, and applies output safety checks before accepting a turn. Story text may use up to roughly 120 Chinese characters and each answer may use up to roughly 20 characters.

### Add fresh creative entropy per turn

Every opening and follow-up request receives a cryptographically random creative seed. The provider prompt requires a fresh event, place, clue, and wording while positive presence and frequency penalties reduce repeated phrases. This preserves continuity through recent context without making repeated sessions identical.

### Pass bounded recent context

The request includes the active dinosaur profile, theme scene and goal, turn number, the child's selected choice, and only the most recent six turns. This provides continuity without unbounded prompt growth.

### Fall back locally on any provider failure

Missing credentials, timeout, non-2xx response, invalid JSON, unsafe output, or invalid choice count all produce the existing deterministic story turn. The API response remains successful so a young child is never stranded on a loading state.

### Use choice-only interaction in H5

The story speech button, hidden text form, browser speech recognition, and replay bindings are removed from the story route. The three answer controls are stacked vertically as full-width rows and a compact loading indicator appears while the next turn is generated.

### Render long story content as readable native controls

The story question uses a larger left-aligned text block so longer model-generated beats follow a natural reading edge. Answer rows are native scalable cream cards with numbered color accents, dark text, and two-line wrapping instead of stretched legacy bitmap pills. This keeps text crisp and preserves consistent spacing on the fixed 390 x 844 stage.

## Risks / Trade-offs

- [Model latency makes the screen feel frozen] -> disable choices and show a short in-scene loading message; enforce a configurable timeout.
- [Provider output does not match JSON] -> parse defensively and fall back locally.
- [Generated text is too long for the story panel] -> impose generous but bounded server limits and clamp rendering to the available story panel.
- [Unsafe or privacy-sensitive content] -> retain input/output safety guards and reject unsafe generated turns.
- [No provider key in local development] -> preserve deterministic fallback and expose provider provenance only in server logs.
