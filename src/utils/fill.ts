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

// export class MarchingSquares {
// 	next_step: number = 0;

// 	getBlobOutlinePoints(source_array: Uint8Array, width: number, height = 0) {
// 		// Note: object should not be on the border of the array, since there is
// 		//       no padding of 1 pixel to handle points which touch edges

// 		if (0 == height) height = (source_array.length / width) | 0;

// 		// find the starting point
// 		const startingPoint = this.getFirstNonTransparentPixelTopDown(
// 			source_array,
// 			width,
// 			height
// 		);

// 		if (!startingPoint) return;

// 		return this.walkPerimeter(
// 			source_array,
// 			width,
// 			height,
// 			startingPoint.w,
// 			startingPoint.h
// 		);
// 	}

// 	getFirstNonTransparentPixelTopDown(
// 		source_array: Uint8Array,
// 		width: number,
// 		height: number
// 	) {
// 		let index;
// 		for (let h = 0 | 0; h < height; ++h) {
// 			index = (h * width) | 0;
// 			for (let w = 0 | 0; w < width; ++w) {
// 				if (source_array[index] > 0) return { w: w, h: h };
// 				++index;
// 			}
// 		}
// 		return null;
// 	}

// 	walkPerimeter(
// 		source_array: Uint8Array,
// 		width: number,
// 		height: number,
// 		start_w: number,
// 		start_h: number
// 	) {
// 		width = width | 0;
// 		height = height | 0;

// 		// Set up our return list
// 		const point_list = [],
// 			up = 1 | 0,
// 			left = 2 | 0,
// 			down = 3 | 0,
// 			right = 4 | 0,
// 			step_func = this.step;

// 		let index = 0 | 0, // Note: initialize it with an integer, so the JS interpreter optimizes for this type.
// 			// our current x and y positions, initialized
// 			// to the init values passed in
// 			w = start_w,
// 			h = start_h,
// 			// the main while loop, continues stepping until
// 			// we return to our initial points
// 			next_step;
// 		do {
// 			// evaluate our state, and set up our next direction
// 			index = (h - 1) * width + (w - 1);
// 			next_step = step_func(index, source_array, width);

// 			// if our current point is within our image
// 			// add it to the list of points
// 			if (w >= 0 && w < width && h >= 0 && h < height) {
// 				point_list.push(w - 1, h);
// 			}

// 			switch (next_step) {
// 				case up:
// 					--h;
// 					break;
// 				case left:
// 					--w;
// 					break;
// 				case down:
// 					++h;
// 					break;
// 				case right:
// 					++w;
// 					break;
// 				default:
// 					break;
// 			}
// 		} while (w != start_w || h != start_h);

// 		point_list.push(w, h);

// 		return point_list;
// 	}

// 	// determines and sets the state of the 4 pixels that
// 	// represent our current state, and sets our current and
// 	// previous directions

// 	step(index: number, source_array: Uint8Array, width: number) {
// 		const up_left = 0 < source_array[index + 1],
// 			up_right = 0 < source_array[index + 2],
// 			down_left = 0 < source_array[index + width + 1],
// 			down_right = 0 < source_array[index + width + 2],
// 			none = 0 | 0,
// 			up = 1 | 0,
// 			left = 2 | 0,
// 			down = 3 | 0,
// 			right = 4 | 0;

// 		// Determine which state we are in
// 		let state = 0 | 0;

// 		if (up_left) state |= 1;
// 		if (up_right) state |= 2;
// 		if (down_left) state |= 4;
// 		if (down_right) state |= 8;

// 		// State now contains a number between 0 and 15
// 		// representing our state.
// 		// In binary, it looks like 0000-1111 (in binary)

// 		// An example. Let's say the top two pixels are filled,
// 		// and the bottom two are empty.
// 		// Stepping through the if statements above with a state
// 		// of 0b0000 initially produces:
// 		// Upper Left == true ==>  0b0001
// 		// Upper Right == true ==> 0b0011
// 		// The others are false, so 0b0011 is our state
// 		// (That's 3 in decimal.)

// 		// Looking at the chart above, we see that state
// 		// corresponds to a move right, so in our switch statement
// 		// below, we add a case for 3, and assign Right as the
// 		// direction of the next step. We repeat this process
// 		// for all 16 states.

// 		// So we can use a switch statement to determine our
// 		// next direction based on
// 		switch (state) {
// 			case 1:
// 				this.next_step = up;
// 				break;
// 			case 2:
// 				this.next_step = right;
// 				break;
// 			case 3:
// 				this.next_step = right;
// 				break;
// 			case 4:
// 				this.next_step = left;
// 				break;
// 			case 5:
// 				this.next_step = up;
// 				break;
// 			case 6:
// 				if (this.next_step == up) {
// 					// info from previous_step
// 					this.next_step = left;
// 				} else {
// 					this.next_step = right;
// 				}
// 				break;
// 			case 7:
// 				this.next_step = right;
// 				break;
// 			case 8:
// 				this.next_step = down;
// 				break;
// 			case 9:
// 				if (this.next_step == right) {
// 					// info from previous_step
// 					this.next_step = up;
// 				} else {
// 					this.next_step = down;
// 				}
// 				break;
// 			case 10:
// 				this.next_step = down;
// 				break;
// 			case 11:
// 				this.next_step = down;
// 				break;
// 			case 12:
// 				this.next_step = left;
// 				break;
// 			case 13:
// 				this.next_step = up;
// 				break;
// 			case 14:
// 				this.next_step = left;
// 				break;
// 			default: // this should never happen
// 				this.next_step = none;
// 				break;
// 		}
// 		return this.next_step;
// 	}
// }

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
