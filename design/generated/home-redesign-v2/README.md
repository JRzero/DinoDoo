# Home Redesign V2

This folder keeps the second-pass H5 home art direction based on the selected first concept.

## Selected Direction

- `selected-concept.png` is the visual benchmark selected by the user.
- `assembly-preview.png` is a quick layered preview assembled from the new runtime assets.
- `selected-vs-assembly.png` compares the selected benchmark with the first layered assembly.

## Runtime Assets

Runtime-ready assets are mirrored in:

```text
apps/h5/assets/game-elements/home-redesign-v2/
```

Current assets:

- `background-clean.png`
- `dino-xiaobao.png`
- `dino-adai.png`
- `dino-gulu.png`
- `pedestal-center.png`
- `pedestal-left.png`
- `pedestal-right.png`
- `badge-orange.png`
- `badge-coral.png`
- `badge-teal.png`

## Notes

- The background is intentionally clean: no dinosaurs, no badges, no title, no bottom navigation.
- Character, pedestal, and badge assets are transparent PNG layers.
- The next implementation step should wire these assets into the H5 home page as layered components, then tune coordinates against `selected-concept.png`.
