import { UI, UIOptions } from "./canvas/ui";
import { Temp } from "./canvas/temp";
import { Artboard } from "./canvas/artboard";
import { Grid, GridOptions } from "./canvas/grid";
import { CanvasOptions } from "./classes/canvas";

import { Brush, BrushPayload, BrushOptions } from "./classes/brush";
import { AddClear, AddPath, CommandStack } from "./classes/command";
import { EventEmitter } from "./classes/events";
import { Path } from "./classes/path";
import { Point } from "./classes/point";

import { namespace, uuid } from "./utils/uuid";
import { createBaseStyles, createInstanceStyles } from "./utils/styles";
import { resizeObserver } from "./utils/resize";
import { scalePoint, simplifyPoints } from "./utils/points";

export type PaintOptions = CanvasOptions & BrushOptions & UIOptions & GridOptions; // prettier-ignore
export type PlaybackOptions = { delay?: number; duration?: number };

export class Paint {
	static className = namespace + "container";
	static baseStyles = createBaseStyles(Paint.className, namespace)!;
	public id: string = uuid();
	public instanceStyles: CSSStyleSheet;

	public ui: UI;
	public temp: Temp;
	public artboard: Artboard;
	public grid: Grid;

	public brush: Brush;
	public history = new CommandStack();
	public events = new EventEmitter();

	public points: Point[] = [];

	constructor(public root: HTMLElement, public options: PaintOptions) {
		this.root.classList.add(Paint.className);
		this.root.dataset.canvasPaintId = this.id;
		this.instanceStyles = createInstanceStyles(this.id, options)!;

		this.options = new Proxy(options, {
			set: (target, prop, value) => {
				(target as Record<string | symbol, unknown>)[prop] = value;
				if (prop === "bgColor") createInstanceStyles(this.id, target);
				return true;
			},
		});

		resizeObserver(this.root, (e) => this.resize(e), options.debounce);

		this.brush = new Brush(root, this.options);

		this.ui = new UI(root, this.brush, this.options);
		this.temp = new Temp(root, this.brush, this.options);
		this.artboard = new Artboard(root, this.brush, this.options);
		this.grid = new Grid(root, this.options);

		this.addListeners();
	}

	private addListeners() {
		// when brush settings change, update UI canvas
		this.brush.events.on("brushUpdate", () => this.ui.drawInterface());
		// when brush moves, update UI canvas
		this.brush.events.on("move", () => this.ui.drawInterface());

		// when brush moves, if brush.isDrawing, update current path/points array then draw current path/points array on temp canvas
		this.brush.events.on("move", (brush: BrushPayload) => {
			if (brush.isDrawing && brush.mode !== "fill") {
				this.points.push(scalePoint(brush.point, this.scale));
				this.temp.draw(this.path);
				this.events.dispatch("draw", brush);
			}
		});

		// handle edge case of "click" for dots and fills!
		this.brush.events.on("down", (brush: BrushPayload) => {
			if (brush.isDrawing) {
				this.points.push(scalePoint(brush.point, this.scale));
				this.temp.draw(this.path);
				this.events.dispatch("start", brush);
			}
		});

		// when brush releases, commit path to artboard and histroy
		this.brush.events.on("up", (brush: BrushPayload) => {
			newPath.call(this);
			this.events.dispatch("end", brush);
		});

		// when brush leaves, if we're drawing commit path to artboard and histroy
		this.brush.events.on("leave", (brush: BrushPayload) => {
			if (brush.isDrawing) {
				newPath.call(this);
				this.events.dispatch("leave", brush);
			}
		});

		function newPath(this: Paint) {
			this.temp.clear();
			this.artboard.draw(this.path);
			this.history.execute(new AddPath(this.path));
			this.points = [];
		}
	}

	removeListeners() {
		this.brush.removeAllListeners();
		this.brush.events.removeAllListeners();
		this.events.removeAllListeners();
	}

	async resize(entry: ResizeObserverEntry) {
		this.events.dispatch("resizing", () => {});
		const width = entry.target.clientWidth;
		const newDimensions = { width, height: width / this.aspectRatio }; // TODO: have an option to opt out of aspectRatio resizing

		[this.ui, this.temp, this.artboard, this.grid].forEach((canvas) => {
			canvas.resize(newDimensions);
		});

		await this.drawHistory();
		this.events.dispatch("resized", () => {});
	}

	get aspectRatio() {
		const margin = (this.options.margin ?? 0) * 2;
		return (this.options.width + margin) / (this.options.height + margin);
	}

	get scale() {
		const margin = (this.options.margin ?? 0) * 2;
		return this.root.clientWidth / (this.options.width + margin);
	}

	get path() {
		const { mode, cap, join, tolerance } = this.brush;
		const points = simplifyPoints(this.points, 2);
		return new Path(points, mode, this.scale, cap, join, tolerance);
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

	clear() {
		this.artboard.clear();
		this.temp.clear();
		this.history.execute(new AddClear());
		this.points = [];
	}

	async setMargin(margin: number) {
		const marginDelta = margin - (this.options.margin ?? 0);
		this.options.margin = margin;

		if (marginDelta !== 0) {
			this.history.transform((path) => {
				if (path.mode === "clear") return path;
				return {
					...path,
					points: path.points.map((p) => ({
						...p,
						x: p.x + marginDelta * path.scale,
						y: p.y + marginDelta * path.scale,
					})),
				};
			});
		}

		const totalMargin = margin * 2;
		[this.ui, this.temp, this.artboard, this.grid].forEach((canvas) => {
			canvas.resize({ width: this.options.width + totalMargin, height: this.options.height + totalMargin });
		});

		createInstanceStyles(this.id, this.options);
		await this.drawHistory();
	}

	async setSize(width: number, height: number) {
		this.options.width = width;
		this.options.height = height;

		const margin = (this.options.margin ?? 0) * 2;
		[this.ui, this.temp, this.artboard, this.grid].forEach((canvas) => {
			canvas.resize({ width: width + margin, height: height + margin });
		});

		createInstanceStyles(this.id, this.options);
		await this.drawHistory();
	}

	destroy() {
		this.clear();
		this.history.reset();
	}

	save() {
		return {
			width: this.options.width,
			height: this.options.height,
			bgColor: this.options.bgColor,
			margin: this.options.margin,
			paths: this.history.state,
			version: APP_VERSION,
		};
	}

	async load(
		{ width, height, paths, bgColor, margin: savedMargin }: ReturnType<typeof this.save>,
		options: PlaybackOptions = {}
	) {
		this.destroy();

		this.options.width = width;
		this.options.height = height;

		const currentMargin = this.options.margin ?? 0;
		const marginDelta = currentMargin - (savedMargin ?? 0);
		const totalMargin = currentMargin * 2;

		[this.ui, this.temp, this.artboard, this.grid].forEach((canvas) => {
			canvas.resize({ width: width + totalMargin, height: height + totalMargin });
		});

		createInstanceStyles(this.id, this.options);

		const adjustedPaths = marginDelta === 0 ? paths : paths.map((path) => {
			if (path.mode === "clear") return path;
			return {
				...path,
				points: path.points.map((p) => ({
					...p,
					x: p.x + marginDelta * path.scale,
					y: p.y + marginDelta * path.scale,
				})),
			};
		});

		adjustedPaths.forEach((path) => {
			const c = path.mode === "clear" ? new AddClear() : new AddPath(path);
			this.history.execute(c);
		});

		return this.drawHistory(options);
	}

	private resolveDelay({ delay, duration }: PlaybackOptions): number | undefined {
		if (duration !== undefined) {
			const totalPoints = this.history.state.reduce((sum, path) => sum + path.points.length, 0);
			return totalPoints > 0 ? duration / totalPoints : undefined;
		}
		return delay;
	}

	private async replayHistory(delay: number): Promise<void> {
		for (const path of this.history.state) {
			await this.temp.draw(path, delay); // draw lines point-by-point to temp
			this.artboard.draw(path); // draw lines immediately to artboard
			this.temp.clear(); // clear temp (these 3 steps reduce chunkiness)
			this.events.dispatch("drawingPath", () => {});
		}
	}

	async drawHistory(options: PlaybackOptions = {}): Promise<void> {
		this.events.dispatch("drawing", () => {});
		this.artboard.clear();
		const delay = this.resolveDelay(options);
		if (delay) {
			await this.replayHistory(delay);
			return this.drawHistory(); // run this again w/o delay to remove crunchiness
		} else {
			for (const path of this.history.state) await this.artboard.draw(path);
		}
		this.events.dispatch("drawn", () => {});
	}

	async toVideo(options: PlaybackOptions & { fps?: number } = {}): Promise<Blob> {
		const delay = this.resolveDelay(options) ?? 10;
		const fps = options.fps ?? 60;

		const margin = this.options.margin ?? 0;
		const scale = this.scale;
		const docWidth = this.options.width * scale;
		const docHeight = this.options.height * scale;
		const sx = margin * scale * devicePixelRatio;
		const sy = margin * scale * devicePixelRatio;
		const sw = docWidth * devicePixelRatio;
		const sh = docHeight * devicePixelRatio;

		const recording = document.createElement("canvas");
		recording.width = docWidth;
		recording.height = docHeight;
		const ctx = recording.getContext("2d")!;
		const { width, height } = recording;

		const stream = recording.captureStream(fps);
		const recorder = new MediaRecorder(stream);
		const chunks: Blob[] = [];
		recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

		// Composite artboard + temp onto the recording canvas each frame
		let compositing = true;
		const composite = () => {
			ctx.fillStyle = this.options.bgColor ?? "transparent";
			ctx.fillRect(0, 0, width, height);
			ctx.drawImage(this.artboard.canvas, sx, sy, sw, sh, 0, 0, width, height);
			ctx.drawImage(this.temp.canvas, sx, sy, sw, sh, 0, 0, width, height);
			if (compositing) requestAnimationFrame(composite);
		};

		this.artboard.clear();
		this.temp.clear();
		requestAnimationFrame(composite);
		recorder.start();

		await this.replayHistory(delay);

		// Wait for one final composite frame to capture the last artboard state
		await new Promise<void>((r) => requestAnimationFrame(() => r()));

		compositing = false;
		recorder.stop();

		return new Promise((resolve) => {
			recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
		});
	}

	async toBlob(type?: string | undefined, quality?: number) {
		const margin = this.options.margin ?? 0;
		const scale = this.scale;
		const docWidth = this.options.width * scale;
		const docHeight = this.options.height * scale;
		const sx = margin * scale * devicePixelRatio;
		const sy = margin * scale * devicePixelRatio;
		const sw = docWidth * devicePixelRatio;
		const sh = docHeight * devicePixelRatio;

		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d")!;

		canvas.width = docWidth;
		canvas.height = docHeight;

		const { width, height } = canvas;
		context.fillStyle = this.options.bgColor ?? "transparent";
		context.fillRect(0, 0, width, height);
		context.drawImage(this.artboard.canvas, sx, sy, sw, sh, 0, 0, width, height);

		return await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, type, quality)
		);
	}
}
