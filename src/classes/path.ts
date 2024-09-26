import { Cap, Mode, Join } from "./brush";
import { Point } from "./point";

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
