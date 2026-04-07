import Conditions from "$lib/Conditions.js"

// Server actions can no longer be used with prerendering
// Forms now use client-side AJAX submission to Netlify Forms
// The page is prerendered, and Netlify's JavaScript handles form interception at runtime
export const prerender = true

export function load({params}) {
	// Get the query path segments
	const queryArray = params.query
	const query = Array.isArray(queryArray) ? queryArray.join("/") : queryArray

	let matchedCondition = null

	if (query) {
		// Extract all words from the query path, maintaining order
		const words = query
			.toLowerCase()
			.split(/[\s-_/]+/)
			.filter(Boolean)

		// Try each word in order to find a matching condition
		for (const word of words) {
			if (matchedCondition) break

			// Search in condition id, path, and name
			for (const condition of Conditions) {
				const conditionId = condition.id.toLowerCase()
				const conditionPath = condition.path.toLowerCase()
				const conditionName = condition.name.toLowerCase()

				if (
					conditionId.includes(word) ||
					conditionPath.includes(word) ||
					conditionName.includes(word)
				) {
					matchedCondition = condition
					break
				}
			}
		}
	}

	// Set page title and meta tags via returned data
	return {
		matchedCondition,
		title:
			matchedCondition?.name ||
			"Sign up for remote clinical trials.  FREE!",
		description:
			matchedCondition?.description ||
			"Neuro Recursion Institute - Join our clinical research on neurological symptom modulation through targeted neuroplasticity.",
	}
}
