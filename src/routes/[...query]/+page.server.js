import Conditions from "$lib/Conditions.js"

export const prerender = "auto"

// Generate prerender entries for all condition paths and keywords
export function entries() {
	const paths = new Set()

	Conditions.forEach((condition) => {
		// Add the full path
		const fullPath = condition.path.slice(1) // Remove leading slash
		paths.add(fullPath)

		// Also add each individual word from the path
		// e.g., "/depression/suicidal" -> also add "depression" and "suicidal"
		const words = fullPath.split("/").filter(Boolean)
		words.forEach((word) => {
			paths.add(word)
		})
	})

	return Array.from(paths).map((path) => {
		return {query: path}
	})
}
