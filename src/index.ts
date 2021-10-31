import Paint from "./paint";

export const canvasPaint = (element, options): Paint => {
  if (!(element instanceof HTMLCanvasElement))
    throw new TypeError("HTMLCanvasElement must be passed as first argument!");

  const p = new Paint(element, options);
  return p;
};

// get <canvas> element
//
// state
// ├─ canvasOptions
// ├─ drawing
// ├─ mode
// ├─ size
// ├─ color
//
// handle()
// ├─ draw()
// ├─ erase()
// ├─ fill()
//
// history()
// ├─ undo()
// ├─ redo()
// ├─ clear()
//
// return (?) context so that I can manipulate it as I wish
