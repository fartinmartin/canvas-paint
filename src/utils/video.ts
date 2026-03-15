import type { PlaybackOptions } from "../index";

export type VideoEncodeOpts = {
	artboard: HTMLCanvasElement;
	temp: HTMLCanvasElement;
	crop: { sx: number; sy: number; sw: number; sh: number };
	width: number;
	height: number;
	bgColor: string;
	fps: number;
	mkCanvas: (w: number, h: number) => HTMLCanvasElement;
};

export type VideoOptions = PlaybackOptions & {
	fps?: number;
	/** Output video width in px. Defaults to document width at current screen scale. */
	width?: number;
	/** Output video height in px. Defaults to document height at current screen scale. */
	height?: number;
	/**
	 * Canvas factory. Swap in `require('canvas').createCanvas` for server-side rendering.
	 * Default: `document.createElement('canvas')` sized to `w × h`.
	 */
	createCanvas?: (w: number, h: number) => HTMLCanvasElement;
	/**
	 * Encoder factory. Receives source canvases + crop info; returns a start/stop controller.
	 * Swap in an ffmpeg-based encoder for server-side rendering.
	 * Default: browser `captureStream` + `MediaRecorder`.
	 */
	encode?: (opts: VideoEncodeOpts) => { start(): void; stop(): Promise<Blob> };
};

export function browserEncode({ artboard, temp, crop, width, height, bgColor, fps, mkCanvas }: VideoEncodeOpts) {
	const { sx, sy, sw, sh } = crop;
	const recording = mkCanvas(width, height);
	const ctx = recording.getContext("2d")!;
	const stream = recording.captureStream(fps);
	const recorder = new MediaRecorder(stream);
	const chunks: Blob[] = [];
	recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

	let compositing = true;
	const composite = () => {
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, width, height);
		ctx.drawImage(artboard, sx, sy, sw, sh, 0, 0, width, height);
		ctx.drawImage(temp, sx, sy, sw, sh, 0, 0, width, height);
		if (compositing) requestAnimationFrame(composite);
	};

	return {
		start: () => {
			requestAnimationFrame(composite);
			recorder.start();
		},
		stop: async () => {
			await new Promise<void>((r) => requestAnimationFrame(() => r()));
			compositing = false;
			return new Promise<Blob>((resolve) => {
				recorder.stop();
				recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
			});
		},
	};
}
