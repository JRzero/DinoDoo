## ADDED Requirements

### Requirement: Unified works gallery composition
The H5 SHALL compose the works gallery from independent runtime assets that match the cream-clay, wooden-plaque, and tropical visual language used by Home and Hatch.

#### Scenario: Works page is displayed
- **WHEN** the child opens the Works route
- **THEN** the page displays the shared DinoDoo logo, wooden Works subtitle, cream display cabinet, and consistent clay card surfaces

### Requirement: Dynamic works remain readable
The H5 MUST render work dinosaurs, names, descriptions, and featured state separately from the background and card assets.

#### Scenario: Three works are available
- **WHEN** the gallery receives three or more works
- **THEN** the newest work is rendered in one featured card and the next two works are rendered in compact cards without clipped names or overlapping controls

### Requirement: Existing works interaction is preserved
The H5 SHALL preserve the works refresh action and fixed bottom navigation while replacing only the gallery visual composition.

#### Scenario: Child refreshes works
- **WHEN** the child selects the refresh control
- **THEN** the H5 reloads works and keeps the child on the Works route