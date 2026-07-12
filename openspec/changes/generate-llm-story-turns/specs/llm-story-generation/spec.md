## ADDED Requirements

### Requirement: Model-generated story turns
The backend SHALL request the initial story question and each subsequent story turn from a configured LLM using the selected dinosaur, scene, goal, recent story context, and selected choice.

#### Scenario: Story session starts with a configured model
- **WHEN** a child starts a story and the LLM provider is configured
- **THEN** the initial assistant turn contains model-generated story text and exactly three choices

#### Scenario: A choice advances the same story
- **WHEN** the child selects one of the current choices
- **THEN** the backend sends the recent story context and selected choice to the model and returns a coherent next story beat

#### Scenario: A new model question is requested
- **WHEN** the backend requests an opening or follow-up story question
- **THEN** the request includes fresh creative entropy and anti-repetition sampling controls

### Requirement: Strict child story output
The backend MUST accept only generated turns containing age-appropriate child-friendly story text and exactly three non-empty, distinct choices within the configured display limits.

#### Scenario: Valid structured output
- **WHEN** the model returns valid structured story text and three distinct choices that may contain complete phrases
- **THEN** the backend stores and returns that turn

#### Scenario: Invalid or unsafe output
- **WHEN** the model output is malformed, too long, unsafe, or does not contain exactly three valid choices
- **THEN** the backend discards it and returns a safe deterministic fallback turn

### Requirement: Bounded provider behavior
The backend SHALL keep model credentials server-side and SHALL bound provider calls with a configurable timeout.

#### Scenario: Provider is unavailable
- **WHEN** credentials are absent, the provider times out, or the provider returns an error
- **THEN** the story continues with a safe local fallback without exposing provider details to the H5 client

### Requirement: Choice-only story interaction
The H5 story screen SHALL present story text and exactly three generated choices without speech or free-text story controls.

#### Scenario: Story screen is ready
- **WHEN** a story turn is displayed
- **THEN** the child sees a large left-aligned story question with comfortable line spacing and can continue only by selecting one of three vertically stacked full-width answer rows with readable wrapped text

#### Scenario: Next turn is loading
- **WHEN** a selected choice is awaiting the next model-generated turn
- **THEN** all three choices are disabled and a child-friendly loading message is shown
