## ADDED Requirements

### Requirement: Server-backed prompt hatching
The system SHALL expose `POST /api/v1/hatches` to create a dinosaur artifact from a child-safe text description.

#### Scenario: Text-only hatch succeeds
- **WHEN** the client submits a valid prompt and idempotency key as JSON
- **THEN** the backend returns a persisted ready artifact and a generated media URL

#### Scenario: Empty prompt uses a safe default
- **WHEN** the client submits an empty prompt
- **THEN** the backend uses the product's friendly default dinosaur description

### Requirement: Optional reference image upload
The hatch endpoint SHALL accept an optional image in a multipart request without exposing provider credentials to the client.

#### Scenario: Valid reference image is accepted
- **WHEN** the client uploads a supported image of at most 8 MiB with a hatch prompt
- **THEN** the backend stores safe image metadata and creates the hatch artifact

#### Scenario: Invalid upload is rejected
- **WHEN** the client uploads a non-image file or an oversized body
- **THEN** the backend returns a validation error and does not create an artifact

### Requirement: Idempotent hatch creation
The system SHALL prevent duplicate artifacts when the same hatch request is retried with the same idempotency key.

#### Scenario: Hatch request is replayed
- **WHEN** a completed hatch request is submitted again with the same idempotency key
- **THEN** the backend returns the existing artifact without generating or persisting a duplicate

### Requirement: Provider-independent completion
The hatch endpoint SHALL complete with a usable local artifact when the external image provider is absent or fails.

#### Scenario: Image provider is unavailable
- **WHEN** no image provider is configured or the provider call fails
- **THEN** the backend creates a local SVG artifact with ready status

### Requirement: H5 backend integration and offline fallback
The H5 hatch action SHALL submit the prompt and optional image to the backend and SHALL preserve a clearly identified local fallback when the backend cannot be reached.

#### Scenario: Backend hatch completes
- **WHEN** the backend returns a hatch artifact
- **THEN** the H5 completes the hatch sequence and displays the persisted result in Works

#### Scenario: Backend is offline
- **WHEN** the hatch request fails because the API is unavailable
- **THEN** the H5 completes the local hatch flow, marks the result as offline, and keeps it in browser storage

#### Scenario: Backend rejects input
- **WHEN** the backend returns a validation error
- **THEN** the H5 shows the error and does not create a local fallback artifact

### Requirement: Artifact deletion removes generated media
The backend SHALL delete generated media owned by an artifact when that artifact is deleted.

#### Scenario: Artifact is deleted
- **WHEN** a client deletes an existing artifact
- **THEN** the artifact is removed from the repository and its generated media file is removed from server storage
