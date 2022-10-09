import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		// https://vitejs.dev/guide/build.html#library-mode
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "canvas-paint",
			fileName: "canvas-paint",
		},
		// https://vitejs.dev/guide/build.html#multi-page-app
		// rollupOptions: {
		// 	input: "index.hmtl",
		// 	output: {
		// 		dir: "./demo",
		// 	},
		// },
	},
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version),
	},
});
