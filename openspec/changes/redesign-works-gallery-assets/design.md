## Context

The current works page combines a tropical workshop background with flat placeholder board and card assets. Home and Hatch now use a stronger shared system: DinoDoo logo, wooden subtitle plaque, cream clay surfaces, warm orange accents, and independent transparent components.

## Goals / Non-Goals

**Goals:**

- Reuse the shared logo, subtitle plaque, green primary button, and stitched orange badge.
- Introduce independent transparent cabinet, featured-card, and compact-card assets.
- Preserve the live three-item works composition and existing refresh behavior.
- Keep every component aligned on the fixed 390 x 844 stage.

**Non-Goals:**

- Redesigning the bottom navigation or works backend.
- Generating a full-page screenshot asset.
- Changing artifact persistence or card ordering.

## Decisions

### Reuse established shared assets

The logo, subtitle plaque, music control, stitched badge, and green button come from the same runtime asset family already used by Home and Hatch. This gives immediate visual continuity and reduces duplicate assets.

### Generate only the missing independent surfaces

Create three new transparent assets: a large cream-clay cabinet, one wide featured card, and one portrait compact card. Runtime code continues to layer dinosaurs and text above these surfaces.

### Keep text out of generated assets

Page title, featured label, work names, prompts, and refresh label remain runtime text. This keeps Chinese text crisp and avoids regenerating assets when copy changes.

## Risks / Trade-offs

- [Generated cards contain baked visual noise] -> require empty display and text areas with no characters or text.
- [Components distort at runtime] -> generate assets close to target aspect ratios and render with stable dimensions.
- [Dynamic text overflows] -> keep one-line clamps and shorten preview prompts at render time.