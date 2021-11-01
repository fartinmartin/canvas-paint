import { isTouch, getInputCoords } from "./utils/dom";
import { Eve } from "./utils/eve";

interface Options {
  width?: number;
  height?: number;
  dpr?: boolean;
  displayScale?: number;
  background?: string;
  brush?: {
    size?: number;
    color?: string;
    mode?: Mode;
  };
}

type Mode = "draw" | "erase" | "fill";

type Point = {
  coords: { x: number; y: number };
  size: number; // these could theoretically change mid-path
  color: number; // these could theoretically change mid-path
};

type Path = {
  points: Point[];
  mode: Mode;
};

export default class Paint {
  private _canvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;
  private _options: Options;

  private _scale: number;
  private _dpr: number;

  private _mode: Mode;
  private _isDrawing: boolean;
  private _eve: Eve;
  private _timer: any;

  private _coords: {
    past: { x: number; y: number };
    current: { x: number; y: number };
  };

  private _history: {
    past: [];
    present: number;
    future: [];
    meta: {
      scale: number;
      date: Date;
    };
  };

  constructor(element: HTMLCanvasElement, options: Options) {
    // merges options with defaults
    this._options = {
      width: 100,
      height: 100,
      dpr: true,
      displayScale: 1,
      background: "white",
      brush: {
        size: 3,
        color: "#000000",
        mode: "draw",
      },
      ...options,
    };

    // set locals
    this._canvas = element;
    this._context = this._canvas.getContext("2d");
    this._timer = null;

    this._dpr = options.dpr ? window.devicePixelRatio : 1;
    this._scale = options.displayScale ? this._options.displayScale : 1;

    this._eve = new Eve();

    this._isDrawing = false;
    this._coords = {
      past: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
    };

    // set scale
    this._canvas.style.width = this._options.width * this._scale + "px";
    this._canvas.style.height = this._options.height * this._scale + "px";

    this._canvas.width = Math.floor(this._options.width * this._dpr);
    this._canvas.height = Math.floor(this._options.height * this._dpr);
    this._context.scale(this._dpr, this._dpr);

    // set bg
    this.clear();
    this._canvas.style.background = this._options.background;

    // set "brush" (should this be left to the user of the lib?)
    this._context.lineCap = this._context.lineJoin = "round";
    this.setColor(this._options.brush.color);
    this.setSize(this._options.brush.size);
    this.setMode("draw");

    this._bindEvents();
    this._drawFrame();
  }

  get canvas() {
    return this._canvas;
  }

  get context() {
    return this._context;
  }

  get history() {
    return this._history;
  }

  get observer() {
    return this._eve; // this is really cool
  }

  setMode(mode: Mode) {
    this._mode = mode;
    this._context.globalCompositeOperation =
      this._mode === "erase" ? "destination-out" : "source-over";
  }

  setSize(size: number) {
    this._context.lineWidth = ((size | 0 || 1) * this._dpr) / this._scale;
  }

  setColor(color: string) {
    this._context.strokeStyle = color;
    this._context.fillStyle = color;
  }

  // use this to load artwork (can/should this be alias'd with "load()"?)
  setHistory(history) {
    this._history = history;
  }

  _handleEvents(event) {
    event.preventDefault();
    event.stopPropagation();

    switch (event.type) {
      case "mousedown":
      case "touchstart":
        this._onInputDown(event);
        break;
      case "mousemove":
      case "touchmove":
        this._onInputMove(event);
        break;
      case "mouseup":
      case "touchend":
        this._onInputUp();
        break;
      case "mouseout":
      case "touchcancel":
      case "gesturestart":
        this._onInputCancel();
        break;
      default:
    }
  }

  _bindEvents() {
    const events = isTouch()
      ? ["touchstart", "touchmove", "touchend", "touchcancel", "gesturestart"]
      : ["mousedown", "mousemove", "mouseup", "mouseout"];

    for (const ev of events) {
      this._canvas.addEventListener(ev, (e) => this._handleEvents(e), false);
    }
  }

  _unbindEvents() {
    const events = isTouch()
      ? ["touchstart", "touchmove", "touchend", "touchcancel", "gesturestart"]
      : ["mousedown", "mousemove", "mouseup", "mouseout"];

    for (const ev of events) {
      this._canvas.removeEventListener(ev, (e) => this._handleEvents(e), false);
    }
  }

  _drawFrame() {
    this._timer = requestAnimationFrame(() => this._drawFrame());

    if (!this._isDrawing) return;

    const isSameCoords =
      this._coords.past.x === this._coords.current.x &&
      this._coords.past.y === this._coords.current.y;

    const ctx = this._context;
    const coords = this._coords;

    if (this._mode !== "fill") {
      ctx.beginPath();
      ctx.moveTo(coords.past.x, coords.past.y);
      ctx.lineTo(coords.current.x, coords.current.y);
      ctx.stroke();
    } else {
      this._fill();
    }

    this._coords.past = this._coords.current;
  }

  _onInputDown(event) {
    this._isDrawing = true;
    this._drawBegin(event);
  }

  _onInputMove(event) {
    if (this._isDrawing) this._drawing(event);
  }

  _onInputUp() {
    this._drawEnd();
    this._isDrawing = false;
  }

  _onInputCancel() {
    if (this._isDrawing) this._drawEnd();
    this._isDrawing = false;
  }

  _drawBegin(event) {
    const coords = getInputCoords(event, this._canvas);
    this._coords.current = this._coords.past = coords;
    this._eve.trigger("drawBegin", this._coords.current);
  }

  _drawing(event) {
    this._coords.current = getInputCoords(event, this._canvas);

    if (this._mode !== "fill") {
      this._eve.trigger("drawing", this._coords.current);
      // TODO: should push a Point to [???] on every event (using history.ts ?)
    } else {
      // TODO: should push a Point to [???] on first event (using history.ts ?)
    }
  }

  _drawEnd() {
    this._eve.trigger("drawEnd", this._coords.current);
    this._saveHistory();
    // TODO: should push an Point[] + brush mode to [???] on every event (using history.ts ?)
  }

  _fill() {
    this._isDrawing = false;
    console.log("fill");
    // TODO: implement flood fill
  }

  _saveHistory() {
    // this._history.save(this.toDataURL());
    // this._ev.trigger("save", this._history.value);
  }

  clear() {
    this._context.fillStyle = this._options.background;
    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
    this._saveHistory(); // TODO: should push a [???] to [???] on event (using history.ts ?)
  }
}
