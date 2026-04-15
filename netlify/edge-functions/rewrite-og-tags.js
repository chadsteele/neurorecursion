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
		// Use pre-generated static OG image served from /ogimages/
		if (
			condition.background_image &&
			condition.background_image !== "/ogfamily.png"
		) {
			ogImage = `https://neurorecursion.com/ogimages/${condition.id}.png`
			console.log(`[edge] Setting ogImage to: ${ogImage}`)
		} else {
			console.log(
				`[edge] Condition has no background_image or it's ogfamily.png`,
			)
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
			// Use pre-generated static OG image
			if (pioneer.img_url || pioneer.background_url) {
				ogImage = `https://neurorecursion.com/ogimages/pioneer-${pioneer.id}.png`
			}
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
