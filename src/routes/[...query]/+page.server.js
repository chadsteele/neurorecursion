import Conditions from "$data/Conditions.js"
import Pioneers from "$data/Pioneers.js"

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

export async function load({params}) {
	// Load function required for prerendering, but OG tags are handled by edge function
	// No data needed to be returned - edge function handles all OG rewriting
	return {}
}
