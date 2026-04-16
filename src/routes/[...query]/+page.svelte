<script>
	import {browser} from "$app/environment"
	import {page} from "$app/stores"
	import Intro from "$lib/Intro.svelte"
	import Orgs from "$lib/Orgs.svelte"
	import References from "$lib/References.svelte"
	import SignUp from "$lib/SignUp.svelte"
	import Parallax from "$lib/Parallax.svelte"
	import {Categories} from "$data/Categories.js"
	import ConditionCard from "$lib/ConditionCard.svelte"
	import PioneerCard from "$lib/PioneerCard.svelte"
	import Disclaimer from "$lib/Disclaimer.svelte"

	let {data} = $props()

	// Lazy-loaded data
	let Conditions = $state([])
	let ConditionsMap = $state({})
	let Pioneers = $state([])
	let sortedPioneers = $state([])
	let PioneersMap = $state({})
	let isLoadingData = $state(false)

	// Load data from server (passed via load function)
	$effect(() => {
		if (data?.conditions && data?.pioneers) {
			Conditions = data.conditions || []
			ConditionsMap = data.conditionsMap || {}
			Pioneers = data.pioneers || []
			sortedPioneers = data.sortedPioneers || []
			PioneersMap = data.pioneersMap || {}
			isLoadingData = false
		}
	})

	// Recreate getCondition function locally since we can't serialize functions
	function getCondition(input) {
		if (!Conditions.length) return null
		if (!input) return null

		function scoreCondition(condition, words) {
			let score = 0
			const conditionStr =
				`${condition.name}${condition.id}${condition.path}`.toLowerCase()
			for (const word of words) {
				if (condition.name.toLowerCase().includes(word)) {
					score += 10
				}
				if (condition.id.toLowerCase().includes(word)) {
					score += 5
				}
				if (conditionStr.includes(word)) {
					score += 1
				}
			}
			return score
		}

		const words = Array.isArray(input)
			? input
			: input
					.toLowerCase()
					.split(/[\s,/_-]+/)
					.filter(Boolean)

		if (words.length === 0) return null

		let bestCondition = null
		let bestScore = -1

		for (const condition of Conditions) {
			const score = scoreCondition(condition, words)
			if (score > bestScore) {
				bestScore = score
				bestCondition = condition
			}
		}

		return bestCondition
	}

	// Helper function to replace hyphens with non-breaking dashes (en-dashes)
	function formatName(name) {
		return name.replace(/-/g, "\u2011") // U+2011 is non-breaking hyphen
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
		console.log("[Routing] Effect triggered")
		console.log("  $page.url:", $page.url.toString())
		console.log("  $page.url.search:", $page.url.search)
		console.log("  $page.params.query:", $page.params.query)
		console.log("  isLoadingData:", isLoadingData)

		// Wait for data to finish loading before attempting routing
		if (isLoadingData) {
			console.log("  -> SKIPPING: Data still loading")
			return
		}

		// PRIORITY 0: If search terms are in querystring, ignore routing
		if ($page.url.search.includes("q=")) {
			console.log("  -> SKIPPING: Search active, ignoring routing")
			return
		}

		// Get the query path from [...query] parameter
		const queryArray = $page.params.query
		const queryPath = Array.isArray(queryArray)
			? queryArray.join("/")
			: queryArray || ""

		// If no query path, stay at home
		if (!queryPath || typeof queryPath !== "string") {
			console.log("  -> No query path, staying at home")
			return
		}

		const pathToFind = `/${queryPath}`
		console.log("  pathToFind:", pathToFind)

		// PRIORITY 1: Try to find element with path=[query]
		let targetElement = null
		const pathElements = document.querySelectorAll("[path]")
		for (const el of pathElements) {
			const elPath = el.getAttribute("path")
			if (elPath && elPath.toLowerCase() === pathToFind.toLowerCase()) {
				targetElement = el
				console.log("  -> Found via [path] attribute")
				break
			}
		}

		// PRIORITY 2: If not found, try to find element with id=[query]
		if (!targetElement) {
			targetElement = document.getElementById(queryPath)
			if (targetElement) {
				console.log("  -> Found via id attribute")
			}
		}

		// PRIORITY 3: If not found, use getCondition to find best matched condition
		if (!targetElement && getCondition) {
			const matchedCondition = getCondition(queryPath)
			if (matchedCondition) {
				targetElement = document.getElementById(matchedCondition.id)
				console.log("  -> Found via getCondition:", matchedCondition.id)
			}
		}

		// If target element found, scroll to it
		if (targetElement) {
			console.log("  -> Scrolling to target element")
			const scrollTop =
				targetElement.getBoundingClientRect().top + window.scrollY
			console.log("  -> Scroll position:", scrollTop)
			setTimeout(() => {
				targetElement.scrollIntoView({
					behavior: "smooth",
					block: "start",
				})
			}, 100)
		} else {
			console.log(
				"  -> No target element found, staying at current position",
			)
		}
	})
</script>

<Parallax background="/backgrounds/children.png">
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
<Parallax background="/backgrounds/kids-grass.png">
	<section class="paper container">
		<h2>Enrolling now!</h2>
		<p>Find your condition below and sign up to see if you qualify!</p>
		<p>
			These conditions benefit from our technolgy that targets
			neuroplasticity and replaces hardened limbic loops with new neural
			pathways that increase your capacity for confidence, security, and
			joy.
		</p>
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

{#if !isLoadingData}
	{#each Categories as category (category.category_name)}
		<div class="category-section" path={category.path}>
			<h1>{category.category_name}</h1>
		</div>

		{#each category.ids as conditionId (conditionId)}
			{@const condition = ConditionsMap[conditionId]}
			{#if condition}
				<ConditionCard {condition} {formData} />
			{/if}
		{/each}
	{/each}
{/if}

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

{#if !isLoadingData}
	<div class="pioneers-grid">
		{#each sortedPioneers as pioneerId (pioneerId)}
			{@const pioneer = PioneersMap[pioneerId]}
			{#if pioneer}
				<PioneerCard {pioneer} />
			{/if}
		{/each}
	</div>
{/if}

<div class="category-section">
	<h1>Supportive Communities</h1>
</div>
<div id="support" path="/support"></div>
<Parallax background="/backgrounds/kids-blowing-bubbles.png">
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
