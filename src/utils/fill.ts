import FloodFill, { ColorRGBA } from "q-floodfill";
import { parseToRgba } from "color2k";

export function colorToRGBA(color: string): ColorRGBA {
	const rgba = parseToRgba(color);
	return {
		r: rgba[0],
		g: rgba[1],
		b: rgba[2],
		a: rgba[3] * 255, // was: 255 / rgba[3] — division inverted alpha (0.5 → 510, 0 → Infinity)
	};
}

export function isSameColor(a: ColorRGBA, b: ColorRGBA, tolerance = 0) {
	return !(
		Math.abs(a.r - b.r) > tolerance ||
		Math.abs(a.g - b.g) > tolerance ||
		Math.abs(a.b - b.b) > tolerance ||
		Math.abs(a.a - b.a) > tolerance
	);
}

export function dilate(floodFill: FloodFill, fillColor: string) {
	// Expands the filled region by 1px to cover anti-aliased fringe pixels that
	// the flood fill skipped (slightly off-color pixels at stroke edges).
	// O(perimeter of fill) — only touches border pixels, not the whole bounding box.
	//
	// A marching squares approach would be more precise: trace the exact contour
	// from modifiedPixels, then re-render it as a vector path with proper
	// anti-aliasing. More accurate but O(bounding box area) and much more complex.
	// For 1–2px anti-aliased edges, dilation is accurate enough.
	const { width, height } = floodFill.imageData;
	const filled = floodFill.modifiedPixels;
	const color = colorToRGBA(fillColor);

	const neighbors = [[0, 1], [0, -1], [1, 0], [-1, 0]];

	const data = floodFill.imageData.data;

	filled.forEach((key) => {
		const [x, y] = key.split("|").map(Number);
		for (const [dx, dy] of neighbors) {
			const nx = x + dx;
			const ny = y + dy;
			if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
			if (filled.has(`${nx}|${ny}`)) continue;

			// Composite fill color under the existing fringe pixel using "A over B":
			//   result = existing * existingAlpha + fill * (1 - existingAlpha)
			// A fully opaque stroke pixel stays as-is; a transparent pixel becomes
			// fill color; a semi-transparent anti-aliased edge pixel blends naturally.
			const idx = (ny * width + nx) * 4;
			const a = data[idx + 3] / 255;
			data[idx]     = Math.round(data[idx]     * a + color.r * (1 - a));
			data[idx + 1] = Math.round(data[idx + 1] * a + color.g * (1 - a));
			data[idx + 2] = Math.round(data[idx + 2] * a + color.b * (1 - a));
			data[idx + 3] = 255;
		}
	});
}
