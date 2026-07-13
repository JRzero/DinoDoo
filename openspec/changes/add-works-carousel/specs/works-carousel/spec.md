## ADDED Requirements

### Requirement: Works are browsed one at a time
The H5 SHALL display one saved dinosaur as the focused work with its name and description in a fixed, readable card.

#### Scenario: Works page has multiple items
- **WHEN** the child opens the Works route with two or more works
- **THEN** exactly one focused dinosaur is displayed without overlapping the title, controls, refresh action, or navigation

### Requirement: Child can page through every work
The H5 MUST provide previous and next controls that change the focused work and wrap at collection boundaries.

#### Scenario: Child advances from the final work
- **WHEN** the child selects next while the final work is focused
- **THEN** the first work becomes focused

#### Scenario: Child goes back from the first work
- **WHEN** the child selects previous while the first work is focused
- **THEN** the final work becomes focused

### Requirement: Paging position is visible
The H5 SHALL show the focused position and total work count, plus a visual active-page indicator.

#### Scenario: Focused work changes
- **WHEN** a paging control changes the focused work
- **THEN** the counter, active indicator, dinosaur, name, and description update together

### Requirement: Refresh preserves a valid page
The H5 MUST clamp the focused page after refreshed data changes.

#### Scenario: Refresh returns fewer works
- **WHEN** the current page no longer exists after refresh
- **THEN** the H5 focuses the nearest valid page and remains on the Works route
