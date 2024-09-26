import { rm } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";

function removeFilesInDist(files) {
	return {
		name: "remove-files-in-dist",
		resolveId(source) {
			return source === "virtual-module" ? source : null;
		},
		renderStart(outputOptions, inputOptions) {
			const outDir = outputOptions.dir;
			files
				.map((file) => resolve(outDir, file))
				.forEach((file) => rm(file, () => console.log(`Deleted ${file}`)));
		},
	};
}

export default defineConfig({
	build: {
		// https://vitejs.dev/guide/build.html#library-mode
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "canvas-paint",
			fileName: "canvas-paint",
		},
	},
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version),
	},
	plugins: [removeFilesInDist(["style.css", "vite.svg"])],
});
