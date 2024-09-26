import { Coordinates, LazyBrush } from "lazy-brush"; // @ts-ignore
import { Catenary } from "catenary-curve";
import { EventEmitter } from "./events";
import { Point } from "./point";
import { getInputCoords } from "../utils/input";

export type Mode = "draw" | "erase" | "fill";
export type Cap = "butt" | "round" | "square";
export type Join = "round" | "bevel" | "miter";
export type BrushPayload = ReturnType<() => Brush["payload"]>;

export type BrushOptions = {
	brush?: {
		size?: number;
		color?: string;
		mode?: Mode;
		cap?: Cap;
		join?: Join;
		tolerance?: number;
	};
	lazy?: {
		radius?: number;
		enabled?: boolean;
		initialPoint?: Coordinates;
	};
};

type InputEventKeys = keyof {
	[K in keyof HTMLElementEventMap as HTMLElementEventMap[K] extends
		| MouseEvent
		| TouchEvent
		? K
		: never]: HTMLElementEventMap[K];
};

export class Brush {
	public events = new EventEmitter();
	private _isDrawing = false;

	private _size: number;
	private _color: string;
	private _mode: Mode;
	private _cap: Cap;
	private _join: Join;
	private _tolerance: number;

	private _lazy: LazyBrush;
	private _listeners: {
		event: InputEventKeys;
		handler: (event: MouseEvent | TouchEvent) => void;
	}[] = [];

	constructor(private root: HTMLElement, options: BrushOptions) {
		this._lazy = new LazyBrush({
			radius: options.lazy?.radius ?? 0,
			enabled: options.lazy?.enabled ?? true,
			initialPoint: options.lazy?.initialPoint ?? { x: 0, y: 0 },
		});

		this._size = options.brush?.size ?? 5;
		this._color = options.brush?.color ?? "#ffaa00";
		this._mode = options.brush?.mode ?? "draw";
		this._cap = options.brush?.cap ?? "round";
		this._join = options.brush?.join ?? "round";
		this._tolerance = options.brush?.tolerance ?? 30;

		this._listeners = [
			{ event: "mousedown", handler: this.handleDown },
			{ event: "touchstart", handler: this.handleDown },
			//
			{ event: "mouseup", handler: this.handleUp },
			{ event: "touchend", handler: this.handleUp },
			//
			{ event: "mousemove", handler: this.handleMove },
			{ event: "touchmove", handler: this.handleMove },
			//
			// TODO: consider window events, in order to let drawing continue past canvas el (perhaps with a limit of lazy.radius?)
			{ event: "mouseleave", handler: this.handleLeave },
			{ event: "touchcancel", handler: this.handleLeave },
		];

		this._listeners.forEach(({ event, handler }) =>
			this.root.addEventListener(event, handler.bind(this))
		);
	}

	removeAllListeners() {
		this._listeners.forEach(({ event, handler }) =>
			this.root.removeEventListener(event, handler.bind(this))
		);
	}

	get isDrawing() {
		return this._isDrawing;
	}

	get size() {
		return this._size;
	}

	set size(value: number) {
		if (value > 0) this._size = value;
		this.events.dispatch("brushUpdate", this.payload);
	}

	get color() {
		return this._color;
	}

	set color(value: string) {
		// if color2k can parse..
		this._color = value;
		this.events.dispatch("brushUpdate", this.payload);
	}

	get mode() {
		return this._mode;
	}

	set mode(value: Mode) {
		this._mode = value;
		this.events.dispatch("brushUpdate", this.payload);
	}

	get cap() {
		return this._cap;
	}

	set cap(value: Cap) {
		this._cap = value;
		this.events.dispatch("brushUpdate", this.payload);
	}

	get join() {
		return this._join;
	}

	set join(value: Join) {
		this._join = value;
		this.events.dispatch("brushUpdate", this.payload);
	}

	get tolerance() {
		return this._tolerance;
	}

	set tolerance(value: number) {
		this._tolerance = value;
		this.events.dispatch("brushUpdate", this.payload);
	}

	get lazy() {
		// we need access to our LazyBrush (at least the x and y values), but we don't want to allow anyone to change settings w/o us knowing!
		return this._lazy;
	}

	// set lazy(options: {}) {
	// 	// TODO: how to do this? 🤔
	// 	this._lazy;
	// }

	private get point() {
		const { x, y } = this._lazy.brush.toObject();
		return new Point(x, y, this.color, this.size);
	}

	get payload() {
		return {
			isDrawing: this.isDrawing,
			mode: this.mode,
			cap: this.cap,
			point: this.point,
		};
	}

	private handleMove(this: Brush, event: MouseEvent | TouchEvent) {
		event.preventDefault(); // don't scroll on iOS
		const coords = getInputCoords(event, this.root);
		this._lazy.update(coords);
		this.events.dispatch("move", this.payload);
	}

	private handleDown(this: Brush, event: MouseEvent | TouchEvent) {
		event.preventDefault();
		const coords = getInputCoords(event, this.root);
		this._lazy.update(coords);
		this._isDrawing = true;
		this.events.dispatch("down", this.payload);
	}

	private handleUp(this: Brush, event: MouseEvent | TouchEvent) {
		event.preventDefault();
		this._isDrawing = false;
		this.events.dispatch("up", this.payload);
	}

	private handleLeave(this: Brush, event: MouseEvent | TouchEvent) {
		event.preventDefault();
		this._isDrawing = false;
		this.events.dispatch("leave", this.payload);
	}
}
