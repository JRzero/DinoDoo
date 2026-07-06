## ADDED Requirements

### Requirement: Native WeChat Mini Game runtime
The system SHALL provide a native WeChat Mini Game target that starts from `game.js` and renders the MVP through Canvas rather than WXML/WXSS pages or H5 DOM.

#### Scenario: Mini Game project opens
- **WHEN** a developer opens the Mini Game project directory in WeChat DevTools
- **THEN** the project exposes `game.js`, `game.json`, and `project.config.json` at the Mini Game root

#### Scenario: No Mini Program page dependency
- **WHEN** the Mini Game runtime starts
- **THEN** it SHALL NOT require WXML, WXSS, or Mini Program page lifecycle files to render the MVP scenes

### Requirement: Clean scene backgrounds
The system SHALL treat each scene background as a clean environment image that excludes dinosaurs, eggs, icons, buttons, panels, labels, and bottom navigation components.

#### Scenario: Background manifest separation
- **WHEN** the asset manifest is inspected
- **THEN** scene backgrounds SHALL be declared under background-specific IDs separate from all character, prop, button, icon, panel, and navigation sprite IDs

#### Scenario: Scene composition uses sprites
- **WHEN** a scene is rendered
- **THEN** dinosaur characters, eggs, buttons, icons, panels, labels, and bottom navigation items SHALL be drawn as independent sprites or UI primitives over the clean background

### Requirement: Separately designed interactive icons and buttons
The system SHALL model every bottom-nav icon, action icon, button, egg, dinosaur, and panel as an independently addressable asset or draw primitive with its own layout metadata.

#### Scenario: Bottom nav button consistency
- **WHEN** bottom navigation is rendered in any scene
- **THEN** it SHALL use three equal hit areas and independently placed icon sprites for works, hatch, and parent actions

#### Scenario: Icon replacement without scene redraw
- **WHEN** a nav icon asset is replaced in the manifest
- **THEN** clean backgrounds and unrelated scene sprites SHALL NOT need to change

### Requirement: Scene navigation and interaction
The system SHALL provide home, story, hatch, works, and parent scenes with touch-based navigation and functional MVP controls.

#### Scenario: Fixed bottom navigation
- **WHEN** the player switches between story, hatch, works, and parent scenes
- **THEN** the bottom navigation SHALL remain fixed in position, size, and interaction behavior

#### Scenario: Return to home
- **WHEN** the player taps the home/title affordance from an inner scene
- **THEN** the active scene SHALL return to home without losing selected dinosaur state

### Requirement: Voice and image services
The system SHALL wrap WeChat Mini Game voice recording, media selection, upload, storage, and backend API calls behind service modules.

#### Scenario: Voice recording request
- **WHEN** the player taps the voice affordance
- **THEN** the game SHALL use the recorder service to start or stop `wx.getRecorderManager()` recording through an adapter

#### Scenario: Image selection request
- **WHEN** the player taps the image affordance in the hatching flow
- **THEN** the game SHALL use the media service to call `wx.chooseMedia()` and upload selected media through the backend adapter

### Requirement: Prompt-based hatching flow
The system SHALL allow the player to hatch a custom dinosaur from prompt text, optional voice context, and optional image context while keeping generated records available in the works scene.

#### Scenario: Hatch from prompt
- **WHEN** the player submits a hatching prompt
- **THEN** the game SHALL call the hatch service, show a progress state, save the resulting dinosaur locally, and make it visible in the works scene

#### Scenario: Child-safe generated content
- **WHEN** hatch or story content is requested
- **THEN** the client SHALL call backend APIs that apply child-safety constraints rather than directly calling AI providers from the Mini Game
