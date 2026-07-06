## ADDED Requirements

### Requirement: Prompt-based dinosaur hatching screen
The system SHALL provide a mobile H5 `孵化` screen where a user can describe the little dinosaur they want and hatch a local dinosaur result.

#### Scenario: User hatches a dinosaur from a prompt
- **WHEN** the user enters a dinosaur description and taps the hatch action
- **THEN** the app creates a local hatched dinosaur result and confirms the hatch to the user

#### Scenario: User builds a prompt from chips
- **WHEN** the user taps an example prompt chip
- **THEN** the chip text is added to the dinosaur description prompt

#### Scenario: User describes a dinosaur by voice
- **WHEN** browser speech recognition is available and the user taps the hatch voice control
- **THEN** the recognized text fills the hatch prompt
- **AND** the user can hatch from that prompt

### Requirement: Hatching results in gallery
The system SHALL show locally hatched dinosaurs in the artwork/gallery experience alongside generated card artifacts.

#### Scenario: Hatched dinosaur appears in works
- **WHEN** the user hatches a dinosaur
- **THEN** the artwork/gallery screen includes that hatched dinosaur with its prompt description

### Requirement: Hatch-centered main navigation
The system SHALL use `作品 / 孵化 / 家长` as the main H5 bottom navigation labels for the selected product direction.

#### Scenario: User taps hatch navigation
- **WHEN** the user taps the middle bottom navigation entry
- **THEN** the H5 app opens the prompt-based hatching screen
