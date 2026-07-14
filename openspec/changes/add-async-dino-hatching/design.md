## Context

The H5 currently starts a synchronous request while playing a fixed egg animation. The backend directly calls image generation and, when no image provider is configured or the call fails, persists a local SVG as a successful `hatched_dino`. This makes UI success independent from actual dinosaur creation. LinkYun one-click creation instead persists a job immediately, runs profile and image steps asynchronously, exposes progress, and only persists the final entity after all required generation succeeds.

## Goals / Non-Goals

**Goals:**

- Return quickly from hatch submission and expose durable, idempotent job progress.
- Use an LLM to derive a child-safe dinosaur profile and image prompt from the child's request.
- Generate and persist a real raster dinosaur image, optionally using an uploaded reference image.
- Keep egg animation and H5 status synchronized with backend progress.
- Resume unfinished persisted jobs after a local API restart.

**Non-Goals:**

- A distributed database queue, multi-instance locks, or an operations dashboard.
- Training or hosting an image model inside DinoDoo.
- Reworking story-card generation, which may continue to use its existing demo fallback.

## Decisions

### Persist a hatch job before generation

`POST /api/v1/hatches` validates and stores the optional reference image, writes a `queued` job into `store.json`, and returns `202`. An idempotency key maps retries to the same job. This follows LinkYun submit/poll semantics while fitting DinoDoo's single-process JSON repository.

### Run serialized background jobs with resumable state

The API starts a small hatch worker that claims queued jobs in process. Job state is persisted at each step: `profile` (15), `image` (60), `persist` (95), and `done` (100). Jobs left queued or running after restart are resumed. A per-job claim map prevents duplicate local execution.

### Separate profile generation from image generation

The text provider returns strict JSON containing `name`, `description`, and `image_prompt`. The prompt is constrained to a friendly single dinosaur, full body, clean composition, no text, and no frightening content. The image provider receives the derived prompt and optional reference image. Provider credentials remain backend-only.

### Treat image generation as required

User-initiated hatching uses the canonical LinkYun `gpt_image` skill contract. DinoDoo uses `gpt-image-2`, prepends a versioned backend-owned system style prompt, and sends the three independent home-screen dinosaur PNGs as style-only references before every image request. Species, color, and personality can vary without drifting away from the product's animated-feature-film anatomy, expressive face, rendering, composition, or true-alpha background treatment. The `image_gpt` spelling is accepted as a compatibility alias but normalized to `gpt_image` in persisted metadata.

User-initiated hatching succeeds only when the image provider returns a raster payload that is written to media storage. Missing configuration, malformed provider output, download errors, and unsafe output requests fail the job. The prior local SVG fallback is not used for hatch jobs.

### Poll from H5 and bind animation to progress

The H5 submits once, polls the returned `status_url`, and maps `queued/profile` to egg glow and `image/persist` to shell cracking. It shows success and navigates to Works only after `status=succeeded` includes a ready artifact. Failed jobs restore controls and keep the prompt for correction or retry.

## Risks / Trade-offs

- [The configured AgentLLM endpoint may not expose an image endpoint] -> Support separate `OPENAI_IMAGE_BASE_URL`, `OPENAI_IMAGE_API_KEY`, and `OPENAI_IMAGE_MODEL`; fail visibly when unavailable.
- [JSON storage has no cross-process atomic claim] -> Keep the MVP worker single-process and document that multi-instance deployment requires a database-backed queue.
- [A process can stop during generation] -> Persist each step and resume unfinished jobs on startup; idempotency prevents duplicate submissions.
- [Reference images may contain private content] -> Accept images only, enforce size limits, store them server-side, and remove owned media when a failed job is deleted in a future cleanup pass.

## Migration Plan

1. Add hatch-job persistence and query API while keeping artifact listing unchanged.
2. Update H5 to understand only the new `202 + job` contract.
3. Configure a compatible image provider in the backend environment.
4. On rollback, restore the synchronous endpoint and H5 request helper; existing artifacts remain readable and persisted jobs can be ignored.

## Open Questions

- Production should choose and provision an image-capable provider; `mimo-v2.5-pro` remains the profile text model and is not assumed to generate images.
