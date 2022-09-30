import { UI, UIOptions } from "./canvas/UI";
import { Temp } from "./canvas/Temp";
import { Artboard } from "./canvas/Artboard";
import { Grid, GridOptions } from "./canvas/Grid";
import { CanvasOptions } from "./canvas/Canvas";

import { namespace } from "./utils/uuid";

import { Brush, Cap, Mode } from "./classes/Brush";
import { AddPath, CommandStack } from "./classes/Command";
import { EventEmitter } from "./classes/Events";
import { Path } from "./classes/Path";
import { Point } from "./classes/Point";
import { createStyles } from "./utils/styles";
import { resizeObserver } from "./utils/resize";

export type PaintOptions = CanvasOptions &
	UIOptions &
	GridOptions & {
		width: number;
		height: number;
		debounce: number;
	};

export class Paint {
	id: string;

	ui: UI;
	temp: Temp;
	artboard: Artboard;
	grid: Grid;

	brush: Brush;
	history = new CommandStack();
	events = new EventEmitter();

	points: Point[] = [];

	constructor(public root: HTMLElement, private options: PaintOptions) {
		this.id = namespace + "container";
		this.root.classList.add(this.id);

		createStyles(this.id, namespace, this.options);
		resizeObserver(this.root, (e) => this.resize(e), this.options.debounce);

		this.brush = new Brush(root, options);

		this.ui = new UI(root, this.brush, options);
		this.temp = new Temp(root, this.brush, options);
		this.artboard = new Artboard(root, this.brush, options);
		this.grid = new Grid(root, options);

		this.addListeners();
	}

	private addListeners() {
		// when brush moves, update UI canvas
		this.brush.events.on("move", () => {
			const pointer = this.brush.lazy.getPointerCoordinates();
			const coords = this.brush.lazy.getBrushCoordinates();
			this.ui.drawInterface(pointer, coords);
		});

		// when brush moves, if brush.isDrawing, update current path on temp canvas
		this.brush.events.on("move", (brush: any) => {
			if (brush.isDrawing) this.temp.draw(this.path);
		});

		// when brush moves, if brush.isDrawing, update current path/points array
		this.brush.events.on("move", (brush: any) => {
			if (brush.isDrawing)
				this.points.push(
					new Point(
						brush.coords.x,
						brush.coords.y,
						brush.color,
						brush.size * this.scale
					) // this could/should be cleaner :)
				);
		});

		// handle edge case of "click" for dots
		this.brush.events.on("down", (brush: any) => {
			this.temp.draw(this.path);
			this.points.push(
				new Point(
					brush.coords.x,
					brush.coords.y,
					brush.color,
					brush.size * this.scale
				) // this could/should be cleaner :)
			);
		});

		// when brush releases, if brush.isDrawinging, commit path to artboard and histroy
		this.brush.events.on("up", () => {
			this.temp.clear();
			this.artboard.draw(this.path);
			this.history.execute(new AddPath(this.path));
			this.points = [];
		});
	}

	removeListeners() {
		this.brush.events.removeAllListeners();
	}

	resize(entry: ResizeObserverEntry) {
		const width = entry.target.clientWidth;
		const newDimensions = { width, height: width / this.aspectRatio }; // TODO: have an option to opt out of aspectRatio resizing

		[this.ui, this.temp, this.artboard, this.grid].forEach((canvas) => {
			canvas.resize(newDimensions);
		});

		this.drawHistory();
	}

	get aspectRatio() {
		return this.options.width / this.options.height;
	}

	get scale() {
		return this.root.clientWidth / this.options.width;
	}

	get path() {
		return new Path(this.points, this.brush.mode, this.scale);
	}

	undo() {
		if (!this.history.canUndo) return;
		this.history.undo();
		this.artboard.clear();
		this.drawHistory();
	}

	redo() {
		if (!this.history.canRedo) return;
		this.history.redo();
		this.artboard.clear();
		this.drawHistory();
	}

	async drawHistory(delay?: number) {
		this.artboard.clear();
		if (delay) {
			for (const path of this.history.state) {
				await this.temp.draw(path, delay); // draw lines point-by-point to temp
				this.artboard.draw(path); // draw lines immediately to artboard
				this.temp.clear(); // clear temp (these 3 steps reduce chunkiness) ⚠️ but, how will they fare with mode === "fill"?
			}
			this.drawHistory(); // run this again w/o delay to remove crunchiness
		} else {
			for (const path of this.history.state) this.artboard.draw(path);
		}
	}

	setMode(value: Mode) {
		this.brush.mode = value;
	}

	setSize(value: number) {
		this.brush.size = value;
	}

	setColor(value: string) {
		this.brush.color = value;
	}

	setCap(value: Cap) {
		this.brush.cap = value;
	}
}
