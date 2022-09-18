import { LazyBrush } from "lazy-brush"; // @ts-ignore
import { Catenary } from "catenary-curve";

export type Mode = "draw" | "erase" | "fill";
export type Cap = "butt" | "round" | "square";
export type Join = "round" | "bevel" | "miter";

export type BrushOptions = {};
export type BrushUpdate = {
	isPressing: boolean;
};

export class Brush {
	private subscribers: Set<(brush: BrushUpdate) => void> = new Set();
	private _isPressing = false; // is mousedown
	private _isDrawing = false; // is mousedown & lazy has updated!

	private _size = 5;
	private _color = "tomato";
	private _mode: Mode = "draw";
	private _cap: Cap = "round";

	private _lazy = new LazyBrush(); // should be private? I think so because we need to be able to publish() anytime lazy settings change!
	// tricky though, because we also need to access lazy methods within OUR classes..
	// maybe we privatize Paint.brush (with Paint.brush.lazy) and publicize a version of Paint.brush w/o lazy?

	constructor(private root: HTMLElement, options: BrushOptions) {
		// console.log(options);

		this.root.addEventListener("mousemove", (e) =>
			this.handleMove(e.offsetX, e.offsetY)
		);

		this.root.addEventListener("mousedown", () => this.handleDown());
		this.root.addEventListener("mouseup", () => this.handleUp());
	}

	get isDrawing() {
		return this._isDrawing;
	}

	get isPressing() {
		return this._isPressing;
	}

	get size() {
		return this._size;
	}

	set size(value: number) {
		if (value > 0) this._size = value;
		this.publish();
	}

	get color() {
		return this._color;
	}

	set color(value: string) {
		// if color2k can parse..
		this._color = value;
		this.publish();
	}

	get mode() {
		return this._mode;
	}

	set mode(value: Mode) {
		this._mode = value;
		this.publish();
	}

	get cap() {
		return this._cap;
	}

	set cap(value: Cap) {
		this._cap = value;
		this.publish();
	}

	get lazy() {
		// TODO: needs to be limited in what parts of lazy are returned! no updating methods, because we need to publish() when those happen (via the set lazy() method)
		// could maybe use a proxy?
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
		return this._lazy;
	}

	// set lazy(options: {}) {
	// 	// TODO: how to do this? 🤔
	// 	this._lazy;
	// }

	private payload() {
		return {
			isPressing: this.isPressing,
			size: this.size,
			color: this.color,
			mode: this.mode,
			cap: this.cap,
		};
	}

	private handleMove(x: number, y: number) {
		this._lazy.update({ x, y });
		this.publish();
	}

	private handleDown() {
		this._isPressing = true;
		this.publish();
	}

	private handleUp() {
		this._isPressing = false;
		this.publish();
	}

	subscribe(callback: (brush: BrushUpdate) => void) {
		this.subscribers.add(callback);
		return () => this.subscribers.delete(callback);
	}

	private publish() {
		this.subscribers.forEach((callback) => callback(this.payload()));
	}
}
// pubsub this boi!
// UI would like to know, temp would like to know,
// artboard would like to know,
// where/however paths are being recorded would like to know
// https://color2k.com/#parse-to-rgba
