## ADDED Requirements

### Requirement: Structured play sessions
The system SHALL create play sessions with structured story state including theme, scene, goal, active dinosaur, turn index, choices, and card seed.

#### Scenario: Session is created
- **WHEN** a client creates a play session with a theme
- **THEN** the backend returns a session id, initial story state, first dinosaur turn, and two choices

### Requirement: Bounded story turns
The system SHALL generate story turns that contain one speaker, one short child-friendly line, one expression, and exactly two choices until the session is finished.

#### Scenario: Turn is generated from child input
- **WHEN** a child submits voice text or a choice
- **THEN** the backend updates story state and returns one short dinosaur response with exactly two choices

### Requirement: Session finish creates card seed
The system SHALL finish a play session by producing a structured dino card seed based on the session state and child choices.

#### Scenario: Session is finished
- **WHEN** the client finishes a play session
- **THEN** the backend marks the session finished and creates or queues a dino card artifact

### Requirement: Template fallback
The system SHALL provide deterministic story template behavior when no LLM provider is configured.

#### Scenario: LLM provider is unavailable
- **WHEN** no LLM provider key is configured
- **THEN** the story engine still returns valid child-friendly turns from local templates
