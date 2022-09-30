import { Coordinates } from "lazy-brush";
import { Path } from "../classes/Path";
import { Point } from "../classes/Point";

export function getMidCoords(p1: Coordinates, p2: Coordinates) {
	return {
		x: p1.x + (p2.x - p1.x) / 2,
		y: p1.y + (p2.y - p1.y) / 2,
	};
}

// type ChangeFields<T, R> = Omit<T, keyof R> & R;
// export type PathLike = ChangeFields<Path, { points: Omit<Point, "coords">[] }>;

export function scalePath(path: Path, scaleTo: number) {
	const drawnAt = path.scale;
	const factor = drawnAt / scaleTo;

	let p = JSON.parse(JSON.stringify(path)); // can we do w/o this?

	p.points = p.points.map((point: Point) => ({
		...point,
		size: point.size / factor,
		x: point.x / factor,
		y: point.y / factor,
	}));

	return p;
}
