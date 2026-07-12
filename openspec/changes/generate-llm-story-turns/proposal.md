## Why

The story screen currently rotates local template lines, so its questions and choices do not form a coherent evolving story. Children need short, connected story beats generated from the selected dinosaur, prior choices, scene, and goal.

## What Changes

- Generate the initial story question and every subsequent story turn through a backend LLM provider when configured.
- Require each generated turn to contain an age-appropriate story beat and exactly three distinct choices, without forcing either the question or answers into very short phrases.
- Include recent conversation context so each choice meaningfully advances the same story.
- Give every opening and subsequent model request a fresh creative seed and anti-repetition sampling controls.
- Keep a deterministic safe fallback when the provider is unavailable, slow, or returns invalid output.
- **BREAKING**: remove the story speech button and typed-input path; children continue the story only through the three generated choices.

## Capabilities

### New Capabilities
- `llm-story-generation`: Contextual LLM-generated children's story turns, strict three-choice output validation, and safe fallback behavior.

### Modified Capabilities

## Impact

- `server/cmd/api`: story engine provider abstraction, model request/response parsing, safety validation, timeout handling, and tests.
- apps/h5: story layout, vertically stacked answer controls, loading state, and removal of speech/text story input.
- Runtime configuration: `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and new `OPENAI_STORY_MODEL` / timeout settings.
