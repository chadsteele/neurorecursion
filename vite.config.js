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
		chunkSizeWarningLimit: 1500, // Increased: main chunk is 853KB uncompressed but only 122KB gzipped
		rollupOptions: {
			output: {
				manualChunks(id) {
					// Prevent data files from being bundled into client chunks
					// These should only exist on the server side for SSR/prerendering
					if (id.includes("src/data/Conditions.js")) {
						return "conditions-data"
					}
					if (id.includes("src/data/Pioneers.js")) {
						return "pioneers-data"
					}
					if (id.includes("src/data/Categories.js")) {
						return "categories-data"
					}
					if (id.includes("src/data/")) {
						return "data-files"
					}
				},
			},
		},
		// Exclude large data files from client bundle
		ssrNoExternal: ["src/data/*"],
	},
	plugins: [sveltekit()],
})
