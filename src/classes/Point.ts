export class Point {
	constructor(
		public x: number,
		public y: number,
		public color: string = "#000",
		public size: number = 5
	) {}

	get coords() {
		return { x: this.x, y: this.y };
	}
}
