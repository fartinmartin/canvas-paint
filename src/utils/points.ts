import { Coordinates } from "lazy-brush";
import { Path } from "../classes/Path";
import { Point } from "../classes/Point";

export function getMidCoords(p1: Coordinates, p2: Coordinates) {
	return {
		x: p1.x + (p2.x - p1.x) / 2,
		y: p1.y + (p2.y - p1.y) / 2,
	};
}

export function scalePath(path: Path, scaleTo: number) {
	let p = JSON.parse(JSON.stringify(path)) as Path; // can we do w/o this?
	const drawnAt = path.scale;
	const factor = drawnAt / scaleTo;

	p.points = p.points.map((point: Point) => ({
		...point,
		size: point.size / factor,
		x: point.x / factor,
		y: point.y / factor,
	}));

	return p as Path;
}

export function simplifyPath(path: Path, tolerance: number) {
	let p = JSON.parse(JSON.stringify(path)) as Path; // can we do w/o this?
	p.points = simplifyPoints(path.points, tolerance);
	return p as Path;
}

export function simplifyPoints(points: Point[], tolerance: number) {
	points = removeConsecutiveDupes(points);
	return points.filter((_, index) => (index + 1) % tolerance);
}

export function removeConsecutiveDupes(array: any[]) {
	return array.filter((item, pos, arr) => {
		return pos === 0 || JSON.stringify(item) !== JSON.stringify(arr[pos - 1]);
	});
}

export function scalePoint(point: Point, scaleTo: number) {
	return new Point(point.x, point.y, point.color, point.size * scaleTo);
}
