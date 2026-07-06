## 1. H5 Navigation And Visuals

- [x] 1.1 Change the middle H5 navigation destination from voice to `孵化`.
- [x] 1.2 Use the selected hatching design as the visual target for story, hatch, and parent screens.
- [x] 1.3 Keep story voice/replay controls inside the story screen.
- [x] 1.4 Add a matching works/gallery visual target for pixel-level gallery implementation.
- [x] 1.5 Normalize page visual bases to 390x844 to avoid viewport crop drift in pixel QA.
- [x] 1.6 Constrain the H5 render container and image fitting behavior to the normalized 390px pixel model.

## 2. Prompt-Based Hatching

- [x] 2.1 Add a hatching screen with prompt input, voice description, example prompt chips, and a primary hatch action.
- [x] 2.2 Convert prompt text into a demo dinosaur profile using local fallback logic.
- [x] 2.3 Persist locally hatched dinosaurs in browser storage.

## 3. Gallery Integration

- [x] 3.1 Show locally hatched dinosaurs in the artwork/gallery list.
- [x] 3.2 Preserve existing generated card artifacts from the backend.
- [x] 3.3 Use the works/gallery visual target as the gallery screen base with a lightweight live result overlay.

## 4. Verification

- [x] 4.1 Run JavaScript syntax checks.
- [x] 4.2 Run backend tests.
- [x] 4.3 Run OpenSpec strict validation.
- [x] 4.4 Add and run an H5 static pixel preflight for normalized assets, references, and default overlay behavior.
- [x] 4.5 Add deterministic hash routes for the browser screenshot QA states.
- [x] 4.6 Add a Playwright capture script for the final browser screenshot comparison gate.
- [x] 4.7 Add a browser capture evidence verifier for the final screenshot QA artifacts.
- [x] 4.8 Document the static and Playwright-gated browser QA evidence flow.
- [x] 4.9 Add a browser screenshot pixel-diff reporter for the final QA pass.
- [x] 4.10 Add a visual diff summary page for final side-by-side QA review.
- [x] 4.11 Add a non-browser verification runner for the static pixel QA matrix.
- [x] 4.12 Record and verify runtime H5 shell dimensions in browser QA evidence.
- [x] 4.13 Add a final-state gate for `design-qa.md` pass/block correctness.
- [x] 4.14 Record and verify active H5 screen state for each browser QA hash route.
- [x] 4.15 Record and verify H5 body mode for each browser QA hash route.
- [x] 4.16 Wait for deterministic browser render readiness before screenshot capture.
- [x] 4.17 Align screenshot readiness waits with the browser evidence shell size tolerance.
- [x] 4.18 Reject passed design QA while P0/P1/P2 findings remain.
- [x] 4.19 Reject ambiguous design QA final-result state.
