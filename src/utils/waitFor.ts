export function waitFor(delay: number) {
	return new Promise((resolve) => setTimeout(resolve, delay));
}
