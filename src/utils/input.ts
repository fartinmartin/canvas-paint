export function isTouch() {
	return "ontouchstart" in window.document;
}

export function getInputCoords(
	event: MouseEvent | TouchEvent,
	root: HTMLElement
) {
	let x, y;

	if (isTouch()) {
		x = (event as TouchEvent).touches[0].pageX;
		y = (event as TouchEvent).touches[0].pageY;
	} else {
		x = (event as MouseEvent).pageX;
		y = (event as MouseEvent).pageY;
	}

	const elBCRect = root.getBoundingClientRect();

	// need to consider scrolled positions
	const elRect = {
		left: elBCRect.left + window.pageXOffset,
		top: elBCRect.top + window.pageYOffset,
	};

	return {
		x: x - elRect.left,
		y: y - elRect.top,
	};
}
