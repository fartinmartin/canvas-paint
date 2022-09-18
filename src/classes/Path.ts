import { Cap, Mode } from "./Brush";
import { Point } from "./Point";

export class Path {
	constructor(
		public points: Point[],
		public mode: Mode = "draw",
		public scale: number = 1,
		public cap: Cap = "round"
	) {}

	factor(destination: number) {
		return this.scale / destination;
	}
}

// Idea: if mode === "fill" only store first and last points. Use the distance (in combination with the canvas width) to determine the "tolerance" amount?
