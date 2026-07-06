## ADDED Requirements

### Requirement: Server-side speech transcription endpoint
The system SHALL expose a speech-to-text endpoint that accepts uploaded audio and returns transcribed text without exposing provider API keys to the H5 app.

#### Scenario: Audio is transcribed
- **WHEN** the H5 app uploads an audio recording to the transcription endpoint
- **THEN** the backend returns text from the configured provider or a clear fallback response

### Requirement: Server-side speech synthesis endpoint
The system SHALL expose a text-to-speech endpoint that accepts dinosaur text and returns playable audio or a clear fallback response.

#### Scenario: Dinosaur line is synthesized
- **WHEN** the H5 app requests speech for a dinosaur line
- **THEN** the backend returns audio from the configured provider or indicates that browser speech synthesis should be used

### Requirement: Dino card image generation
The system SHALL generate a dino card image artifact from a safe structured prompt at the end of a play session.

#### Scenario: Provider image generation succeeds
- **WHEN** image generation is enabled and provider configuration is valid
- **THEN** the backend stores the generated image and returns an artifact with ready status

#### Scenario: Provider image generation is unavailable
- **WHEN** provider configuration is missing or generation fails
- **THEN** the backend creates a local placeholder dino card artifact so the gallery remains usable

### Requirement: Media provider configuration remains server-side
The system SHALL keep STT, TTS, LLM, and image provider credentials on the backend only.

#### Scenario: H5 app calls media endpoints
- **WHEN** the H5 app requests transcription, speech, or image generation
- **THEN** no provider API key is present in client code, browser storage, or request payloads
