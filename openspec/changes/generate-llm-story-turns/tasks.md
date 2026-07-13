## 1. Story Provider

- [x] 1.1 Add a story generator interface and OpenAI-compatible JSON provider with bounded context and timeout.
- [x] 1.2 Validate and normalize generated story text, expression, and exactly three distinct short choices.
- [x] 1.3 Use the provider for initial and subsequent turns with deterministic safe fallback.

## 2. Story Screen

- [x] 2.1 Remove the story speech, replay, and free-text controls and their event bindings.
- [x] 2.2 Recompose the story text and three choices and show a loading state while the next turn is generated.

## 3. Verification

- [x] 3.1 Add tests for valid model output, contextual continuation, malformed output, timeout/error fallback, and three-choice invariants.
- [x] 3.2 Document model configuration and run Go, JavaScript, OpenSpec, and browser interaction validation.

## 4. Long Story Layout

- [x] 4.1 Relax model and safety limits for longer story questions and complete answer phrases.
- [x] 4.2 Stack the three answer controls vertically and support wrapped answer labels.
- [x] 4.3 Add long-content tests and verify the 390x844 story layout in the browser.
- [x] 4.4 Increase and left-align story question typography without colliding with the dinosaur artwork.
- [x] 4.5 Replace stretched legacy choice bitmaps with readable scalable answer cards and verify all three interactions.
- [x] 4.6 Add fresh creative seeds and anti-repetition sampling controls to every LLM story request.
- [x] 4.7 Increase story question line spacing and verify long randomized turns at 390 x 844.

## 5. AgentLLM Runtime Integration

- [x] 5.1 Load ignored local environment configuration from the startup script.
- [x] 5.2 Configure AgentLLM OpenAI-compatible base URL and mimo-v2.5-pro story model.
- [x] 5.3 Verify model visibility, restart the API, and confirm a generated story turn.

## 6. Story Dinosaur Motion

- [x] 6.1 Add a subtle foot-anchored idle animation without changing the dinosaur layout slot.
- [x] 6.2 Add choice feedback and next-turn loading motion using the existing story state.
- [x] 6.3 Respect reduced-motion preferences and validate the interaction in the browser.

- [x] 6.4 Remove the interstitial story-loading plaque while preserving duplicate-submit protection.
- [x] 6.5 Replace the loading bounce with bounded left-right thinking movement.
- [x] 6.6 Start thinking movement immediately and keep it visible under reduced-motion browser defaults.
