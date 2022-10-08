import { resolve } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "canvas-paint",
			fileName: "canvas-paint",
		},
	},
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version),
	},
});
