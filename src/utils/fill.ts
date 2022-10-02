import { parseToRgba } from "color2k";
// import { differenceEuclidean } from "culori"; // @ts-ignore
import { ColorRGBA } from "q-floodfill";

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

	return original;

	// const diff = differenceEuclidean("rgb", [1, 1, 1, 1]);
	// const diffAB = diff(a, b);

	// return diffAB <= tolerance;
}

// export type RGBA = [number, number, number, number];

// export function getPixel(imageData: ImageData, x: number, y: number): RGBA {
// 	if ((x < 0 || y < 0 || x > imageData.width, y > imageData.height)) {
// 		return [-1, -1, -1, -1]; // impossible color
// 	}
// 	const offset = Math.round((y * imageData.width + x) * 4); // ImageData array requires integers for index numbers
// 	return [
// 		imageData.data[offset + 0],
// 		imageData.data[offset + 1],
// 		imageData.data[offset + 2],
// 		imageData.data[offset + 3],
// 	];
// }

// export function setPixel(
// 	imageData: ImageData,
// 	x: number,
// 	y: number,
// 	fillColor: RGBA
// ) {
// 	const offset = (y * imageData.width + x) * 4;
// 	[
// 		imageData.data[offset + 0],
// 		imageData.data[offset + 1],
// 		imageData.data[offset + 2],
// 		imageData.data[offset + 3],
// 	] = [fillColor[0], fillColor[1], fillColor[2], fillColor[3]];
// }

// export function colorsMatch(color1: RGBA, color2: RGBA) {
// 	return (
// 		color1[0] === color2[0] &&
// 		color1[1] === color2[1] &&
// 		color1[2] === color2[2] &&
// 		color1[3] === color2[3]
// 		// Math.abs(color1[3] - color2[3]) <= 150 // TODO: is there an efficient way to do tolerance
// 	);
// }

// export function floodFill(
// 	imageData: ImageData,
// 	x: number,
// 	y: number,
// 	targetColor: RGBA,
// 	fillColor: RGBA
// ) {
// 	// check we are actually filling a different color
// 	if (!colorsMatch(targetColor, fillColor)) {
// 		const pixelsToCheck = [Math.round(x), Math.round(y)]; // ImageData array requires integers for index numbers
// 		while (pixelsToCheck.length > 0) {
// 			y = pixelsToCheck.pop()!;
// 			x = pixelsToCheck.pop()!;

// 			const currentColor = getPixel(imageData, x, y);
// 			if (colorsMatch(currentColor, targetColor)) {
// 				setPixel(imageData, x, y, fillColor);
// 				pixelsToCheck.push(x + 1, y);
// 				pixelsToCheck.push(x - 1, y);
// 				pixelsToCheck.push(x, y + 1);
// 				pixelsToCheck.push(x, y - 1);
// 			}
// 		}
// 	}
// 	// put the data back
// 	return imageData;
// }

// export function hexToRgba(hex: string) {
// 	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!;
// 	return [
// 		parseInt(result[1], 16),
// 		parseInt(result[2], 16),
// 		parseInt(result[3], 16),
// 		255,
// 	] as RGBA;
// }
