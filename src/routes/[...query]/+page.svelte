<script>
	import {onMount} from "svelte"
	import {page} from "$app/stores"
	import {replaceState} from "$app/navigation"
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

	let formData = $state({
		name: "",
		email: "",
		message: "",
		conditions: {},
	})

	// Track the last path we processed routing for (to ignore observer updates)
	let lastProcessedPath = $state("")

	// Reactive effect to handle routing whenever the query changes
	$effect(() => {
		// PRIORITY 1: If search terms are in querystring, skip routing and let search handle it
		if (window.location.search.includes("q=")) {
			return
		}

		const queryArray = $page.params.query
		const query = Array.isArray(queryArray)
			? queryArray.join("/")
			: queryArray

		if (query && typeof query === "string") {
			// Skip if trying to navigate to svelte's internal elements
			if (query.toLowerCase().includes("svelte-announcer")) {
				return
			}

			const pathToUse = `/${query}`

			// Only process routing if the user intentionally changed the path
			// (i.e., path parameter changed from the last time we processed it)
			// This ignores observer updates that keep URL in sync with scroll position
			if (pathToUse === lastProcessedPath) {
				return
			}

			lastProcessedPath = pathToUse

			try {
				let targetElement = null

				// PRIORITY 2: Try to find element with path=[query]
				const pathElements = document.querySelectorAll("[path]")
				for (const el of pathElements) {
					const elPath = el.getAttribute("path")
					if (
						elPath &&
						elPath.toLowerCase() === `/${query.toLowerCase()}`
					) {
						targetElement = el
						break
					}
				}

				// PRIORITY 3: If not found, try to find element with id=[query]
				if (!targetElement) {
					targetElement = document.getElementById(query)
				}

				// PRIORITY 4: If not found, use getCondition to find best matched condition
				if (!targetElement) {
					const matchedCondition = getCondition(query)
					if (matchedCondition) {
						targetElement = document.getElementById(
							matchedCondition.id,
						)
					}
				}

				// Update URL pathname while preserving search params
				replaceState(pathToUse + window.location.search)

				// Scroll to the found element, or render at top if not found
				if (targetElement) {
					setTimeout(() => {
						targetElement.scrollIntoView({
							behavior: "smooth",
							block: "start",
						})
					}, 100)
				}
			} catch (error) {
				console.error("Error navigating to query:", error)
			}
		}
	})

	onMount(() => {
		// Setup Intersection Observer to update URL as elements scroll into view
		let urlUpdateTimeout
		const observer = new IntersectionObserver(
			(entries) => {
				// Find the topmost element that is intersecting
				const visibleEntries = entries.filter(
					(entry) => entry.isIntersecting,
				)

				if (visibleEntries.length > 0) {
					// Sort by position in viewport - get the one closest to top
					const topmost = visibleEntries.reduce((top, current) => {
						return current.boundingClientRect.top <
							top.boundingClientRect.top
							? current
							: top
					})

					const path = topmost.target.getAttribute("path")
					if (path) {
						clearTimeout(urlUpdateTimeout)
						urlUpdateTimeout = setTimeout(() => {
							if (window.location.pathname !== path) {
								// Preserve query string when updating pathname
								// Use window.location.search to get the actual current URL params
								replaceState(path + window.location.search)
							}
						}, 100)
					}
				}
			},
			{
				threshold: 0,
				rootMargin: "0px 0px -80% 0px",
			},
		)

		// Function to observe all path elements
		const observePathElements = () => {
			const pathElements = document.querySelectorAll("[path]")
			pathElements.forEach((el) => {
				observer.observe(el)
			})
		}

		// Initial observation after DOM is ready
		setTimeout(observePathElements, 500)

		// Watch for new elements being added to the DOM
		const mutationObserver = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.addedNodes.length) {
					mutation.addedNodes.forEach((node) => {
						if (
							node.nodeType === 1 &&
							node.hasAttribute &&
							node.hasAttribute("path")
						) {
							observer.observe(node)
						} else if (node.nodeType === 1) {
							// Check children of added nodes
							node.querySelectorAll("[path]").forEach((el) => {
								observer.observe(el)
							})
						}
					})
				}
			})
		})

		mutationObserver.observe(document.body, {
			childList: true,
			subtree: true,
		})

		return () => {
			clearTimeout(urlUpdateTimeout)
			observer.disconnect()
			mutationObserver.disconnect()
		}
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
		<p>
			We are currently enrolling for the following remote clinical trials.
			Find your condition below and sign up to see if you qualify!
		</p>
		<p>
			These conditions were chosen based on scientific evidence of
			neuroplasticity and patient interest, and we are adding more all the
			time. Don't see your condition? Sign up anyway. Also, the
			descriptions are brief summaries of complex conditions - your
			experience will differ and may be less severe than described. Also,
			you may have multiple conditions, so don't hesitate to sign up for
			more than one.
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
