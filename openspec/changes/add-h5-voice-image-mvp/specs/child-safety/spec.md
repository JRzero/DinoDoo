## ADDED Requirements

### Requirement: Child input safety guard
The system SHALL inspect child input for privacy, danger, medical distress, violent, or frightening content before story generation.

#### Scenario: Child says unsafe content
- **WHEN** child input triggers a safety category
- **THEN** the dinosaur response gently asks the child to find a parent and does not continue the risky topic

### Requirement: Dinosaur output safety guard
The system SHALL ensure dinosaur responses are friendly, short, nonviolent, non-frightening, and suitable for a 3-year-old child.

#### Scenario: Generated response violates safety rules
- **WHEN** a generated response contains disallowed content or is too long
- **THEN** the backend replaces it with a safe fallback dinosaur response

### Requirement: Image prompt safety guard
The system SHALL ensure image prompts are cartoon, friendly, bright, nonviolent, and free from child personal information before image generation.

#### Scenario: Image prompt contains disallowed content
- **WHEN** a dino card prompt contains unsafe content
- **THEN** the backend rewrites or rejects the unsafe prompt before provider submission

### Requirement: Privacy-preserving defaults
The system SHALL avoid saving raw child audio and personal information by default.

#### Scenario: Voice input is used
- **WHEN** the child uses voice input
- **THEN** the system does not persist raw audio unless a future parent setting explicitly enables it
