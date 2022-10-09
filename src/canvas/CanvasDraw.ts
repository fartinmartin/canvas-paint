import { Canvas, CanvasOptions } from "./Canvas";
import { Brush } from "../classes/Brush";
import { Path } from "../classes/Path";
import { Point } from "../classes/Point";

import { getMidCoords, scalePath } from "../utils/points";
import { namespace } from "../utils/uuid";
import { waitFor } from "../utils/waitFor";

import FloodFill from "q-floodfill";
import { colorToRGBA, isSameColor, createOutlineCanvas } from "../utils/fill";

export class CanvasDraw extends Canvas {
	constructor(
		public root: HTMLElement,
		protected className: string,
		protected brush: Brush,
		protected options: CanvasOptions
	) {
		super(root, className, options);
	}

	async draw(p: Path, delay?: number) {
		const path = scalePath(p, this.scale); // scale here so that drawings are scaled whilst drawing, but also whislt playing back history

		if (path.mode === "clear") return this.clear();

		if (!delay) {
			path.mode !== "fill" ? this.drawPath(path) : this.drawFill(path); // await this.drawFill()?
		} else {
			for (let i = 0; i < path.points.length; i++) {
				const slice = JSON.parse(JSON.stringify(path)); // can we do w/o this? or in a more efficient way?
				slice.points = slice.points.slice(0, i + 1);
				path.mode !== "fill" ? this.drawPath(slice) : this.drawFill(slice);
				await waitFor(delay);
			}

			return waitFor(delay); // return a promise in order to pause between paths
		}
	}

	protected setBrush(path: Path, point: Point) {
		const { mode, cap, join } = path;
		const { size, color } = point;

		// we need to see the temp canvas paint erasing paths
		const isTemp = this.canvas.classList.contains(`${namespace}temp`);
		this.context.globalCompositeOperation =
			isTemp || mode !== "erase" ? "source-over" : "destination-out";

		this.context.lineWidth = size;
		this.context.lineCap = cap;
		this.context.lineJoin = join;

		const bgColor = this.options.bgColor ?? "white";

		this.context.strokeStyle = mode === "erase" ? bgColor : color;
		this.context.fillStyle = mode === "erase" ? bgColor : color;
	}

	protected drawPath(path: Path) {
		if (path.points.length && path.points.length < 2) return this.drawDot(path);
		if (path.points.length < 2) return;

		let p1 = path.points[0]; // cur?
		let p2 = path.points[1]; // old?

		this.setBrush(path, p1);
		this.context.moveTo(p2.x, p2.y);
		this.context.beginPath();

		for (let i = 1, len = path.points.length; i < len; i++) {
			const midPoint = getMidCoords(p1, p2);
			this.context.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);

			p1 = path.points[i];
			p2 = path.points[i + 1];
		}

		this.context.stroke();
	}

	protected drawDot(path: Path) {
		const p1 = path.points[0];
		const { cap } = path;
		const { size } = p1;

		this.setBrush(path, p1);
		this.context.beginPath();

		const r = size / 2;
		if (cap === "round") this.context.arc(p1.x, p1.y, r, 0, 2 * Math.PI);
		if (cap !== "round") this.context.rect(p1.x - r, p1.y - r, size, size);

		this.context.fill();
	}

	protected drawFill(path: Path) {
		if (this.canvas.className === `${namespace}temp`) return;

		// TODO: ⚠️ what's the best way to get access to this.artboard?
		const canvas = this.root.querySelector(`.${namespace}artboard`);
		if (!canvas || !(canvas instanceof HTMLCanvasElement)) return;

		const context = canvas.getContext("2d")!;
		const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

		const { x: originalX, y: originalY, color: fillColor } = path.points[0];
		// our canvas image size is not 1to1 with our point selection! and! imageData arrays need nice round integers for indexing
		const x = Math.round(originalX * devicePixelRatio);
		const y = Math.round(originalY * devicePixelRatio);

		const floodFill = new FloodFill(imageData);
		floodFill.isSameColor = isSameColor;
		floodFill.colorToRGBA = colorToRGBA;
		floodFill.collectModifiedPixels = true;
		floodFill.fill(fillColor, x, y, this.brush.tolerance);

		context.putImageData(floodFill.imageData, 0, 0);

		// createOutlineCanvas() paints an outline in a blunt way..
		// OR: could we get the edge as a {x,y}[] path from the `floodFill.modifiedPixels` directly? marching square algo?
		const out = createOutlineCanvas(floodFill, fillColor);
		context.drawImage(out.canvas, 0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio); // prettier-ignore
	}
}
