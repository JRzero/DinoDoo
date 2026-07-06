## Context

恐龙咚咚岛 currently has product and architecture planning documents but no runnable application. The target is an H5 MVP, not a full Agent platform. The design borrows LinkYun's useful structure: separate app/server folders, a single API backend, service-layer orchestration, provider abstractions for AI, local development scripts, and simple health checks.

The MVP must support young-child interaction. That makes bounded story state, parent controls, safety filters, and short media feedback more important than open-ended chat.

## Goals / Non-Goals

**Goals:**

- Deliver a runnable mobile-first H5 app for baby play, parent settings, and generated cards.
- Provide an API service for story sessions, turns, voice, image/card generation, artifacts, and health checks.
- Keep all provider secrets on the server.
- Support real OpenAI-compatible media endpoints when configured, while retaining local demo fallbacks.
- Keep the story engine deterministic enough for child safety: short turns, one active speaker, and two choices.
- Store data locally for the MVP and keep a future path to SQLite/PostgreSQL.

**Non-Goals:**

- No mobile shell or Expo app in this change.
- No public social feed, comments, likes, follows, workspace collaboration, RAG, Edge runtime, or Agent marketplace.
- No realtime duplex voice conversation in the MVP.
- No long-term child memory by default.

## Decisions

### Decision 1: Use a static H5 app plus Go API service for the first implementation

Use `apps/h5` as a mobile-first static H5 app and `server` as a Go API service using the standard library.

Rationale:

- The current workspace has no package dependencies installed.
- A static H5 app can be run immediately and served by the Go backend.
- Go aligns with the LinkYun backend style without importing the full LinkYun platform complexity.

Alternative considered: Vite + React. This remains a good later upgrade, but it adds dependency installation before the basic story loop is validated.

### Decision 2: Story Engine owns interaction rhythm

The backend keeps a structured `StoryState` and returns `StoryTurn` objects with:

- speaker
- short text
- expression
- two choices
- card seed
- safety flags

Rationale:

- Pure free-form chat is too easy to drift.
- A state machine makes turns testable and keeps content short.

Alternative considered: direct LLM chat. Rejected for the MVP because it weakens safety and makes the UI less predictable.

### Decision 3: Voice uses browser-first fallback and server provider endpoints

The H5 app uses browser speech recognition when available and browser speech synthesis as a reliable fallback. The server exposes `/api/v1/audio/transcriptions` and `/api/v1/audio/speech` so real provider integration can be enabled without exposing keys to the H5 app.

Rationale:

- Browser speech keeps local testing immediate.
- Server endpoints establish the correct production boundary.

Alternative considered: realtime voice API. Rejected for the MVP because push-to-talk and short TTS are enough for 3-year-old story turns.

### Decision 4: Image generation is end-of-session card generation

The app generates one dino card at session finish. If an image provider is configured, the server calls it and stores the result. If not, the server creates a local SVG card artifact.

Rationale:

- End-of-session generation avoids blocking each story turn.
- A local artifact keeps the gallery usable without paid provider setup.

Alternative considered: generate images during every turn. Rejected because it increases cost, latency, and failure handling.

### Decision 5: Safety guard is a first-class module

The server applies simple deterministic guards before and after story generation and before image prompt generation.

Rationale:

- Child safety is product-critical.
- Deterministic guardrails are testable before any external AI provider is connected.

Alternative considered: rely on model safety only. Rejected because the application must enforce its own domain rules.

## Risks / Trade-offs

- Browser speech support varies by browser -> keep typed/choice input and server speech endpoints as fallback.
- Provider calls can fail or be unavailable -> return demo audio/card artifacts without breaking the play loop.
- Static H5 is less scalable than a React app -> acceptable for P0/P1; the API contract can survive a later frontend rewrite.
- Deterministic templates can feel repetitive -> add more story templates before adding open-ended LLM behavior.
- Local JSON storage is not multi-user safe at scale -> acceptable for MVP; repository interface keeps the migration path open.

## Migration Plan

1. Add OpenSpec specs and tasks.
2. Add the Go API service with local JSON/file persistence.
3. Add static H5 app and wire it to API endpoints.
4. Add optional OpenAI-compatible provider calls for TTS, STT, and image generation.
5. Add startup script and verification commands.

Rollback is simple during MVP: remove or disable the new folders and continue from the planning docs.

## Open Questions

- Which production provider should be used for Chinese child-friendly TTS voices?
- Should generated cards use OpenAI GPT Image by default or a domestic image provider for China deployment?
- Should parent login be device-local only in MVP or account-based from the start?
