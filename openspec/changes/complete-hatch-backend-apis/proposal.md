## Why

The current H5 hatch flow only creates a browser-local record, so a successful hatch is lost across devices and never exercises the existing backend media, safety, and artifact layers. The product now needs a complete server-backed hatch path that accepts text or a reference image, persists the result, and remains usable when external AI providers are not configured.

## What Changes

- Add a server-side prompt hatching endpoint with JSON and multipart request support.
- Validate and safety-filter hatch prompts and uploaded image metadata before generation.
- Persist each successful hatch as a gallery artifact with a stable URL and structured prompt data.
- Make hatch requests idempotent so repeated taps or retries do not create duplicate works.
- Wire the H5 hatch sequence to the backend while preserving an explicit local fallback when the API is unavailable.
- Complete artifact deletion and media lifecycle behavior, and add backend API tests for the full flow.

## Capabilities

### New Capabilities
- `prompt-hatch-api`: Server-backed prompt and reference-image dinosaur hatching, artifact persistence, idempotency, and H5 integration behavior.

### Modified Capabilities

## Impact

- `server/cmd/api`: new hatch route, request validation, artifact generation/persistence improvements, and tests.
- `apps/h5`: real hatch API calls, image upload wiring, backend result rendering, and offline fallback handling.
- `data`: persisted hatch artifacts and generated media files.
- No new runtime dependency is required; the Go standard library and existing provider environment variables remain in use.
