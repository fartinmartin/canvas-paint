import { isTouch } from "./utils/dom";

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

export default class Paint {
  private _options: Options;
  private _canvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;
  private _mode: Mode;
  private _scale: number;
  private _dpr: number;
  private _isDrawing: boolean;
  private _history: {
    steps: [];
    current: number;
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
        size: 1,
        color: "#000000",
        mode: "draw",
      },
      ...options,
    };

    // set locals
    this._canvas = element;
    this._context = this._canvas.getContext("2d");
    this._dpr = options.dpr ? window.devicePixelRatio : 1;
    this._scale = options.displayScale ? this._options.displayScale : 1;

    // set scale
    this._canvas.style.width = this._options.width * this._scale + "px";
    this._canvas.style.height = this._options.height * this._scale + "px";

    this._canvas.width = Math.floor(this._options.width * this._dpr);
    this._canvas.height = Math.floor(this._options.height * this._dpr);
    this._context.scale(this._dpr, this._dpr);

    // set bg
    this._context.fillStyle = this._options.background;
    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

    // set "brush" (should this be left to the user of the lib?)
    this._context.lineCap = this._context.lineJoin = "round";
    this.setColor(this._options.brush.color);
    this.setSize(this._options.brush.size);
    this.setMode("draw");
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

  setMode(mode: Mode) {
    this._mode = mode;
  }

  setSize(size: number) {
    this._context.lineWidth = (size | 0 || 1) * this._dpr;
  }

  setColor(color: string) {
    this._context.strokeStyle = color;
    this._context.fillStyle = color;
  }

  // use this to load artwork (can/should this be alias'd with "load()"?)
  setHistory(history) {
    this._history = history;
  }

  handleEvent(event) {
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
      this._canvas.addEventListener(ev, this, false);
    }
  }

  _unbindEvents() {
    const events = isTouch()
      ? ["touchstart", "touchmove", "touchend", "touchcancel", "gesturestart"]
      : ["mousedown", "mousemove", "mouseup", "mouseout"];

    for (const ev of events) {
      this._canvas.removeEventListener(ev, this, false);
    }
  }

  _drawFrame() {
    // this._timer = requestAnimationFrame(() => this._drawFrame());
    // if (!this._isDrawing) return;
    // const isSameCoords =
    //   this._coords.old.x === this._coords.current.x &&
    //   this._coords.old.y === this._coords.current.y;
    // const currentMid = getMidInputCoords(
    //   this._coords.old,
    //   this._coords.current
    // );
    // const ctx = this._ctx;
    // ctx.beginPath();
    // ctx.moveTo(currentMid.x, currentMid.y);
    // ctx.quadraticCurveTo(
    //   this._coords.old.x,
    //   this._coords.old.y,
    //   this._coords.oldMid.x,
    //   this._coords.oldMid.y
    // );
    // ctx.stroke();
    // this._coords.old = this._coords.current;
    // this._coords.oldMid = currentMid;
    // if (!isSameCoords) this._ev.trigger("draw", this._coords.current);
  }

  _onInputDown(event) {
    this._isDrawing = true;

    // const coords = getInputCoords(event, this._$el);
    // this._coords.current = this._coords.old = coords;
    // this._coords.oldMid = getMidInputCoords(this._coords.old, coords);

    // this._ev.trigger("drawBegin", this._coords.current);
  }

  _onInputMove(event) {
    // this._coords.current = getInputCoords(ev, this._$el);
  }

  _onInputUp() {
    // this._ev.trigger("drawEnd", this._coords.current);
    // this._saveHistory();

    this._isDrawing = false;
  }

  _onInputCancel() {
    if (this._isDrawing) {
      // this._ev.trigger("drawEnd", this._coords.current);
      // this._saveHistory();
    }

    this._isDrawing = false;
  }

  _saveHistory() {
    // this._history.save(this.toDataURL());
    // this._ev.trigger("save", this._history.value);
  }
}
