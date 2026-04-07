// Minimal conditions data for og tag matching
const CONDITIONS = [
	{
		id: "depressed-suicidal-major-depressive-disorder",
		path: "/depression/suicidal",
		name: "Depressed, Suicidal and/or Major Depressive Disorder",
	},
	{
		id: "developmental-trauma-childhood-trauma",
		path: "/trauma",
		name: "Developmental Trauma (Childhood Trauma)",
	},
	{
		id: "divorce-relational-trauma-family-systems-stress",
		path: "/divorce/love/family/relationships",
		name: "Divorce? - Relational Trauma and Family Systems Stress",
	},
	{
		id: "ptsd-post-traumatic-stress-disorder",
		path: "/ptsd/post/traumatic",
		name: "PTSD - Post-Traumatic Stress Disorder",
	},
	{
		id: "ocd-obsessive-compulsive",
		path: "/ocd/obsessive/compulsive",
		name: "OCD - Obsessive-Compulsive Disorder",
	},
	{
		id: "anxiety-social-panic",
		path: "/anxiety/social/panic",
		name: "Anxiety - Social and Panic Disorders",
	},
	{
		id: "adhd-attention-deficit",
		path: "/adhd/attention/deficit",
		name: "ADHD - Attention Deficit Hyperactivity Disorder",
	},
	{
		id: "bipolar-mood-disorder",
		path: "/bipolar/mood/disorder",
		name: "Bipolar - Mood Disorder",
	},
	{
		id: "schizophrenia-psychosis",
		path: "/schizophrenia/psychosis",
		name: "Schizophrenia - Psychosis",
	},
	{
		id: "eating-disorder-anorexia-bulimia",
		path: "/eating/disorder/anorexia",
		name: "Eating Disorder - Anorexia & Bulimia",
	},
	{
		id: "substance-abuse-addiction",
		path: "/substance/abuse/addiction",
		name: "Substance Abuse - Addiction",
	},
	{
		id: "insomnia-sleep-disorder",
		path: "/insomnia/sleep/disorder",
		name: "Insomnia - Sleep Disorder",
	},
	{
		id: "chronic-pain-somatic",
		path: "/pain/chronic/somatic",
		name: "Chronic Pain - Somatic Symptom",
	},
	{
		id: "autism-spectrum-disorder",
		path: "/autism/spectrum",
		name: "Autism - Spectrum Disorder",
	},
	{
		id: "selective-mutism-silence",
		path: "/mutism/selective/silence",
		name: "Selective Mutism - Communication Disorder",
	},
	{
		id: "autism-adhd-neurodiversity",
		path: "/neurodiversity",
		name: "Neurodiversity - Autism & ADHD",
	},
]

export default async (request, context) => {
	const url = new URL(request.url)
	const pathname = url.pathname

	// Skip for static and non-query routes
	if (
		pathname === "/" ||
		pathname === "/careers" ||
		pathname === "/consent" ||
		pathname === "/success" ||
		pathname.startsWith("/static/") ||
		pathname.startsWith("/images/") ||
		pathname.endsWith(".js") ||
		pathname.endsWith(".css")
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

			for (const condition of CONDITIONS) {
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
		let html = await response.text()

		// Inject verification meta tag before closing </head>
		html = html.replace(
			/<\/head>/i,
			`<meta name="x-edge-function" content="rewrite-og-tags" />\n</head>`,
		)

		// Replace og:url - handle any whitespace/newlines
		html = html.replace(
			/<meta\s+property="og:url"[^>]*>/i,
			`<meta property="og:url" content="${request.url.replace(/"/g, "&quot;")}" />`,
		)

		// Replace og:title - handle any whitespace/newlines
		html = html.replace(
			/<meta\s+property="og:title"[^>]*>/i,
			`<meta property="og:title" content="${matchedCondition.name.replace(/"/g, "&quot;")}" />`,
		)

		// Replace og:description - handle any whitespace/newlines
		html = html.replace(
			/<meta\s+property="og:description"[^>]*>/i,
			`<meta property="og:description" content="A comprehensive research program addressing ${matchedCondition.name.toLowerCase()}" />`,
		)

		// Create new response with modified headers
		const headers = new Headers(response.headers)
		headers.set("cache-control", "public, max-age=3600")

		return new Response(html, {
			status: response.status,
			statusText: response.statusText,
			headers: headers,
		})
	}

	return response
}

export const config = {
	path: "/*",
}
