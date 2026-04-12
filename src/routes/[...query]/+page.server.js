import Conditions from "$data/Conditions.js"
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

	// Helper to get watermarked image URL via /api/image endpoint
	const getWatermarkedImageUrl = (imagePath) => {
		// If no image path provided, use ogfamily.png as fallback (without watermark)
		const pathToUse = imagePath || "/ogfamily.png"

		// Don't watermark ogfamily.png
		if (pathToUse === "/ogfamily.png") {
			return getAbsoluteImageUrl(pathToUse)
		}

		// Use path-based endpoint for watermarked images
		return `https://neurorecursion.com/api/image${pathToUse}?watermark=true`
	}

	// If no path in URL, return default with ogfamily.png
	if (!queryPath) {
		return {
			ogTitle: "Sign up for remote clinical trials. FREE!",
			ogDescription:
				"Neuro Recursion Institute - Join our clinical research on neurological symptom modulation through targeted neuroplasticity.",
			ogImage: getAbsoluteImageUrl("/ogfamily.png"),
			ogUrl: "https://neurorecursion.com",
		}
	}

	// Try to find matching condition by path
	const condition = Conditions.find(
		(c) => c.path.toLowerCase() === pathToFind.toLowerCase(),
	)
	if (condition) {
		return {
			ogTitle: condition.name,
			ogDescription: condition.description,
			ogImage: getWatermarkedImageUrl(condition.background_image),
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
			ogImage: getWatermarkedImageUrl(
				pioneer.img_url || pioneer.background_url || "",
			),
			ogUrl: `https://neurorecursion.com${pioneer.path}`,
		}
	}

	// Default values (no matching condition or pioneer found)
	return {
		ogTitle: "Sign up for remote clinical trials. FREE!",
		ogDescription:
			"Neuro Recursion Institute - Join our clinical research on neurological symptom modulation through targeted neuroplasticity.",
		ogImage: getWatermarkedImageUrl(""),
		ogUrl: "https://neurorecursion.com",
	}
}
