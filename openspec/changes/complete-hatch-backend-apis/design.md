## Context

The Go service already owns safety guards, provider credentials, JSON persistence, generated media, and gallery artifacts. The redesigned H5 hatch screen currently bypasses those layers and creates browser-local entries after a timed animation. The implementation must preserve the polished animation while making the backend result the source of truth whenever it is reachable.

## Goals / Non-Goals

**Goals:**

- Provide one hatch endpoint for text-only and optional reference-image requests.
- Reuse the existing safety, media provider, artifact repository, and local SVG fallback.
- Make client retries safe through an idempotency key.
- Keep the H5 responsive by running its visual sequence while the request is in flight.
- Verify the API with isolated temporary repositories and HTTP handler tests.

**Non-Goals:**

- No account system, database migration, asynchronous job queue, or public sharing.
- No provider key in browser code.
- No requirement for a paid image provider during local development.

## Decisions

### Use `POST /api/v1/hatches` as the product-level operation

The endpoint accepts `application/json` with `prompt` and `idempotency_key`, or `multipart/form-data` with the same fields plus `image`. It returns `201` for a new hatch and `200` when replaying an existing idempotent result. This avoids forcing the hatch UI through the story-session lifecycle while still returning the existing `Artifact` representation.

Alternative: create and immediately finish a hidden play session. Rejected because it creates unrelated session records and produces story-derived card seeds rather than prompt-derived hatch data.

### Persist a compact hatch request record in the artifact prompt JSON

The artifact stores the safe prompt, source image metadata, derived display name, and safety flags. The uploaded image is copied to the server media directory with a generated name; only its server path is passed to provider abstractions.

Alternative: add a new database entity. Rejected for the JSON-store MVP because the artifact already owns the generated result and metadata.

### Reuse the media fallback contract

When an OpenAI-compatible image provider is configured, generation uses it. Otherwise the server creates a local SVG hatch card. Provider failure also falls back locally, so a hatch is still successful and appears in Works.

### Keep H5 local fallback explicit

The H5 first calls the API. If the request fails because the backend is unavailable, it completes the animation, stores the local record, and marks the record as offline. Server validation errors do not silently fall back; they are shown to the user so invalid input is not persisted locally.

## Risks / Trade-offs

- [Large reference images can exhaust memory] -> cap request bodies and uploaded files at 8 MiB and accept only image MIME types.
- [Double taps can create duplicate works] -> require or generate an idempotency key and persist it in artifact metadata.
- [JSON persistence serializes concurrent writes] -> retain repository locking; sufficient for the MVP.
- [Local SVG does not visually match provider output] -> treat it as a functional fallback and expose the provider in the artifact response.

## Migration Plan

1. Add the hatch route and repository idempotency lookup without changing existing routes.
2. Add handler and persistence tests.
3. Update H5 to submit text or multipart requests and consume returned artifacts.
4. Keep current local storage records readable and merge them with backend artifacts.
5. Roll back by reverting the H5 call; the additive API and stored artifacts remain harmless.

## Open Questions

- Production provider and child-friendly image moderation policy remain deployment configuration decisions.
