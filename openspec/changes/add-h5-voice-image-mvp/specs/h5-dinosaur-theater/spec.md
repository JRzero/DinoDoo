## ADDED Requirements

### Requirement: Mobile H5 baby play screen
The system SHALL provide a mobile-first H5 play screen where a child can see the current dinosaur speaker, hear or read a short line, and choose between exactly two large choices for each active story turn.

#### Scenario: Child starts a story session
- **WHEN** the H5 app starts a new play session
- **THEN** the screen displays the active dinosaur, a short dinosaur line, and two large choices

#### Scenario: Child selects a choice
- **WHEN** the child taps one of the two choices
- **THEN** the app submits the choice as the next turn input and renders the next dinosaur response

### Requirement: Parent settings screen
The system SHALL provide a parent settings screen for theme selection, daily time limit, image generation toggle, voice toggle, and local record controls.

#### Scenario: Parent updates settings
- **WHEN** the parent changes settings and saves
- **THEN** the backend persists the settings and future sessions use those settings

### Requirement: Artifact gallery
The system SHALL provide an H5 artifact gallery where generated dino cards can be viewed and deleted.

#### Scenario: Parent views generated cards
- **WHEN** at least one dino card artifact exists
- **THEN** the gallery displays the card title, image, status, and creation time

#### Scenario: Parent deletes a card
- **WHEN** the parent deletes an artifact
- **THEN** the artifact no longer appears in the gallery

### Requirement: No mobile shell dependency
The H5 MVP SHALL run in a normal browser without requiring an Expo or native mobile shell.

#### Scenario: User opens H5 in browser
- **WHEN** the user opens the H5 URL in a supported browser
- **THEN** the play, parent settings, and artifact gallery screens are usable without a native app
