import { Cap, Mode, Join } from "./Brush";
import { Point } from "./Point";

export class Path {
	constructor(
		public points: Point[],
		public mode: Mode | "clear" = "draw",
		public scale: number = 1,
		public cap: Cap = "round",
		public join: Join = "round",
		public tolerance: number
	) {}
}
