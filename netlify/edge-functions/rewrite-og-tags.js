// Path -> Condition ID lookup (auto-generated from metadata)
const PATH_TO_ID = {
	"/remote-clinical-trial/free/depression/suicidal":
		"depressed-suicidal-major-depressive-disorder",
	"/remote-clinical-trial/free/trauma":
		"developmental-trauma-childhood-trauma",
	"/remote-clinical-trial/free/cult-recovery/religious-trauma/damnation/recovery":
		"cult-recovery-religious-trauma-damnation-fear",
	"/remote-clinical-trial/free/divorce/love/family/relationships":
		"divorce-relational-trauma-family-systems-stress",
	"/remote-clinical-trial/free/attachment/anxious/avoidant/relational-patterns":
		"anxious-avoidant-attachment-relational-patterns",
	"/remote-clinical-trial/free/loneliness/isolation/social-disconnection":
		"loneliness-social-disconnection",
	"/remote-clinical-trial/free/ptsd/post/traumatic":
		"ptsd-post-traumatic-stress-disorder",
	"/remote-clinical-trial/free/migraine/headache": "migraines",
	"/remote-clinical-trial/free/health-anxiety/hypochondria/health-preoccupation":
		"health-anxiety-hypochondriasis",
	"/remote-clinical-trial/free/chronic-pain/psychosomatic/pain-amplification":
		"chronic-pain-psychosomatic",
	"/remote-clinical-trial/free/stutter/fluency/stammer":
		"stuttering-childhood-onset-fluency-disorder",
	"/remote-clinical-trial/free/spider/arachnophobia/fear/phobia":
		"arachnophobia-fear-spiders",
	"/remote-clinical-trial/free/snake/ophidiophobia/fear/phobia":
		"ophidiophobia-fear-snakes",
	"/remote-clinical-trial/free/height/acrophobia/fear/phobia":
		"acrophobia-fear-heights",
	"/remote-clinical-trial/free/speaking/glossophobia/fear/phobia":
		"glossophobia-fear-public-speaking",
	"/remote-clinical-trial/free/imposter/syndrome/fraud/inadequacy":
		"imposter-syndrome",
	"/remote-clinical-trial/free/performance-anxiety/evaluation/judgment/social-threat":
		"performance-anxiety-evaluation-fear",
	"/remote-clinical-trial/free/agoraphobia/social/phobia/crowds/open":
		"agoraphobia-social-phobia",
	"/remote-clinical-trial/free/flying/aerophobia/fear/phobia":
		"aerophobia-fear-flying",
	"/remote-clinical-trial/free/rejection-sensitivity/rejection-dysphoria/social-pain":
		"rejection-sensitivity-dysphoria",
	"/remote-clinical-trial/free/dog/cynophobia/fear/phobia":
		"cynophobia-fear-dogs",
	"/remote-clinical-trial/free/needle/trypanophobia/fear/phobia":
		"trypanophobia-fear-needles",
	"/remote-clinical-trial/free/enclosed/claustrophobia/fear/phobia":
		"claustrophobia-fear-enclosed-spaces",
	"/remote-clinical-trial/free/storm/astraphobia/fear/phobia":
		"astraphobia-fear-storms",
	"/remote-clinical-trial/free/asd/autism/aspergers/spectrum":
		"asd-autism-aspergers-autistic-spectrum-disorder",
	"/remote-clinical-trial/free/adhd/attention/deficit/hyperactivity":
		"adhd-attention-deficit-hyperactivity-disorder",
	"/remote-clinical-trial/free/bipolar": "bpd-bipolar-disorder",
	"/remote-clinical-trial/free/gun-addiction/weapons/firearms/compulsive":
		"gun-addiction-weapons-firearms",
	"/remote-clinical-trial/free/homicidal-ideation/violent-thoughts/harm-urges":
		"homicidal-ideation-violent-thoughts",
	"/remote-clinical-trial/free/rage/anger/ied":
		"ied-rage-intermittent-explosive-disorder",
	"/remote-clinical-trial/free/burnout/exhaustion/depersonalization/work-stress":
		"burnout-exhaustion-depersonalization",
	"/remote-clinical-trial/free/alcohol/substance/abuse":
		"alcohol-substance-abuse",
	"/remote-clinical-trial/free/screen-addiction/technology/compulsive-use":
		"screen-addiction",
	"/remote-clinical-trial/free/porn-addiction/sexual-compulsivity/compulsive-use":
		"porn-addiction-sexual-compulsivity",
	"/remote-clinical-trial/free/sexual-dysfunction/impotence/performance-anxiety/ed":
		"sexual-dysfunction-performance-anxiety-impotence",
	"/remote-clinical-trial/free/fear-intimacy/commitment/closeness-phobia":
		"fear-of-intimacy-commitment-fear",
	"/remote-clinical-trial/free/ai-anxiety/technophobia/fear-artificial-intelligence":
		"ai-anxiety-technophobia-fear-ai",
	"/remote-clinical-trial/free/social-media-anxiety/fomo/comparison/digital-judgment":
		"social-media-anxiety-disorder",
	"/remote-clinical-trial/free/paranoia/fear-strangers/crime-threat/persecution":
		"paranoia-scelerephobia-fear-strangers-criminals",
	"/remote-clinical-trial/free/tics/tourette":
		"tics-tourette-syndrome-tic-disorders",
	"/remote-clinical-trial/free/epilepsy/seizure":
		"epilepsy-seizure-disorders",
	"/remote-clinical-trial/free/insomnia/sleep/hyperarousal/wakefulness":
		"insomnia-sleep-hyperarousal",
	"/remote-clinical-trial/free/ocd/obsessive/compulsive":
		"ocd-obsessive-compulsive-disorder",
	"/remote-clinical-trial/free/trichotillomania/hair-pulling/body-focused-repetitive":
		"trichotillomania-hair-pulling",
	"/remote-clinical-trial/free/body-dysmorphia/body-image/appearance-preoccupation":
		"body-dysmorphia",
	"/remote-clinical-trial/free/eating-disorders/anorexia/bulimia/binge-eating":
		"eating-disorders-anorexia-bulimia-binge",
	"/remote-clinical-trial/free/spd/sensory/processing":
		"spd-sensory-processing-disorder",
	"/remote-clinical-trial/free/misophonia/selective/sound/sensitivity":
		"misophonia",
	"/remote-clinical-trial/free/mutism/selective/silence": "selective-mutism",
	"/remote-clinical-trial/free/dyspraxia/motor/coordination":
		"dcd-dyspraxia-developmental-coordination-disorder",
	"/remote-clinical-trial/free/dyscalculia/math/numbers": "dyscalculia",
	"/remote-clinical-trial/free/test-anxiety/academic-performance/exam-anxiety":
		"test-anxiety",
	"/remote-clinical-trial/free/perfectionism/impossible-standards/self-imposed-threat":
		"perfectionism",
	"/remote-clinical-trial/free/dysgraphia/writing/handwriting": "dysgraphia",
	"/remote-clinical-trial/free/generalized/anxiety":
		"generalized-anxiety-disorder",
	"/remote-clinical-trial/free/chronophobia/fear/time":
		"chronophobia-fear-time-future",
	"/remote-clinical-trial/free/thanatophobia/death/anxiety":
		"thanatophobia-death-anxiety",
	"/remote-clinical-trial/free/moral-injury/values/violation":
		"moral-injury-values-violation",
	"/remote-clinical-trial/free/general-fears-phobias":
		"general-fears-phobias",
	"/remote-clinical-trial/free/seasonal-affective-disorder":
		"seasonal-affective-disorder-sad",
	"/remote-clinical-trial/free/perinatal-depression":
		"perinatal-depression-paternal-postpartum-depression",
	"/remote-clinical-trial/free/menopausal-depression":
		"menopausal-depression",
	"/remote-clinical-trial/free/general-mood-disorders":
		"general-mood-disorders",
	"/remote-clinical-trial/free/dyslexia/reading/disorder":
		"dyslexia-reading-disorder",
	"/remote-clinical-trial/free/general-neurodevelopmental":
		"general-neurodevelopmental-issues",
	"/remote-clinical-trial/free/gambling-addiction": "gambling-addiction",
	"/remote-clinical-trial/free/food-addiction": "food-addiction",
	"/remote-clinical-trial/free/general-addictions": "general-addictions",
	"/remote-clinical-trial/free/anxiety-somatization/physical-symptoms/health-anxiety":
		"anxiety-somatization-physical-symptoms-health-anxiety",
	"/remote-clinical-trial/free/general-neurological-issues":
		"general-neurological-issues",
	"/remote-clinical-trial/free/self-esteem-identity":
		"self-esteem-identity-issues",
	"/remote-clinical-trial/free/general-performance-issues":
		"general-performance-issues",
	"/remote-clinical-trial/free/cutting-self-harm": "cutting-self-harm",
	"/remote-clinical-trial/free/hoarding-disorder": "hoarding-disorder",
	"/remote-clinical-trial/free/general-ocd-spectrum": "general-ocd-spectrum",
	"/remote-clinical-trial/free/relationship-jealousy":
		"relationship-jealousy-insecurity",
	"/remote-clinical-trial/free/codependency":
		"codependency-relational-enmeshment",
	"/remote-clinical-trial/free/general-attachment-issues":
		"general-attachment-issues",
	"/remote-clinical-trial/free/aphasia": "aphasia-language-disorder",
	"/remote-clinical-trial/free/general-communication-issues":
		"general-communication-issues",
	"/remote-clinical-trial/free/trauma-drama": "trauma-drama-etc",
	"/remote-clinical-trial/free/power-control-issues": "power-control-issues",
	"/remote-clinical-trial/free/rape-sexual-assault": "rape-sexual-assault",
	"/remote-clinical-trial/free/stockholm-syndrome":
		"stockholm-syndrome-trauma-bonding",
	"/remote-clinical-trial/free/sex-addiction": "sex-addiction",
	"/remote-clinical-trial/free/homophobia/sexual-orientation/gender-identity":
		"homophobia-transphobia-sexual-orientation-gender-identity-prejudice",
	"/remote-clinical-trial/free/racism/xenophobia/ethnic-prejudice":
		"racism-xenophobia-ethnic-prejudice",
	"/remote-clinical-trial/free/misogyny/gender-based-violence/fear-of-women":
		"misogyny-gender-based-violence",
	"/remote-clinical-trial/free/tribalism/groupthink/ingroup-outgroup-bias":
		"tribalism-groupthink-ingroup-outgroup-bias",
	"/remote-clinical-trial/free/maternal-wound/mother-complex/maternal-attachment":
		"maternal-wound-mother-complex",
	"/remote-clinical-trial/free/paternal-wound/father-complex/paternal-attachment":
		"paternal-wound-father-complex",
	"/remote-clinical-trial/free/parenting-stress/parental-anxiety/parental-inadequacy":
		"parenting-stress-anxiety-inadequacy-parental-overwhelm",
	"/remote-clinical-trial/free/stepfamily/blended-family/family-integration":
		"stepfamily-blended-family-adjustment-family-integration-stress",
	"/remote-clinical-trial/free/coparenting-custody-conflict/family-separation-anxiety":
		"coparenting-custody-conflict-separation-anxiety",
	"/remote-clinical-trial/free/adolescent-identity/self-discovery/identity-formation":
		"adolescent-identity-development-self-discovery",
	"/remote-clinical-trial/free/adolescent-angst/oppositional-defiance/autonomy-conflict":
		"adolescent-angst-oppositional-defiance",
	"/remote-clinical-trial/free/sexual-identity/gender-dysphoria/social-dysphoria":
		"adolescent-sexual-identity-exploration-social-dysphoria",
	"/remote-clinical-trial/free/emo-subculture/alternative-identity/emotional-expression":
		"teen-emo-subculture-emotional-expression",
	"/remote-clinical-trial/free/victim-identity/learned-helplessness/powerlessness":
		"adolescent-victim-identity-learned-helplessness",
	"/remote-clinical-trial/free/adolescent-risk/impulsivity/executive-dysfunction":
		"adolescent-risk-impulsivity-executive-dysfunction",
	"/remote-clinical-trial/free/teen-substance-abuse/adolescent-addiction/substance-dependence":
		"teen-substance-abuse-addiction",
	"/remote-clinical-trial/free/teen-gang/tribal-belonging/gang-identity":
		"teen-gang-involvement-tribalism",
	"/remote-clinical-trial/free/teen-screen-addiction/digital-escapism/internet-dependence":
		"teen-screen-addiction-digital-escapism",
	"/remote-clinical-trial/free/teen-bullying/aggressive-defense/peer-aggression":
		"bullying-cyberbullying-peer-aggression",
	"/remote-clinical-trial/free/teen-crisis/survival-behaviors/acute-distress":
		"teen-crisis-survival-behaviors",
	"/remote-clinical-trial/free/teen-runaway/elopement/escape-behavior":
		"runaway-elopement-escape-behavior",
	"/remote-clinical-trial/free/teen-suicide/self-harm/suicidal-intent":
		"teen-suicidal-ideation-self-harm",
	"/remote-clinical-trial/free/adolescent-abandonment/trauma-hypervigilance/rejection-sensitivity":
		"adolescent-abandonment-trauma-hypervigilance",
	"/remote-clinical-trial/free/foster-family/reactive-attachment/family-integration":
		"teen-foster-family-integration-reactive-attachment",
	"/remote-clinical-trial/free/social-mimicry/identity-diffusion/authentic-self":
		"adolescent-social-mimicry-identity-diffusion",
	"/remote-clinical-trial/free/food-phobia/arfid/avoidant-restriction":
		"food-phobia-arfid",
	"/remote-clinical-trial/free/narcissism/personality/pride":
		"narcissistic-personality-disorder-pride",
	"/remote-clinical-trial/free/borderline/personality/envy":
		"bpd-borderline-personality-disorder",
	"/remote-clinical-trial/free/depression/major-depressive/anhedonia":
		"major-depressive-disorder-sloth",
	"/remote-clinical-trial/free/avoidant/cowardice/social-inhibition":
		"avoidant-personality-disorder-cowardice",
	"/remote-clinical-trial/free/panic/agoraphobia/fear-escape":
		"panic-disorder-agoraphobia-fear",
	"/remote-clinical-trial/free/antisocial/deception/manipulation":
		"antisocial-personality-disorder-deception",
	"/remote-clinical-trial/free/histrionic/attention/dramatic-behavior":
		"histrionic-personality-disorder-attention-seeking",
	"/remote-clinical-trial/free/factitious/munchausen/medical-deception":
		"factitious-disorder-munchausen",
	"/remote-clinical-trial/free/grief/loss/complicated-bereavement":
		"complicated-grief-prolonged-grieving",
	"/remote-clinical-trial/free/anticipatory-grief/loss/terminal-illness":
		"anticipatory-grief-terminal-illness",
	"/remote-clinical-trial/free/family-of-addicts/adult-children/inherited-patterns":
		"family-of-addicts-adult-children-inherited-patterns",
	"/remote-clinical-trial/free/relational-betrayal/infidelity/trust-rupture":
		"betrayal-trauma-infidelity",
	"/remote-clinical-trial/free/drama-triangle/rescuer/karpman-role":
		"rescuer-syndrome-caretaker-compulsion",
	"/remote-clinical-trial/free/aging/geriatric/late-life-depression":
		"geriatric-depression-aging-loss",
	"/remote-clinical-trial/free/aging/identity/meaning-loss":
		"identity-loss-aging-life-stage",
	"/remote-clinical-trial/free/sexual-health/dysfunction/intimacy-connection":
		"sexual-dysfunction-intimacy-avoidance",
	"/remote-clinical-trial/free/drama-triangle/persecutor/karpman-aggression":
		"persecutor-role-aggressive-control",
	"/remote-clinical-trial/free/pathological-lying/factitious-identity/chronic-deception":
		"pathological-lying-factitious-identity",
	"/remote-clinical-trial/free/empty-nest/marital-crisis/identity-loss":
		"empty-nest-syndrome-marital-disconnection",
	"/remote-clinical-trial/free/stage-fright/live-performance/audience-anxiety":
		"stage-fright-performance-anxiety-live-audience",
	"/remote-clinical-trial/free/procrastination/avoidance/executive-dysfunction":
		"chronic-procrastination-failure-to-launch-incompletions",
	"/remote-clinical-trial/free/chrometophobia/fear-money/financial-anxiety":
		"chrometophobia-fear-money",
	"/remote-clinical-trial/free/scarcity/poverty-mindset/survival-fixation":
		"scarcity-mindset-resource-poverty",
	"/remote-clinical-trial/free/money-dysmorphia/financial-distortion/wealth-misperception":
		"money-dysmorphia-financial-distortion",
	"/remote-clinical-trial/free/money-scripts/unconscious-beliefs/financial-programming":
		"money-scripts-unconscious-beliefs",
	"/remote-clinical-trial/free/affluenza/sudden-wealth/identity-crisis":
		"affluenza-wealth-integration-identity-loss",
	"/remote-clinical-trial/free/financial-infidelity/hidden-debt/relational-deception":
		"financial-infidelity-hidden-transactions",
	"/remote-clinical-trial/free/financial-trauma/bankruptcy/loss-displacement":
		"financial-flashpoint-trauma",
	"/remote-clinical-trial/free/financial-anxiety/money-worry/cynicism":
		"general-financial-anxiety-cynicism",
}

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
	let ogImage =
		"https://neurorecursion-assets.netlify.app/assets/ogfamily.png"
	let ogUrl = url.href

	// Helper function to convert kebab-case to Title Case
	function toTitleCase(str) {
		return str
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ")
	}

	// Map path to condition-specific OG tags on asset domain
	// For conditions: path like "/remote-clinical-trial/free/procrastination/avoidance/executive-dysfunction"
	// For pioneers: path like "/pioneers/daniel-goleman"

	if (searchPath.startsWith("/pioneers/")) {
		const pioneerId = searchPath
			.replace("/pioneers/", "")
			.replace(/\/$/, "")
		if (pioneerId) {
			const pioneerName = toTitleCase(pioneerId)
			ogTitle = `${pioneerName} | Neuroscience Pioneer`
			ogDescription = `Learn about ${pioneerName}'s groundbreaking contributions to neuroscience research and neuroplasticity at Neuro Recursion Institute.`
			ogImage = `https://neurorecursion-assets.netlify.app/assets/pioneers/pioneer-${pioneerId}.png`
			console.log(`[edge] Pioneer: ${pioneerName}`)
		}
	} else if (searchPath.startsWith("/remote-clinical-trial/")) {
		// Look up the condition ID from PATH_TO_ID mapping
		const conditionId = PATH_TO_ID[searchPath]

		if (conditionId) {
			// Extract first two path segments for title/description
			const parts = searchPath.split("/").filter((p) => p)
			if (parts.length >= 3) {
				const conditionName = toTitleCase(parts[2])
				const variantName = parts[3] ? toTitleCase(parts[3]) : ""

				ogTitle = variantName
					? `${conditionName} (${variantName}) | Clinical Trial`
					: `${conditionName} | Clinical Trial`
				ogDescription = variantName
					? `Evidence-based treatment for ${conditionName.toLowerCase()} related to ${variantName.toLowerCase()} through targeted neuroplasticity at Neuro Recursion Institute.`
					: `Evidence-based treatment for ${conditionName.toLowerCase()} through targeted neuroplasticity at Neuro Recursion Institute.`
				ogImage = `https://neurorecursion-assets.netlify.app/assets/ogimages/${conditionId}.png`
				console.log(`[edge] Condition: ${conditionId}`)
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
