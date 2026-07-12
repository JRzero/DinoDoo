## ADDED Requirements

### Requirement: Child primary navigation
The H5 SHALL present exactly three primary child destinations for Park, Hatch, and Works in that order, rendered with the product's localized labels.

#### Scenario: Home route is shown
- **WHEN** the child opens the home or story route
- **THEN** the Park navigation entry is present and represents the active child destination

#### Scenario: Hatch route is selected
- **WHEN** the child selects Hatch
- **THEN** the H5 navigates to the hatch route

#### Scenario: Works route is selected
- **WHEN** the child selects Works
- **THEN** the H5 navigates to the works gallery route

### Requirement: Child navigation artwork
The H5 MUST render a standalone park icon for Park and preserve consistent icon alignment and proportions across all three navigation entries.

#### Scenario: Navigation is rendered
- **WHEN** any child-facing route is displayed at the 390 x 844 stage
- **THEN** the park, hatch, and works icons are centered in their respective navigation columns without overlap or distortion

### Requirement: Parent screen excluded from child navigation
The H5 SHALL NOT expose the parent settings screen as a primary child navigation destination.

#### Scenario: Child navigation is displayed
- **WHEN** the bottom navigation is visible
- **THEN** no Parent navigation label or parent icon is displayed
