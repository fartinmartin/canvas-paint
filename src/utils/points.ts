import { Coordinates } from "lazy-brush";
import { Path } from "../classes/path";
import { Point } from "../classes/point";

export function getMidCoords(p1: Coordinates, p2: Coordinates) {
	return {
		x: p1.x + (p2.x - p1.x) / 2,
		y: p1.y + (p2.y - p1.y) / 2,
	};
}

export function scalePath(path: Path, scaleTo: number): Path {
	const factor = path.scale / scaleTo;
	return new Path(
		path.points.map((p) => new Point(p.x / factor, p.y / factor, p.color, p.size / factor)),
		path.mode, path.scale, path.cap, path.join, path.tolerance
	);
}

export function simplifyPoints(points: Point[], tolerance: number) {
	return removeConsecutiveDupes(points).filter((_, i) => (i + 1) % tolerance);
}

export function removeConsecutiveDupes(points: Point[]) {
	return points.filter((p, i, arr) => i === 0 || p.x !== arr[i - 1].x || p.y !== arr[i - 1].y);
}

export function scalePoint(point: Point, scaleTo: number) {
	return new Point(point.x, point.y, point.color, point.size * scaleTo);
}
