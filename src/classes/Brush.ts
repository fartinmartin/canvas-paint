import { LazyBrush } from "lazy-brush"; // @ts-ignore
import { Catenary } from "catenary-curve";
import { EventEmitter } from "./Events";
import { Point } from "./Point";

export type Mode = "draw" | "erase" | "fill";
export type Cap = "butt" | "round" | "square";
export type Join = "round" | "bevel" | "miter";
export type BrushPayload = ReturnType<() => Brush["payload"]>;

export type BrushOptions = {};

export class Brush {
	public events = new EventEmitter();
	private _isDrawing = false;

	private _size = 5; // TODO: needs to react to Paint.scale somehow
	private _color = "tomato";
	private _mode: Mode = "draw";
	private _cap: Cap = "round";

	private _lazy = new LazyBrush({ radius: 0 }); // should be private? I think so because we need to be able to publish() anytime lazy settings change!
	// tricky though, because we also need to access lazy methods within OUR classes..
	// maybe we privatize Paint.brush (with Paint.brush.lazy) and publicize a version of Paint.brush w/o lazy?

	constructor(private root: HTMLElement, options: BrushOptions) {
		// console.log(options);

		this.root.addEventListener("mousemove", (e) =>
			this.handleMove(e.offsetX, e.offsetY)
		);

		this.root.addEventListener("mousedown", (e) => this.handleDown(e));
		this.root.addEventListener("mouseup", (e) => this.handleUp(e));
		// this.root.addEventListener("mouseleave", (e) => this.handleUp(e)); // this commits a new line every time mouse leaves
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

	private handleMove(x: number, y: number) {
		this._lazy.update({ x, y });
		this.events.dispatch("move", this.payload);
	}

	private handleDown(event: MouseEvent) {
		event.preventDefault();
		this._isDrawing = true;
		this.events.dispatch("down", this.payload);
	}

	private handleUp(event: MouseEvent) {
		event.preventDefault();
		this._isDrawing = false;
		this.events.dispatch("up", this.payload);
	}
}
