import { Point } from "./Point";

export class Path {
	constructor(
		private _points: Point[],
		private _mode: "draw" | "erase" | "fill" = "draw",
		private _scale: number = 1
	) {}

	get point() {
		return this._points;
	}

	get mode() {
		return this._mode;
	}

	get scale() {
		return this._scale;
	}

	factor(destination: number) {
		return this._scale / destination;
	}
}

// Idea: if mode === "fill" only store first and last points. Use the distance (in combination with the canvas width) to determine the "tolerance" amount?
