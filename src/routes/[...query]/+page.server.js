import Conditions from "$lib/Conditions.js"
import Pioneers from "$lib/Pioneers.js"

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
	const queryArray = params.query
	const queryPath = Array.isArray(queryArray)
		? queryArray.join("/")
		: queryArray || ""
	const pathToFind = `/${queryPath}`

	// Helper to convert relative image paths to absolute URLs
	const getAbsoluteImageUrl = (imagePath) => {
		if (!imagePath) return ""
		if (imagePath.startsWith("http")) return imagePath
		return `https://neurorecursion.com${imagePath}`
	}

	// Try to find matching condition by path
	const condition = Conditions.find(
		(c) => c.path.toLowerCase() === pathToFind.toLowerCase(),
	)
	if (condition) {
		return {
			ogTitle: condition.name,
			ogDescription: condition.description,
			ogImage: getAbsoluteImageUrl(condition.background_image),
			ogUrl: `https://neurorecursion.com${condition.path}`,
		}
	}

	// Try to find matching pioneer by path
	const pioneer = Pioneers.find(
		(p) => p.path.toLowerCase() === pathToFind.toLowerCase(),
	)
	if (pioneer) {
		const description = `${pioneer.title} at ${pioneer.institution}\n${pioneer.description}`
		return {
			ogTitle: pioneer.name,
			ogDescription: description,
			ogImage: getAbsoluteImageUrl(
				pioneer.img_url || pioneer.background_url || "",
			),
			ogUrl: `https://neurorecursion.com${pioneer.path}`,
		}
	}

	// Default values
	return {
		ogTitle: "Sign up for remote clinical trials. FREE!",
		ogDescription:
			"Neuro Recursion Institute - Join our clinical research on neurological symptom modulation through targeted neuroplasticity.",
		ogImage: "",
		ogUrl: "https://neurorecursion.com",
	}
}
