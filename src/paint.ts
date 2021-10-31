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

    // set "brush"
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
}
