# canvas-paint

## Install

```
npm i canvas-paint
```

## Usage

```js
import { Paint } from "canvas-paint";

const root = document.getElementById("root");
const paint = new Paint(root, { width: 200, height: 200 });
```

## Options

```ts
new Paint(root, {
  // Canvas
  width: 200,           // document width in px
  height: 200,          // document height in px
  bgColor: undefined,   // CSS color string; sets background of root element
  margin: 0,            // drawable area beyond document boundary (in document units)
  debounce: 500,        // ms delay for ResizeObserver

  // Brush
  brush: {
    size: 5,            // stroke width
    color: "#ffaa00",   // CSS color string
    mode: "draw",       // "draw" | "erase" | "fill"
    cap: "round",       // "butt" | "round" | "square"
    join: "round",      // "round" | "bevel" | "miter"
    tolerance: 30,      // point simplification tolerance
  },

  // Lazy brush
  lazy: {
    radius: 0,          // lazy radius in px (0 = disabled)
    enabled: true,
    lerpFactor: 1,      // multiplier on how far you must draw before reaching full radius
  },

  // UI overlay (brush preview, pointer, chain)
  ui: {
    show: true,
    brush: true,        // show brush size/shape preview at brush position
    pointer: {
      show: true,
      size: 8,
      color: "#000000",
    },
    center: {
      show: true,
      size: 4,
      color: "#000000",
    },
    chain: {
      show: false,      // catenary chain between pointer and brush (requires lazy.radius > 0)
      dash: [2, 4],
      width: 2,
      color: "#000000",
    },
  },

  // Grid / boundary overlay
  grid: {
    show: true,
    lines: {
      show: false,      // grid lines (default off)
      size: 50,         // spacing in document units
      color: "rgba(0, 0, 0, 0.15)",
    },
    boundary: {
      show: true,       // document boundary rect (default on when margin > 0)
      dash: [4, 4],
      width: 1,
      color: "rgba(0, 0, 0, 0.2)",
    },
  },
});
```

## Brush settings

Brush settings can be read and written directly at any time:

```js
paint.brush.size = 10;
paint.brush.color = "red";
paint.brush.mode = "erase";
paint.brush.cap = "square";
paint.brush.join = "bevel";
paint.brush.tolerance = 20;
paint.brush.radius = 40;      // lazy radius
paint.brush.lerpFactor = 2;
```

## Methods

```js
paint.undo()
paint.redo()
paint.clear()
paint.destroy()

paint.setSize(width, height)  // resize the document
paint.setMargin(margin)       // update margin and shift existing paths

// Playback options: { delay?: number (ms per point) } or { duration?: number (total ms) }
paint.drawHistory(options?)               // redraws all paths; animates if delay/duration given
paint.save()                              // returns a serializable Drawing object
await paint.load(drawing, options?)       // clears and replays a saved Drawing

await paint.toBlob(type?, quality?)       // exports document area as Blob
await paint.toVideo(options?)             // records drawHistory to a webm Blob; accepts fps too

paint.removeListeners()                   // detach all input event listeners
```

## Properties

```js
paint.history.canUndo   // boolean
paint.history.canRedo   // boolean
paint.scale             // current CSS px per document unit
paint.aspectRatio       // width / height (including margin)
paint.path              // the Path currently being drawn
```

## Events

Subscribe via `paint.events.on(event, handler)`.

| event          | description                                      |
| -------------- | ------------------------------------------------ |
| `start`        | pointer down, drawing began                      |
| `draw`         | pointer move while drawing                       |
| `end`          | pointer up, path committed                       |
| `leave`        | pointer left canvas while drawing, path committed |
| `resizing`     | ResizeObserver fired, resize in progress         |
| `resized`      | resize and history redraw complete               |
| `drawing`      | `drawHistory` started                            |
| `drawingPath`  | each path committed during animated playback     |
| `drawn`        | `drawHistory` complete                           |
