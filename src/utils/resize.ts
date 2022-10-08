import ResizeObserver from "resize-observer-polyfill";
import { debounce } from "lodash-es";

export function resizeObserver(
	el: HTMLElement,
	callback: (entry: any) => void,
	delay = 500
) {
	let { width: prevWidth, height: prevHeight } = el.getBoundingClientRect();

	const observer = new ResizeObserver(
		debounce(([entry]) => {
			const { width, height } = entry.target.getBoundingClientRect();
			// prevent infinite resize loops if canvas CSS dimensions are not explicitely set
			if (~~width !== ~~prevWidth || ~~height !== ~~prevHeight) {
				callback(entry), (prevWidth = width), (prevHeight = height);
			}
		}, delay)
	);

	observer.observe(el);
}
