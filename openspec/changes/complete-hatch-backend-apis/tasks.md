## 1. Hatch API

- [x] 1.1 Add prompt hatch request parsing for JSON and multipart image uploads.
- [x] 1.2 Add prompt-based artifact generation with safety metadata and local provider fallback.
- [x] 1.3 Add repository idempotency lookup and generated media cleanup on artifact deletion.
- [x] 1.4 Register `POST /api/v1/hatches` with request-size and validation handling.

## 2. H5 Integration

- [x] 2.1 Submit hatch prompts and optional reference images to the backend.
- [x] 2.2 Use persisted backend artifacts in the Works page while retaining marked offline fallback records.
- [x] 2.3 Surface backend validation failures without creating duplicate local works.

## 3. Verification

- [x] 3.1 Add Go handler tests for JSON hatch, multipart hatch, idempotency, validation, fallback generation, and deletion cleanup.
- [x] 3.2 Run Go formatting, tests, JavaScript syntax checks, and strict OpenSpec validation.
- [x] 3.3 Start the local Go service and verify the H5 hatch-to-works flow against real APIs.
