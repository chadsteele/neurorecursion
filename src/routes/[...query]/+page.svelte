<script>
	import {browser} from "$app/environment"
	import {page} from "$app/stores"
	import Intro from "$lib/Intro.svelte"
	import Orgs from "$lib/Orgs.svelte"
	import References from "$lib/References.svelte"
	import SignUp from "$lib/SignUp.svelte"
	import Parallax from "$lib/Parallax.svelte"
	import ConditionCard from "$lib/ConditionCard.svelte"
	// import VirtueCard from "$lib/VirtueCard.svelte"
	import {getCondition} from "$data/Conditions.js"
	import Virtues from "$data/Virtues.js"
	import {getPioneer} from "$data/Pioneers.js"
	import PioneerCard from "$lib/PioneerCard.svelte"
	import Disclaimer from "$lib/Disclaimer.svelte"
	import Reader from "$lib/Reader.svelte"

	let {data} = $props()

	const Categories = $derived(data.Categories || [])
	const Conditions = $derived(data.Conditions || [])
	const ConditionsMap = $derived(data.ConditionsMap || {})
	const VirtuesMap = $derived(
		Virtues.reduce((acc, v) => {
			acc[v.id] = v
			return acc
		}, {}),
	)
	const pioneerSchemasForPath = $derived(data.pioneerSchemasForPath || [])
	const sortedPioneers = $derived(data.sortedPioneers || [])
	const PioneersMap = $derived(data.PioneersMap || {})

	function stringifyJsonLd(schema) {
		return JSON.stringify(schema).replace(/</g, "\\u003c")
	}

	// Helper function to replace hyphens with non-breaking dashes (en-dashes)
	function formatName(name) {
		return name.replace(/-/g, "\u2011") // U+2011 is non-breaking hyphen
	}

	function normalizeMatchText(value) {
		return (value || "")
			.toLowerCase()
			.replace(/[_/\-]+/g, " ")
			.replace(/[^a-z0-9\s]/g, " ")
			.replace(/\s+/g, " ")
			.trim()
	}

	function scoreMatch(queryRaw, candidateRaw, type) {
		if (!queryRaw || !candidateRaw) return 0

		const query = normalizeMatchText(queryRaw)
		const candidate = normalizeMatchText(candidateRaw)

		if (!query || !candidate) return 0

		const typeBonus =
			type === "path"
				? 12
				: type === "id"
					? 8
					: type === "heading"
						? 4
						: 0

		if (query === candidate) {
			return 100 + typeBonus
		}

		let score = 0

		if (candidate.startsWith(query)) score += 50
		if (query.startsWith(candidate)) score += 32
		if (candidate.includes(query)) score += 24

		const queryTokens = query.split(" ").filter(Boolean)
		const candidateTokens = candidate.split(" ").filter(Boolean)
		const querySet = new Set(queryTokens)
		const candidateSet = new Set(candidateTokens)
		let overlapCount = 0

		for (const token of querySet) {
			if (candidateSet.has(token)) {
				overlapCount += 1
			}
		}

		if (overlapCount > 0) {
			const unionCount = new Set([...querySet, ...candidateSet]).size || 1
			score += (overlapCount / unionCount) * 50
		}

		return score + typeBonus
	}

	function findBestDomMatch(queryPath) {
		const rawQuery = (queryPath || "").trim()
		if (!rawQuery) return null

		const pathQuery = `/${rawQuery}`
		const searchScope = document.querySelectorAll(
			"[path], [id], h1, h2, h3",
		)

		let bestElement = null
		let bestScore = 0

		for (const el of searchScope) {
			const pathValue = el.getAttribute("path")
			if (pathValue) {
				const pathScore = scoreMatch(pathQuery, pathValue, "path")
				if (pathScore > bestScore) {
					bestScore = pathScore
					bestElement = el
				}
			}

			const idValue = el.id
			if (idValue) {
				const idScore = scoreMatch(rawQuery, idValue, "id")
				if (idScore > bestScore) {
					bestScore = idScore
					bestElement = el
				}
			}

			if (el.matches("h1, h2, h3")) {
				const headingScore = scoreMatch(
					rawQuery,
					el.textContent || "",
					"heading",
				)
				if (headingScore > bestScore) {
					bestScore = headingScore
					bestElement = el
				}
			}
		}

		return bestScore >= 20 ? bestElement : null
	}

	// Initialize formData with restored values from localStorage (only on browser)
	let formData = $state(
		browser
			? {
					name: "",
					email: "",
					message: localStorage.getItem("formMessage") || "",
					conditions: (() => {
						try {
							const saved = localStorage.getItem("formConditions")
							return saved ? JSON.parse(saved) : {}
						} catch {
							return {}
						}
					})(),
				}
			: {
					name: "",
					email: "",
					message: "",
					conditions: {},
				},
	)

	// Save message to localStorage whenever it changes
	$effect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem("formMessage", formData.message)
		}
	})

	// Save condition selections to localStorage whenever they change
	$effect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem(
				"formConditions",
				JSON.stringify(formData.conditions),
			)
		}
	})

	// Routing logic based on [...query] parameter
	$effect(() => {
		if (!browser) {
			return
		}

		const search = $page.url.search

		// PRIORITY 0: If search terms are in querystring, ignore routing
		if (search.includes("q=")) {
			return
		}

		// Get the query path from [...query] parameter
		const queryArray = $page.params.query
		const queryPath = Array.isArray(queryArray)
			? queryArray.join("/")
			: queryArray || ""

		// If no query path, stay at home
		if (!queryPath || typeof queryPath !== "string") {
			return
		}

		// PRIORITY 1: Find closest DOM match among path/id/h1/h2/h3
		let targetElement = findBestDomMatch(queryPath)

		// PRIORITY 3: If not found, use getCondition to find best matched condition
		if (!targetElement && getCondition) {
			const matchedCondition = getCondition(queryPath)
			if (matchedCondition) {
				targetElement = document.getElementById(matchedCondition.id)
			}
		}

		// PRIORITY 4: If not found, use getPioneer to find best matched pioneer
		if (!targetElement && getPioneer) {
			const matchedPioneer = getPioneer(queryPath)
			if (matchedPioneer) {
				targetElement = document.getElementById(matchedPioneer.id)
			}
		}

		// If target element found, scroll to it
		if (targetElement) {
			setTimeout(() => {
				targetElement.scrollIntoView({
					behavior: "smooth",
					block: "start",
				})
			}, 100)
		}
	})
</script>

<svelte:head>
	{#each pioneerSchemasForPath as schema, index (`${schema.url}-${index}`)}
		<script type="application/ld+json">
			{@html stringifyJsonLd(schema)}
		</script>
	{/each}
</svelte:head>
<Reader />

<Parallax
	background="https://cri-cdn.netlify.app/src/neurorecursion.com/backgrounds/children.avif"
>
	<div id="about" path="/about"></div>
	<Intro class="paper container" />
	<div id="references" path="/references"></div>
	<References class="paper container" />
</Parallax>

<div id="signup" path="/signup"></div>
<SignUp bind:formData {getCondition} {ConditionsMap} />

<div id="trials" path="/clinical-trials"></div>
<div class="category-section">
	<h1>Clinical Trials</h1>
</div>
<Parallax
	background="https://cri-cdn.netlify.app/src/neurorecursion.com/backgrounds/kids-grass.avif"
>
	<section class="paper container">
		<span class="speak">
			<h2>Enrolling now!</h2>
			<p>Find your condition below and sign up to see if you qualify!</p>
			<p>
				These conditions benefit from our technology that targets
				neuroplasticity and replaces hardened limbic loops with new
				neural pathways that increase your capacity for confidence,
				security, and joy.
			</p>
		</span>
		<p>
			We are continuously adding more. Don't see your condition? Sign up
			anyway. Also, the descriptions are brief summaries of complex
			conditions - your experience will differ and may be less severe than
			described. Also, you may have multiple conditions, so don't hesitate
			to sign up for more than one.
		</p>
		<p><strong>This could be your breakthrough! Don't hesitate.</strong></p>

		<div class="categories-grid">
			{#each Categories as category}
				<a href={category.path} class="category-link"
					>{formatName(category.category_name)}</a
				>
			{/each}
		</div>
	</section>
</Parallax>

{#each Categories as category (category.category_name)}
	<div class="category-section" path={category.path}>
		<h1>{category.category_name}</h1>
	</div>

	{#each category.ids as id (id)}
		{@const condition = ConditionsMap[id]}
		{@const virtue = VirtuesMap[id]}
		{#if condition}
			<ConditionCard {condition} {formData} />
		{:else if virtue}
			<ConditionCard condition={virtue} />
		{/if}
	{/each}
{/each}

<div id="pioneers" path="/pioneers"></div>
<div class="category-section">
	<h1>Partners & Pioneers</h1>
</div>

<section class="paper container">
	<p>
		For decades, neuroscientists have puzzled over why our brains react to
		perceived threats in ways that feel beyond conscious control. In the
		1990s, Paul MacLean and later Daniel Goleman introduced the concept of "<strong
			>amygdala hijacks</strong
		>" - moments when emotion overwhelms reason. Their work showed that
		trauma and anxiety stem from a <strong>limbic loop</strong>, a
		self-reinforcing circuit where emotional memory hardens into fixed
		neural patterns. For years, these patterns seemed unchangeable in
		adults. But recent neuroplasticity research reveals something
		remarkable: these hardened loops can be reopened, rewired, and healed.
		This has transformed how we treat anxiety, PTSD, phobias, and other
		neurological conditions.
	</p>
	<p>
		Our research is built on the pioneering work of world-class scientists
		whose discoveries have advanced our understanding of neuroplasticity,
		limbic loops, and the therapeutic potential of targeting these pathways
		to reduce neurological symptoms.
	</p>
	<p>
		We are deeply grateful for their contributions to science and humanity.
	</p>
</section>

<div class="pioneers-grid">
	{#each sortedPioneers as pioneerId (pioneerId)}
		{@const pioneer = PioneersMap[pioneerId]}
		{#if pioneer}
			<PioneerCard {pioneer} />
		{/if}
	{/each}
</div>

<div class="category-section">
	<h1>Supportive Communities</h1>
</div>
<div id="support" path="/support"></div>
<Parallax
	background="https://cri-cdn.netlify.app/src/neurorecursion.com/backgrounds/kids-blowing-bubbles.avif"
>
	<Orgs class="paper container" />
</Parallax>

<style>
	:global(.category-section) {
		position: sticky;
		top: 70px;
		z-index: 10;
		background-color: black;
		text-align: center;
	}

	@media (max-width: 768px) {
		:global(.category-section) {
			top: 60px;
		}
	}

	:global(.category-section h1) {
		max-width: 1200px;
		margin: 0 auto;
		font-size: 2rem;
	}

	@media (max-width: 1024px) {
		:global(.category-section h1) {
			font-size: 1.5rem;
		}
	}

	@media (max-width: 640px) {
		:global(.category-section h1) {
			font-size: 1.125rem;
		}
	}

	@media (max-width: 480px) {
		:global(.category-section h1) {
			font-size: 1rem;
		}
	}

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
		margin: 2rem 0;
	}

	.category-link {
		display: block;
		padding: 1rem 1.5rem;
		background: linear-gradient(135deg, #1e5a96 0%, #0f3a5f 100%);
		border: 1px solid #2a7cb1;
		border-radius: 8px;
		color: #fff;
		text-decoration: none;
		font-weight: 500;
		transition: all 0.3s ease;
		text-align: center;
	}

	.category-link:hover {
		background: linear-gradient(135deg, #2a7cb1 0%, #1a5a8f 100%);
		border-color: #3a9fd1;
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(30, 90, 150, 0.3);
	}

	@media (max-width: 768px) {
		.categories-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 1rem;
		}

		.category-link {
			padding: 0.75rem 1rem;
			font-size: 0.95rem;
		}
	}

	@media (max-width: 480px) {
		.categories-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 0.75rem;
		}

		.category-link {
			padding: 0.625rem 0.75rem;
			font-size: 0.85rem;
		}
	}

	.pioneers-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		margin: 2rem 0;
	}

	@media (max-width: 768px) {
		.pioneers-grid {
			gap: 1.5rem;
		}
	}
</style>
