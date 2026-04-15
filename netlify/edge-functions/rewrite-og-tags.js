import Conditions from "../../src/data/Conditions.js"
import Pioneers from "../../src/data/Pioneers.js"

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

	// Try to find matching condition
	const condition = Conditions.find(
		(c) => c.path.toLowerCase() === searchPath.toLowerCase(),
	)

	if (condition) {
		console.log(`[edge] Matched condition: ${condition.id}`)
		ogTitle = condition.name
		ogDescription = condition.description
		// Generate watermarked image URL if condition has background
		if (
			condition.background_image &&
			condition.background_image !== "/ogfamily.png"
		) {
			ogImage = `https://neurorecursion.com/api/image${condition.background_image}?watermark=true`
		}
	} else {
		// Try to find matching pioneer
		const pioneer = Pioneers.find(
			(p) => p.path.toLowerCase() === searchPath.toLowerCase(),
		)

		if (pioneer) {
			console.log(`[edge] Matched pioneer: ${pioneer.id}`)
			ogTitle = pioneer.name
			ogDescription = `${pioneer.title} at ${pioneer.institution}\n${pioneer.description}`
			if (pioneer.img_url || pioneer.background_url) {
				ogImage = `https://neurorecursion.com/api/image${
					pioneer.img_url || pioneer.background_url
				}?watermark=true`
			}
		}
	}

	// Replace og:url meta tag
	html = html.replace(
		/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
		`<meta property="og:url" content="${ogUrl}" />`,
	)

	// Replace og:title meta tag
	html = html.replace(
		/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
		`<meta property="og:title" content="${escapeHtml(ogTitle)}" />`,
	)

	// Replace og:description meta tag
	html = html.replace(
		/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
		`<meta property="og:description" content="${escapeHtml(ogDescription)}" />`,
	)

	// Replace og:image meta tag
	html = html.replace(
		/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
		`<meta property="og:image" content="${ogImage}" />`,
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
