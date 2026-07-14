## Why

The current hatch endpoint blocks until media generation finishes and silently falls back to a local placeholder card, so the UI can report a successful hatch without creating the dinosaur image the child requested. DinoDoo needs the same durable submit, progress, generation, and persistence lifecycle used by LinkYun one-click creation.

## What Changes

- **BREAKING** Change `POST /api/v1/hatches` to submit an idempotent asynchronous hatch job and return `202 Accepted` with a `job_id` and `status_url`.
- Add `GET /api/v1/hatches/{job_id}` for queued, running, succeeded, and failed job state, step progress, errors, and the final artifact.
- Generate a child-safe dinosaur image from the prompt, including an optional uploaded reference image, before persisting the completed work.
- Remove the automatic local SVG success fallback from user-initiated hatching; provider failures become visible failed jobs that can be retried.
- Update the H5 hatch flow to poll the job, synchronize the egg animation with backend progress, and enter Works only after a real artifact is ready.

## Capabilities

### New Capabilities
- `async-dino-hatching`: Idempotent hatch-job submission, durable progress, child-safe image generation, optional reference-image input, artifact persistence, and H5 polling behavior.

### Modified Capabilities

None.

## Impact

- Backend API and persistence in `server/cmd/api`.
- H5 hatch interaction in `apps/h5/app.js`.
- Provider configuration for image generation remains backend-only.
- Existing clients expecting a synchronous `artifact` response from `POST /api/v1/hatches` must adopt job polling.
