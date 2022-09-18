export class Point {
	constructor(
		private _x: number,
		private _y: number,
		private _color: string = "#000",
		private _size: number = 5
	) {}

	get x() {
		return this._x;
	}

	get y() {
		return this._y;
	}

	get coords() {
		return { x: this._x, y: this._y };
	}

	get color() {
		return this._color;
	}

	get size() {
		return this._size;
	}
}
