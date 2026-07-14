## 1. Hatch Job Backend

- [x] 1.1 Add persisted hatch-job models and repository methods with idempotent lookup
- [x] 1.2 Change hatch submission to return `202 Accepted` and add the job query route
- [x] 1.3 Add background job execution, durable step progress, restart resume, and structured failures

## 2. Generation Pipeline

- [x] 2.1 Add structured LLM dinosaur-profile generation with child-safety validation
- [x] 2.2 Require raster image generation and support independent image-provider configuration
- [x] 2.3 Pass uploaded reference images into generation and persist the final artifact only after success
- [x] 2.4 Generate hatch images through the canonical `gpt_image` contract with a versioned DinoDoo system style prompt
- [x] 2.5 Use `gpt-image-2` with the three home dinosaurs as style references and reject clay-figurine or fake-checkerboard output in the prompt contract

## 3. H5 Integration

- [x] 3.1 Submit hatch jobs and poll their status instead of awaiting a synchronous artifact
- [x] 3.2 Bind egg animation and status copy to backend steps
- [x] 3.3 Preserve the prompt and restore controls on failure; navigate to Works only on success
- [x] 3.4 Render the persisted generated image in Works with a bundled-image fallback

## 4. Verification and Documentation

- [x] 4.1 Replace synchronous hatch tests with submission, idempotency, progress, success, failure, and reference-image tests
- [x] 4.2 Update API and provider configuration documentation
- [x] 4.3 Run Go tests, JavaScript syntax checks, and strict OpenSpec validation
