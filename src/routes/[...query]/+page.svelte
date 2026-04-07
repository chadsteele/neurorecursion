<script>
	import {onMount} from "svelte"
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

	let formData = $state({
		name: "",
		email: "",
		message: "",
		conditions: {},
	})

	onMount(() => {
		// Get query parameter and navigate to that section if it exists
		// With [...query] rest parameter, $page.params.query is an array
		try {
			const queryArray = $page.params.query
			const query = Array.isArray(queryArray)
				? queryArray.join("/")
				: queryArray

			if (query && typeof query === "string") {
				// Skip if trying to navigate to svelte's internal elements
				if (query.toLowerCase().includes("svelte-announcer")) {
					// continue to observer setup
				} else {
					let targetElement = null

					// First: try to find best matching condition using intelligent scoring
					const matchedCondition = getCondition(query)
					if (matchedCondition) {
						// Look for the condition element by id
						targetElement = document.getElementById(
							matchedCondition.id,
						)
					}

					// Fallback: if no condition matched, search DOM by word inclusion
					if (!targetElement) {
						const words = query
							.toLowerCase()
							.split(/[\s-_/]+/)
							.filter(Boolean)

						const allElements = document.querySelectorAll(
							"[path],[id]:not(#svelte-announcer)",
						)
						const headings = document.querySelectorAll(
							"h1, h2, h3, h4, h5, h6",
						)

						// Try each word in order, looking through IDs/paths, then headings
						for (const word of words) {
							if (targetElement) break

							// Search in element IDs and paths
							for (const el of allElements) {
								// Skip elements inside forms
								if (el.closest("form")) {
									continue
								}
								const elPath = el.getAttribute("path")
								if (
									(el.id &&
										el.id.toLowerCase().includes(word)) ||
									(elPath &&
										elPath.toLowerCase().includes(word))
								) {
									targetElement = el
									break
								}
							}

							// If not found, search in headings
							if (!targetElement) {
								for (const heading of headings) {
									// Skip headings inside forms
									if (heading.closest("form")) {
										continue
									}
									if (
										heading.textContent &&
										heading.textContent
											.toLowerCase()
											.includes(word)
									) {
										targetElement = heading
										break
									}
								}
							}
						}
					}

					// Scroll to the found element
					if (targetElement) {
						setTimeout(() => {
							targetElement.scrollIntoView({
								behavior: "smooth",
								block: "start",
							})
						}, 100)
					}
				}
			}
		} catch (error) {
			console.error("Error navigating to query:", error)
		}

		// Setup Intersection Observer to update URL as elements scroll into view
		let urlUpdateTimeout
		const observer = new IntersectionObserver(
			(entries) => {
				console.log("Observer fired with", entries.length, "entries")
				entries.forEach((entry) => {
					console.log(
						"Entry:",
						entry.target.getAttribute("path"),
						"isIntersecting:",
						entry.isIntersecting,
						"top:",
						entry.boundingClientRect.top,
					)
				})

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
					console.log("Topmost path:", path)
					if (path) {
						clearTimeout(urlUpdateTimeout)
						urlUpdateTimeout = setTimeout(() => {
							console.log(
								"Updating URL to:",
								path,
								"current:",
								window.location.pathname,
							)
							if (window.location.pathname !== path) {
								window.history.replaceState({}, "", path)
								console.log(
									"URL updated to:",
									window.location.pathname,
								)
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
			console.log(
				"Found",
				pathElements.length,
				"elements with path attribute",
			)
			pathElements.forEach((el) => {
				console.log("Observing:", el.getAttribute("path"), el)
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
							console.log(
								"New path element detected:",
								node.getAttribute("path"),
							)
							observer.observe(node)
						} else if (node.nodeType === 1) {
							// Check children of added nodes
							node.querySelectorAll("[path]").forEach((el) => {
								console.log(
									"New path element in children:",
									el.getAttribute("path"),
								)
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
	<div id="about"></div>
	<Intro class="paper container" />
	<References class="paper container" />
</Parallax>

<SignUp {formData} />

<div id="trials"></div>
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
<div id="partners"></div>
<Parallax background="/backgrounds/kids-blowing-bubbles.png">
	<Partners class="paper container" />
</Parallax>

<style>
	:global(.category-section) {
		position: sticky;
		top: 60px;
		z-index: 10;
		background-color: black;
		text-align: center;
	}

	:global(.category-section h1) {
		max-width: 1200px;
		margin: 0 auto;
	}
</style>
