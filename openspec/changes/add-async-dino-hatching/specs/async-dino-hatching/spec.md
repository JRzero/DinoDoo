## ADDED Requirements

### Requirement: Idempotent asynchronous hatch submission
The system SHALL validate a hatch request, persist a hatch job, and return `202 Accepted` without waiting for LLM or image generation. The system MUST return the existing job when the same non-empty idempotency key is submitted again.

#### Scenario: New hatch job is accepted
- **WHEN** the client submits a valid prompt and a new idempotency key
- **THEN** the response contains a queued `job_id`, `status`, and `status_url`

#### Scenario: Duplicate hatch request is replayed
- **WHEN** the client repeats a request with an existing idempotency key
- **THEN** the response identifies the same job and does not schedule duplicate generation

### Requirement: Optional reference image is part of the job
The system SHALL accept an optional valid image upload, store it as private backend media, and pass it to the image-generation provider for the corresponding hatch job.

#### Scenario: Reference image is supplied
- **WHEN** the client submits multipart form data with a supported image
- **THEN** the job records the stored reference image and image generation uses it

### Requirement: Hatch job exposes durable progress
The system SHALL expose queued, running, succeeded, and failed states with current step, numeric progress, timestamps, final artifact, and structured error details.

#### Scenario: Client polls a running job
- **WHEN** generation has started but is incomplete
- **THEN** the job query reports `running`, its current step, and progress below 100

#### Scenario: API restarts with unfinished jobs
- **WHEN** persisted jobs are queued or running at startup
- **THEN** the hatch worker resumes them without requiring a new client submission

### Requirement: LLM produces a child-safe dinosaur profile
The system SHALL derive a dinosaur name, concise description, and image prompt from the child request before image generation. Generated fields MUST pass length and child-safety validation.

#### Scenario: Profile generation succeeds
- **WHEN** the text provider returns valid structured profile data
- **THEN** the image step receives the validated image prompt and the artifact stores the profile metadata

### Requirement: A real dinosaur image is required for success
The system SHALL mark a hatch job succeeded only after an image provider returns a raster image and the backend persists a ready `hatched_dino` artifact. The system MUST NOT use a local SVG fallback for a user-initiated hatch.

#### Scenario: Image generation succeeds
- **WHEN** the configured `gpt_image` skill returns a valid raster payload
- **THEN** the job reaches 100 percent and returns a ready artifact with a media URL

#### Scenario: Generated dinosaurs share one visual identity
- **WHEN** any validated dinosaur profile is sent to the image skill
- **THEN** the backend uses `gpt-image-2`, prepends the versioned DinoDoo style system prompt, supplies the home dinosaurs as visual-style references, and requests a centered full-body true-alpha PNG with no text, logo, scenery, checkerboard, or extra characters

#### Scenario: Image generation is unavailable
- **WHEN** the image provider is missing, fails, or returns no image
- **THEN** the job becomes failed with a user-safe error and no ready artifact is persisted

### Requirement: H5 follows backend hatch state
The H5 SHALL poll the accepted job and SHALL show hatch success only after the backend job succeeds. It MUST preserve the entered prompt and restore controls when the job fails.

#### Scenario: Hatch progresses to success
- **WHEN** polling moves from profile to image to succeeded
- **THEN** the egg progresses from glow to cracking to reveal and the app then opens Works

#### Scenario: Hatch job fails
- **WHEN** polling returns a failed state
- **THEN** the egg returns to idle, controls become available, and the child can retry without losing the prompt

#### Scenario: Generated dinosaur appears in Works
- **WHEN** a hatch job succeeds with a persisted media URL
- **THEN** the Works card displays that generated raster image and uses a bundled dinosaur only if the media cannot load
