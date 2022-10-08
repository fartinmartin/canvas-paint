import FloodFill, { ColorRGBA, setColorAtPixel } from "q-floodfill";
import { parseToRgba } from "color2k";
import combinate from "combinate";
// import { differenceEuclidean } from "culori"; // @ts-ignore

export function colorToRGBA(color: string): ColorRGBA {
	const rgba = parseToRgba(color);
	return {
		r: rgba[0],
		g: rgba[1],
		b: rgba[2],
		a: 255 / rgba[3],
	};
}

export function isSameColor(a: ColorRGBA, b: ColorRGBA, tolerance = 0) {
	const original = !(
		Math.abs(a.r - b.r) > tolerance ||
		Math.abs(a.g - b.g) > tolerance ||
		Math.abs(a.b - b.b) > tolerance ||
		Math.abs(a.a - b.a) > tolerance
	);

	// const diff = differenceEuclidean("rgb", [1, 1, 1, 1]);
	// const diffAB = diff(a, b);

	return original; // return diffAB <= tolerance;
}

export function createOutlineCanvas(
	{ imageData: { width, height }, modifiedPixels }: FloodFill,
	color: string
) {
	const { canvas, context } = createTempCanvas(width, height);
	const fillColor = colorToRGBA(color);

	const imageData = context.getImageData(0, 0, width, height);
	modifiedPixels.forEach((val) => {
		const [x, y] = val.split("|").map(Number);
		setColorAtPixel(imageData, fillColor, x, y);
	});

	context.putImageData(imageData, 0, 0);

	const original = createTempCanvas(width, height);
	original.context.putImageData(imageData, 0, 0);

	const strokeWidth = 0.125;

	combinate({
		x: [0, 1, -1],
		y: [0, 1, -1],
	}).forEach((offset) => {
		context.drawImage(canvas, offset.x * strokeWidth, offset.y * strokeWidth);
	});

	context.globalCompositeOperation = "destination-out";
	context.drawImage(original.canvas, 0, 0);

	return { canvas, imageData, original };
}

export function createTempCanvas(width: number, height: number) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d")!;

	canvas.width = width;
	canvas.height = height;

	return { canvas, context };
}
