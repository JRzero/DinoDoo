## Why

恐龙咚咚岛 needs a playable H5 MVP that proves the core child-facing loop: a child can join a short cartoon dinosaur story, respond with voice or simple choices, hear the dinosaur reply, and receive a generated dino card at the end. The existing product and architecture plans define the direction; this change turns them into an OpenSpec-backed implementation scope.

## What Changes

- Add a mobile-first H5 app with baby play mode, parent settings, and artifact gallery.
- Add a lightweight API service for play sessions, story turns, parent settings, media generation, and health checks.
- Add a story engine that keeps interaction bounded through structured state, short turns, and two-choice responses.
- Add voice input and voice output through backend STT/TTS provider abstractions, with browser/demo fallbacks when real provider config is missing.
- Add dino card image generation through a backend image provider abstraction, with safe prompt generation and demo placeholder fallback.
- Add child-safety guards for baby input, dinosaur output, and image prompts.
- Add local-first persistence for settings, play sessions, story turns, generated artifacts, and local media files.
- Exclude the mobile shell, social feed, public Agent marketplace, RAG, Edge runtime, and workspace collaboration from this MVP.

## Capabilities

### New Capabilities

- `h5-dinosaur-theater`: Mobile H5 baby play flow, parent settings, and generated artifact gallery.
- `story-engine`: Structured dinosaur theater state machine and story turn generation.
- `voice-media`: Speech-to-text, text-to-speech, image/card generation, and media artifact handling through backend providers.
- `child-safety`: Safety requirements for young-child input, generated text, and generated image prompts.

### Modified Capabilities

- None.

## Impact

- Adds `apps/h5` for the 恐龙咚咚岛 H5 app.
- Adds `server` for the lightweight API service and provider abstractions.
- Adds local data and media directories for development artifacts.
- Adds scripts for local startup and verification.
- Adds dependency surface for frontend tooling and backend runtime, but keeps provider keys server-side only.
