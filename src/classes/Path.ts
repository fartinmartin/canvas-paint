import { Cap, Mode, Join } from "./Brush";
import { Point } from "./Point";

export class Path {
	constructor(
		public points: Point[],
		public mode: Mode = "draw",
		public scale: number = 1,
		public cap: Cap = "round",
		public join: Join = "round",
		public tolerance: number
	) {}

	// factor(destination: number) {
	// 	return this.scale / destination;
	// }

	// clone() {
	// 	return new Path(this.points, this.mode, this.scale, this.cap, this.join);
	// }
}

// Idea: if mode === "fill" only store first and last points. Use the distance (in combination with the canvas width) to determine the "tolerance" amount?
