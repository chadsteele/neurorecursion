<script>
	import {browser} from "$app/environment"
	import {page} from "$app/stores"
	import Intro from "$lib/Intro.svelte"
	import Partners from "$lib/Partners.svelte"
	import References from "$lib/References.svelte"
	import SignUp from "$lib/SignUp.svelte"
	import Skeleton from "$lib/Skeleton.svelte"
	import Featured from "$lib/Featured.svelte"
	import Alert from "$lib/Alert.svelte"
	import Parallax from "$lib/Parallax.svelte"
	import Conditions, {getCondition, ConditionsMap} from "$lib/Conditions.js"
	import {Categories} from "$lib/Categories.js"
	import ConditionCard from "$lib/ConditionCard.svelte"

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
		// PRIORITY 0: If search terms are in querystring, ignore routing
		if (window.location.search.includes("q=")) {
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

		const pathToFind = `/${queryPath}`

		// PRIORITY 1: Try to find element with path=[query]
		let targetElement = null
		const pathElements = document.querySelectorAll("[path]")
		for (const el of pathElements) {
			const elPath = el.getAttribute("path")
			if (elPath && elPath.toLowerCase() === pathToFind.toLowerCase()) {
				targetElement = el
				break
			}
		}

		// PRIORITY 2: If not found, try to find element with id=[query]
		if (!targetElement) {
			targetElement = document.getElementById(queryPath)
		}

		// PRIORITY 3: If not found, use getCondition to find best matched condition
		if (!targetElement) {
			const matchedCondition = getCondition(queryPath)
			if (matchedCondition) {
				targetElement = document.getElementById(matchedCondition.id)
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
		// Otherwise, just stay at home/top (no error thrown)
	})
</script>

<svelte:head>
	<title>Sign up for remote clinical trials. FREE!</title>
	<meta property="og:url" content="https://neurorecursion.com" />
	<meta
		property="og:title"
		content="Sign up for remote clinical trials. FREE!"
	/>
	<meta
		property="og:description"
		content="Neuro Recursion Institute - Join our clinical research on neurological symptom modulation through targeted neuroplasticity."
	/>
</svelte:head>

<Parallax background="/backgrounds/children.png">
	<div id="about" path="/about"></div>
	<Intro class="paper container" />
	<div id="references" path="/references"></div>
	<References class="paper container" />
</Parallax>

<div id="signup" path="/signup"></div>
<SignUp {formData} />

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

<div class="category-section">
	<h1>Neuro Recursion Resources and Partners</h1>
</div>
<div id="partners" path="/partners"></div>
<Parallax background="/backgrounds/kids-blowing-bubbles.png">
	<Partners class="paper container" />
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
</style>
