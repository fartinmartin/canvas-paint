import { defineConfig } from "vite";

export default defineConfig({
	base: "./",
	build: {
		outDir: "docs",
	},
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version),
	},
});
