# Design QA

final result: blocked

## Target

- Reference: `design/generated/home-redesign-v2/selected-concept.png`
- Implemented screen: H5 home route, `http://127.0.0.1:5177/#home`

## Checks Completed

- `node --check apps/h5/app.js` passed.
- Static H5 server returned `200 OK` for `/`.
- Runtime asset path returned `200 OK` for `assets/game-elements/home-redesign-v2/background-clean.png`.
- Browser screenshot before the last coordinate adjustment was captured at `qa/browser/h5-home-v2.png`.
- Coordinate preview after the last adjustment was generated at `qa/browser/h5-home-v2-coordinate-preview.png`.

## Blocker

The final browser screenshot after the last coordinate adjustment could not be recaptured because launching Chrome was blocked by the environment usage limit.

## Visual Notes

- The H5 home page now uses the `home-redesign-v2` clean background, dinosaur sprites, pedestals, and badges.
- The lower dinosaurs were adjusted so their feet sit on their round pedestals.
- The lower dinosaurs were moved down after the first screenshot so the right dinosaur no longer crowds the center badge.

## Follow-Up

Run one more browser screenshot when Chrome execution is available again, then compare it against `selected-concept.png` and `qa/browser/h5-home-v2-coordinate-preview.png`.
