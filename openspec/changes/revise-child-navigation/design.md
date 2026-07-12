## Context

The fixed 390 x 844 H5 stage uses a 160 px bottom navigation layer shared by every child-facing route. The current left tab is visually labelled Works but routes to Home, while the right tab exposes Parent settings. This makes the navigation contract inconsistent and places an adult surface in the child's primary path.

## Goals / Non-Goals

**Goals:**

- Present exactly three child-facing destinations: Park, Hatch, and Works.
- Give the home destination a distinct transparent icon that matches the existing soft-clay navigation family.
- Reuse the existing hatch and works icons without altering their proportions.
- Keep home and story routes under the same Park tab state.

**Non-Goals:**

- Removing the parent settings screen or backend APIs.
- Redesigning the full bottom navigation background.
- Changing hatch or works page content.

## Decisions

### Use semantic navigation button IDs

Rename the interactive IDs to `homeTab`, `hatchTab`, and `worksTab`. Route mappings and event bindings then describe their actual destinations, avoiding the current mismatch where `galleryTab` opens Home.

Alternative: keep the old IDs and change only labels. Rejected because future maintenance would continue to confuse visual labels with behavior.

### Remove Parent only from the child navigation

The parent route and screen remain implemented for future guarded access, but no primary child tab points to it. This keeps the requested child experience focused without deleting existing settings functionality.

### Add a standalone transparent park icon

The new `navHome.png` asset is composed independently on the existing navigation background. It is rendered at the same stable footprint as the existing works icon so the three columns remain visually balanced.

## Risks / Trade-offs

- [Generated icon feels larger than neighboring icons] -> use contain sizing and verify visible alpha bounds at the 390 x 844 runtime stage.
- [Old cached markup keeps prior labels] -> version the H5 script and stylesheet resources.
- [Parent route becomes undiscoverable] -> retain direct hash routing while removing only the primary child tab.
