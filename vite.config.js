import {sveltekit} from "@sveltejs/kit/vite"
import {defineConfig} from "vite"
import {resolve} from "path"

export default defineConfig({
	resolve: {
		alias: {
			$data: resolve("./src/data"),
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					// Split large data files into separate chunks
					if (id.includes("src/data/Conditions.js")) {
						return "conditions-data"
					}
					if (id.includes("src/data/Pioneers.js")) {
						return "pioneers-data"
					}
					if (id.includes("src/data/Categories.js")) {
						return "categories-data"
					}
				},
			},
		},
	},
	plugins: [sveltekit()],
})
