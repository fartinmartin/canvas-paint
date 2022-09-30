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

export type PaintOptions = CanvasOptions &
	UIOptions &
	GridOptions & {
		width: number;
		height: number;
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
			if (brush.isDrawing) this.temp.draw(this.getPath());
		});

		// when brush moves, if brush.isDrawing, update current path/points array
		this.brush.events.on("move", (brush: any) => {
			if (brush.isDrawing)
				this.points.push(
					new Point(brush.coords.x, brush.coords.y, brush.color, brush.size) // this could/should be cleaner :)
				);
		});

		// handle edge case of "click" for dots
		this.brush.events.on("down", (brush: any) => {
			this.temp.draw(this.getPath());
			this.points.push(
				new Point(brush.coords.x, brush.coords.y, brush.color, brush.size) // this could/should be cleaner :)
			);
		});

		// when brush releases, if brush.isDrawinging, commit path to artboard and histroy
		this.brush.events.on("up", () => {
			this.temp.clear();
			this.artboard.draw(this.getPath());
			this.history.execute(new AddPath(this.getPath()));
			this.points = [];
		});
	}

	removeListeners() {
		this.brush.events.removeAllListeners();
	}

	getPath() {
		return new Path(this.points, this.brush.mode, 1); // todo where is scale at??
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
		for (const path of this.history.state) {
			await this.artboard.draw(path, delay);
		}
		if (delay) this.drawHistory(); // run this again w/o delay to remove crunchiness
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
