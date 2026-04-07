import Conditions from "../../src/lib/Conditions.js"

export default async (request, context) => {
	const url = new URL(request.url)
	const pathname = url.pathname

	// Skip for non-query routes
	if (
		pathname === "/" ||
		pathname === "/careers" ||
		pathname === "/consent" ||
		pathname === "/success" ||
		pathname.startsWith("/static/") ||
		pathname.startsWith("/images/")
	) {
		return
	}

	// Get the response
	const response = await context.next()

	// Only modify HTML responses
	if (!response.headers.get("content-type")?.includes("text/html")) {
		return response
	}

	// Extract the path (e.g., "/love" -> "love")
	const path = pathname.slice(1)

	// Try to match against conditions
	let matchedCondition = null

	if (path) {
		const words = path
			.toLowerCase()
			.split(/[\s-_/]+/)
			.filter(Boolean)

		for (const word of words) {
			if (matchedCondition) break

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

	// If we found a matching condition, rewrite og tags
	if (matchedCondition) {
		const html = await response.text()

		// Replace og:title - handle multi-line formatting
		const newHtml = html
			.replace(
				/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/is,
				`<meta property="og:title" content="${matchedCondition.name.replace(/"/g, "&quot;")}" />`,
			)
			// Replace og:description - handle multi-line formatting
			.replace(
				/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/is,
				`<meta property="og:description" content="${matchedCondition.description.replace(/"/g, "&quot;")}" />`,
			)

		return new Response(newHtml, {
			status: response.status,
			statusText: response.statusText,
			headers: response.headers,
		})
	}

	return response
}

export const config = {
	path: "/*",
}
