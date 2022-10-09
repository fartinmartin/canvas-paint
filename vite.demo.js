import { defineConfig } from "vite";

export default defineConfig({
	base: `/canvas-paint/`,
	build: {
		outDir: "demo",
	},
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version),
	},
});
