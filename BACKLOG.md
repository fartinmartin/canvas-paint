# Backlog

## `margin` option — draw past/to the edge

Add `margin?: number` (in document units, consistent with `width`/`height`) to `CanvasOptions`. This extends the canvas beyond the document boundary so users can draw into the margin area. Also covers the use case where the canvas fills the full page but the document is a specific centered dimension.

### What changes

| Concern | Change |
|---|---|
| `scale` getter (`Canvas` + `Paint`) | Divide by `(width + margin*2)` instead of `width` — keeps scale = 1 at default size, document area occupies CSS px `[margin..margin+width]` |
| `createInstanceStyles` | `max-width: (width+margin*2)px`, `aspect-ratio: (width+margin*2)/(height+margin*2)` |
| `setSize` / canvas resize | Pass `{ width: width+margin*2, height: height+margin*2 }` to `canvas.resize()` |
| `Grid` | Draw document-boundary rect at `(margin*scale, margin*scale)` sized `(width*scale) × (height*scale)` in CSS px (× dpr for canvas context) |
| `toBlob` / `toVideo` | Crop source to `(margin*scale*dpr, margin*scale*dpr, width*scale*dpr, height*scale*dpr)` on the artboard canvas |
| `save` | Include `margin` in the saved payload |
| `load` | Apply margin offset to loaded points (see below) |

### Load-time margin offset

Points are stored in CSS px at draw time (`path.scale` = the `drawnAt` scale). When a drawing saved with one margin is loaded with a different margin, shift each point by `marginDelta * path.scale` before the normal `scalePath` math runs:

```typescript
const savedMargin = margin ?? 0; // default 0 for old saves
const marginDelta = (this.options.margin ?? 0) - savedMargin;

if (marginDelta !== 0) {
  paths = paths.map(path => ({
    ...path,
    points: path.points.map(p => ({
      ...p,
      x: p.x + marginDelta * path.scale,
      y: p.y + marginDelta * path.scale,
    }))
  }));
}
```

This handles old saves (no `margin` field → defaults to `0`) and drawings saved with a different margin value.

## `toVideo`: offscreen recording (no visible playback)

Currently `toVideo` draws to the live `artboard` and `temp` canvases via `replayHistory`, so the animation is always visible to the user before the download.

To fix: `replayHistory` would need to draw to offscreen canvases instead, and the `composite` loop in `toVideo` would read from those rather than `this.artboard.canvas` / `this.temp.canvas`. Meaningful refactor since `replayHistory` is currently tightly coupled to the live canvases.
