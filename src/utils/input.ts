export function getInputCoords(
	event: MouseEvent | TouchEvent,
	root: HTMLElement
) {
	let x, y;

	if ("touches" in event) {
		x = event.touches[0].pageX;
		y = event.touches[0].pageY;
	} else {
		x = event.pageX;
		y = event.pageY;
	}

	const elBCRect = root.getBoundingClientRect();

	// need to consider scrolled positions
	const elRect = {
		left: elBCRect.left + window.scrollX,
		top: elBCRect.top + window.scrollY,
	};

	return {
		x: x - elRect.left,
		y: y - elRect.top,
	};
}
