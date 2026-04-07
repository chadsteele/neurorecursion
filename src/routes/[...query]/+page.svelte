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
	import Conditions, {getCondition} from "$lib/Conditions.js"
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
		const queryArray = $page.params.query
		const query = Array.isArray(queryArray)
			? queryArray.join("/")
			: queryArray

		if (query) {
			// Skip if trying to navigate to svelte's internal elements
			if (query.toLowerCase().includes("svelte-announcer")) return

			let targetElement = null

			// First: try to find best matching condition using intelligent scoring
			const matchedCondition = getCondition(query)
			if (matchedCondition) {
				// Look for the condition element by id
				targetElement = document.getElementById(matchedCondition.id)
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
							(el.id && el.id.toLowerCase().includes(word)) ||
							(elPath && elPath.toLowerCase().includes(word))
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
								heading.textContent.toLowerCase().includes(word)
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

		// Setup Intersection Observer to update URL as elements scroll into view
		let urlUpdateTimeout
		const observer = new IntersectionObserver(
			(entries) => {
				// Find the first element that is intersecting
				const visibleEntry = entries.find(
					(entry) => entry.isIntersecting,
				)

				if (visibleEntry && visibleEntry.target.getAttribute("path")) {
					// Debounce the URL update
					clearTimeout(urlUpdateTimeout)
					urlUpdateTimeout = setTimeout(() => {
						const path = visibleEntry.target.getAttribute("path")
						if (path && window.location.pathname !== path) {
							window.history.replaceState({}, "", path)
						}
					}, 100)
				}
			},
			{
				threshold: 0.01,
				rootMargin: "100% 0px -50% 0px",
			},
		)

		// Observe all elements with path attributes
		document.querySelectorAll("[path]").forEach((el) => {
			observer.observe(el)
		})

		return () => {
			clearTimeout(urlUpdateTimeout)
			observer.disconnect()
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
{#each Conditions as condition (condition.name)}
	<ConditionCard {condition} {formData} />
{/each}

<div id="partners"></div>
<Parallax background="/backgrounds/kids-blowing-bubbles.png">
	<Partners class="paper container" />
</Parallax>

<style>
</style>
