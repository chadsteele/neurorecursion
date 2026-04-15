export default async (request, context) => {
	// Get the response from the next handler (SvelteKit)
	const response = await context.next()

	// Only rewrite HTML responses
	const contentType = response.headers.get("content-type") || ""
	if (!contentType.includes("text/html")) {
		return response
	}

	// Clone the response so we can modify it
	let html = await response.text()

	// Extract the actual request URL
	const url = new URL(request.url)
	const pathname = url.pathname

	console.log(`[edge] Rewriting OG tags for: ${pathname}`)

	// Extract path from URL (remove leading/trailing slashes)
	const pathToFind = pathname.replace(/^\/|\/$/g, "")
	const searchPath = `/${pathToFind}`

	let ogTitle = "Sign up for remote clinical trials. FREE!"
	let ogDescription =
		"Neuro Recursion Institute - our clinical trial is fast, easy, no drugs, devices or hypnotherapy.  This could be your breakthrough. Join us and experience the future of mental health treatment today."
	let ogImage = "https://neurorecursion.com/ogfamily.png"
	let ogUrl = url.href

	// Map path to OG image ID
	// For conditions: path like "/remote-clinical-trial/free/chrometophobia/fear-money/financial-anxiety"
	// Maps to: "chrometophobia-fear-money"
	// For pioneers: path like "/pioneers/daniel-goleman"
	// Maps to: "pioneer-daniel-goleman"

	if (searchPath.startsWith("/pioneers/")) {
		const pioneerId = searchPath
			.replace("/pioneers/", "")
			.replace(/\/$/, "")
		if (pioneerId) {
			ogImage = `https://neurorecursion.com/ogimages/pioneer-${pioneerId}.png`
			console.log(`[edge] Using pioneer image: ${ogImage}`)
		}
	} else if (searchPath.startsWith("/remote-clinical-trial/")) {
		// Extract condition ID from path
		// Path format: /remote-clinical-trial/free/condition-name/variant-name/full-name
		// We need the condition-name/variant-name part
		const parts = searchPath.split("/").filter((p) => p)
		if (parts.length >= 4) {
			// parts[0] = "remote-clinical-trial"
			// parts[1] = "free"
			// parts[2] = condition-name
			// parts[3] = variant-name
			const conditionId = `${parts[2]}-${parts[3]}`
			ogImage = `https://neurorecursion.com/ogimages/${conditionId}.png`
			console.log(`[edge] Using condition image: ${ogImage}`)
		}
	}

	// Replace og:url meta tag
	const urlBefore = html.includes('property="og:url"')
	html = html.replace(
		/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
		`<meta property="og:url" content="${ogUrl}" />`,
	)
	console.log(
		`[edge] og:url replaced: ${urlBefore} -> ${html.includes(`content="${ogUrl}"`) && html.includes('property="og:url"')}`,
	)

	// Replace og:title meta tag
	const titleBefore = html.includes('property="og:title"')
	html = html.replace(
		/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
		`<meta property="og:title" content="${escapeHtml(ogTitle)}" />`,
	)
	console.log(`[edge] og:title replaced: ${titleBefore}`)

	// Replace og:description meta tag
	const descBefore = html.includes('property="og:description"')
	html = html.replace(
		/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
		`<meta property="og:description" content="${escapeHtml(ogDescription)}" />`,
	)
	console.log(`[edge] og:description replaced: ${descBefore}`)

	// Replace og:image meta tag
	const imageBefore = html.includes('property="og:image"')
	console.log(`[edge] Before og:image replace - ogImage value: ${ogImage}`)
	html = html.replace(
		/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
		`<meta property="og:image" content="${ogImage}" />`,
	)
	const imageAfter =
		html.includes(`content="${ogImage}"`) &&
		html.includes('property="og:image"')
	console.log(
		`[edge] og:image replaced: ${imageBefore} -> ${imageAfter}, new value: ${ogImage}`,
	)

	console.log(`[edge] OG tags rewritten for: ${pathname}`)

	// Return modified response
	return new Response(html, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers,
	})
}

// Escape HTML special characters in meta tag values
function escapeHtml(text) {
	if (!text) return ""
	const map = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#039;",
	}
	return text.replace(/[&<>"']/g, (m) => map[m])
}

export const config = {
	path: "/*",
}
