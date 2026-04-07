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
		id: "arachnophobia-fear-spiders",
		path: "/spider/arachnophobia/fear/phobia",
		name: "Arachnophobia - Fear of Spiders",
	},
	{
		id: "ophidiophobia-fear-snakes",
		path: "/snake/ophidiophobia/fear/phobia",
		name: "Ophidiophobia - Fear of Snakes",
	},
	{
		id: "acrophobia-fear-heights",
		path: "/height/acrophobia/fear/phobia",
		name: "Acrophobia - Fear of Heights",
	},
	{
		id: "glossophobia-fear-public-speaking",
		path: "/speaking/glossophobia/fear/phobia",
		name: "Glossophobia - Fear of Public Speaking",
	},
	{
		id: "agoraphobia-social-phobia",
		path: "/agoraphobia/social/phobia/crowds/open",
		name: "Agoraphobia/Social Phobia",
	},
	{
		id: "aerophobia-fear-flying",
		path: "/flying/aerophobia/fear/phobia",
		name: "Aerophobia - Fear of Flying",
	},
	{
		id: "trypanophobia-fear-needles",
		path: "/needle/trypanophobia/fear/phobia",
		name: "Trypanophobia - Fear of Needles",
	},
	{
		id: "cynophobia-fear-dogs",
		path: "/dog/cynophobia/fear/phobia",
		name: "Cynophobia - Fear of Dogs",
	},
	{
		id: "claustrophobia-fear-enclosed-spaces",
		path: "/enclosed/claustrophobia/fear/phobia",
		name: "Claustrophobia - Fear of Enclosed Spaces",
	},
	{
		id: "astraphobia-fear-storms",
		path: "/storm/astraphobia/fear/phobia",
		name: "Astraphobia - Fear of Storms",
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

/**
 * Score a condition based on word matches with position and field priority weighting
 * (Same logic as src/lib/Conditions.js for consistency)
 */
function scoreCondition(condition, words) {
	const condId = condition.id.toLowerCase()
	const condPath = condition.path.toLowerCase()
	const condName = condition.name.toLowerCase()
	const condDesc = (condition.description || "").toLowerCase()

	const pathSegments = condPath.split("/").filter(Boolean)

	let totalScore = 0
	let matchingWordCount = 0

	for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
		const word = words[wordIndex]
		let wordScore = 0

		const pathPosition = pathSegments.findIndex((seg) => seg.includes(word))
		if (pathPosition !== -1) {
			const positionBonus = 100 - pathPosition * 15
			wordScore += positionBonus
			matchingWordCount++
		}

		if (condName.includes(word)) {
			wordScore += 50 + (10 - wordIndex * 2)
			if (pathPosition === -1) matchingWordCount++
		}

		if (condId.includes(word)) {
			wordScore += 30
			if (pathPosition === -1 && !condName.includes(word))
				matchingWordCount++
		}

		if (condDesc.includes(word) && wordScore < 5) {
			wordScore += 5
		}

		totalScore += wordScore
	}

	const frequencyBonus = 1 + matchingWordCount * 0.2
	return totalScore * frequencyBonus
}

/**
 * Find best matching condition (mirrors src/lib/Conditions.js)
 */
function getCondition(words) {
	if (!words || words.length === 0) return null

	let bestCondition = null
	let bestScore = -1

	for (const condition of CONDITIONS) {
		const score = scoreCondition(condition, words)
		if (score > bestScore) {
			bestScore = score
			bestCondition = condition
		}
	}

	return bestScore > 0 ? bestCondition : null
}

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

	// Extract the path (e.g., "/love" -> "love") and find best matching condition
	const path = pathname.slice(1)
	let matchedCondition = null

	if (path) {
		const words = path
			.toLowerCase()
			.split(/[\s-_/]+/)
			.filter(Boolean)

		matchedCondition = getCondition(words)
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
