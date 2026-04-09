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
{#each Categories as category (category.category_name)}
	<div class="category-section">
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
</style>
