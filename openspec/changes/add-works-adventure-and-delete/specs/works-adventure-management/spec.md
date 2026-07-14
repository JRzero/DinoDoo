## ADDED Requirements

### Requirement: Start an adventure from a work
The H5 SHALL allow the active works card to start a new Story Path session using that work's dinosaur identity.

#### Scenario: Persisted work starts a story
- **WHEN** the user taps the body of a persisted works card
- **THEN** the H5 opens Story Path and creates a play session containing the work's artifact ID, name, description, and image identity

#### Scenario: Local work starts a story
- **WHEN** the user taps a locally stored works card
- **THEN** the H5 opens Story Path and creates a play session using the local work's name and description while retaining its local image for display

#### Scenario: Demo work starts a story
- **WHEN** the user taps a built-in demo works card
- **THEN** the H5 starts Story Path with the corresponding built-in dinosaur

### Requirement: Story uses the selected work dinosaur
The story system SHALL preserve the selected work dinosaur as the active companion for the session and SHALL provide its normalized profile to story generation.

#### Scenario: Custom dinosaur is rendered in Story Path
- **WHEN** Story Path was opened from a work with an image
- **THEN** the story scene displays that image in the dinosaur position with a built-in fallback if loading fails

#### Scenario: Custom dinosaur drives generated narrative
- **WHEN** the backend creates or advances a session started from a work
- **THEN** the story generator receives the normalized custom dinosaur name, species or description, and personality instead of replacing it with a different built-in dinosaur

### Requirement: Delete a work safely
The works carousel SHALL provide a two-step delete control for persisted and local works and SHALL prevent deletion of demo works.

#### Scenario: Persisted work is deleted
- **WHEN** the user taps delete and then confirm on a persisted work
- **THEN** the H5 calls `DELETE /api/v1/artifacts/{id}`, removes the card after success, and clamps the carousel page to the remaining works

#### Scenario: Local work is deleted
- **WHEN** the user confirms deletion of a locally stored work
- **THEN** the H5 removes it from local storage and the carousel without calling the backend

#### Scenario: Delete request fails
- **WHEN** deletion of a persisted work returns an error
- **THEN** the H5 keeps the work visible, resets the confirmation state, and exposes a brief accessible failure status

#### Scenario: Demo work cannot be deleted
- **WHEN** the active card is a built-in demo work
- **THEN** the delete control is not available

