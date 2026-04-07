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
		id: "migraine-headache",
		path: "/migraine/headache",
		name: "Migraine - Chronic Headache",
	},
	{
		id: "stutter-fluency-stammer",
		path: "/stutter/fluency/stammer",
		name: "Stutter - Speech Fluency",
	},
	{
		id: "asd-autism-spectrum",
		path: "/asd/autism/aspergers/spectrum",
		name: "ASD - Autism Spectrum Disorder",
	},
	{
		id: "adhd-attention-deficit",
		path: "/adhd/attention/deficit/hyperactivity",
		name: "ADHD - Attention Deficit Hyperactivity Disorder",
	},
	{
		id: "bipolar-mood-disorder",
		path: "/bipolar",
		name: "Bipolar - Mood Disorder",
	},
	{
		id: "rage-anger-ied",
		path: "/rage/anger/ied",
		name: "Rage - Intermittent Explosive Disorder",
	},
	{
		id: "addiction-substance-abuse",
		path: "/addiction/substance/abuse",
		name: "Addiction - Substance Abuse",
	},
	{
		id: "tics-tourette",
		path: "/tics/tourette",
		name: "Tics - Tourette Syndrome",
	},
	{
		id: "epilepsy-seizure",
		path: "/epilepsy/seizure",
		name: "Epilepsy - Seizure Disorder",
	},
	{
		id: "ocd-obsessive-compulsive",
		path: "/ocd/obsessive/compulsive",
		name: "OCD - Obsessive-Compulsive Disorder",
	},
	{
		id: "spd-sensory-processing",
		path: "/spd/sensory/processing",
		name: "SPD - Sensory Processing Disorder",
	},
	{
		id: "misophonia-selective-sound",
		path: "/misophonia/selective/sound/sensitivity",
		name: "Misophonia - Selective Sound Sensitivity",
	},
	{
		id: "mutism-selective-silence",
		path: "/mutism/selective/silence",
		name: "Selective Mutism - Communication Disorder",
	},
	{
		id: "dyspraxia-motor-coordination",
		path: "/dyspraxia/motor/coordination",
		name: "Dyspraxia - Motor Coordination Disorder",
	},
	{
		id: "dyscalculia-math-numbers",
		path: "/dyscalculia/math/numbers",
		name: "Dyscalculia - Math Learning Disorder",
	},
	{
		id: "dysgraphia-writing-handwriting",
		path: "/dysgraphia/writing/handwriting",
		name: "Dysgraphia - Writing Disorder",
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
