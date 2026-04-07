import Conditions from "$lib/Conditions.js"

export async function handle({event, resolve}) {
	let response = await resolve(event)

	// Only modify HTML responses for the [...query] route
	if (
		event.url.pathname !== "/" &&
		event.url.pathname !== "/careers" &&
		event.url.pathname !== "/consent" &&
		event.url.pathname !== "/success"
	) {
		// Extract the path (e.g., "/love" -> "love")
		const path = event.url.pathname.slice(1)

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

		// If we found a matching condition, inject og tags into the HTML
		if (
			matchedCondition &&
			response.headers.get("content-type")?.includes("text/html")
		) {
			let html = await response.text()

			// Replace og:title
			html = html.replace(
				/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
				`<meta property="og:title" content="${matchedCondition.name.replace(/"/g, "&quot;")}" />`,
			)

			// Replace og:description
			html = html.replace(
				/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
				`<meta property="og:description" content="${matchedCondition.description.replace(/"/g, "&quot;")}" />`,
			)

			// Return new response with modified HTML
			return new Response(html, {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
			})
		}
	}

	return response
}
