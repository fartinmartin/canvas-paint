const Paint = {
	drawHistory(delay?: number): Promise<void> {
		return new Promise((resolve) => {
			this.events.dispatch("drawing", () => {});
			this.artboard.clear();

			if (delay) {
				const paths = [...this.history.state]; // Clone history state
				let i = 0;

				const drawNextPath = () => {
					if (i < paths.length) {
						const path = paths[i];

						this.temp.draw(path, delay).then(() => {
							this.artboard.draw(path); // Draw full path to the artboard
							this.temp.clear(); // Clear temp layer after drawing

							this.events.dispatch("drawingPath", () => {});

							i++;
							requestAnimationFrame(drawNextPath); // Queue next path after current finishes
						});
					} else {
						this.drawHistory().then(resolve); // Final draw to remove chunkiness
					}
				};

				requestAnimationFrame(drawNextPath); // Start the drawing sequence
			} else {
				for (const path of this.history.state) {
					this.artboard.draw(path); // Immediate drawing to artboard
				}
				this.events.dispatch("drawn", () => {});
				resolve();
			}
		});
	},
};

const CanvasDraw = {
	draw(p: Path, delay?: number): Promise<void> {
		return new Promise((resolve) => {
			const path = scalePath(p, this.scale);
			if (path.mode === "clear") {
				this.clear();
				resolve();
				return;
			}

			const drawAction = (mode: string, slice: Path) =>
				mode !== "fill" ? this.drawPath(slice) : this.drawFill(slice);

			if (!delay) {
				drawAction(path.mode, path);
				resolve(); // No delay, so resolve immediately
			} else {
				let i = 0;

				const animate = () => {
					if (i < path.points.length) {
						const slice = { ...path, points: path.points.slice(0, i + 1) };
						drawAction(path.mode, slice);

						i++;
						setTimeout(() => requestAnimationFrame(animate), delay);
					} else {
						resolve(); // Resolve when all points are drawn
					}
				};

				requestAnimationFrame(animate); // Start animation
			}
		});
	},
};
