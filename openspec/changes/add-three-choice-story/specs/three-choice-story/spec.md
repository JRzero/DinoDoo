## ADDED Requirements

### Requirement: Exactly three story choices
The story engine SHALL return exactly three short child-friendly choices on every assistant turn.

#### Scenario: Story session starts
- **WHEN** the client creates a new play session
- **THEN** the initial assistant turn and story state contain exactly three choices

#### Scenario: Child submits a story choice
- **WHEN** the client submits a choice or short text to the turn endpoint
- **THEN** the next assistant turn and updated story state contain exactly three choices

#### Scenario: Safety fallback is returned
- **WHEN** child input triggers a safety or privacy guard
- **THEN** the safe fallback turn contains exactly three choices

### Requirement: Dynamic three-choice H5 controls
The H5 story screen SHALL render three equal-size choice controls from the current backend turn.

#### Scenario: Story choices are displayed
- **WHEN** the H5 receives a turn containing three choices
- **THEN** all three labels are visible in separate tappable controls without baked text

#### Scenario: Child selects an answer
- **WHEN** the child taps any of the three controls
- **THEN** the selected label is submitted to the backend and the next text and three choices replace the current turn

### Requirement: Balanced story character layout
The H5 story screen SHALL keep the active dinosaur secondary to dialog and answer controls.

#### Scenario: Story screen renders
- **WHEN** a story turn is displayed on a 390x844 viewport
- **THEN** the dinosaur does not overlap the speech bubble, voice control, or three answer controls