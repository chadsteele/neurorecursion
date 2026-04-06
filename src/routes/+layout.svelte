<script>
	import {browser} from "$app/environment"
	import {onMount} from "svelte"
	import "../app.css"
	import Navbar from "$lib/Navbar.svelte"

	let {children} = $props()

	onMount(() => {
		if (!browser) return

		// Prevent hash change from scrolling
		let hashChanging = false

		const handleHashChange = () => {
			hashChanging = true
		}

		window.addEventListener("hashchange", handleHashChange)

		// Set up Intersection Observer to update hash as elements scroll into view
		const observer = new IntersectionObserver(
			(entries) => {
				// Find the topmost visible element
				const visibleEntries = entries.filter(
					(entry) => entry.isIntersecting,
				)
				if (visibleEntries.length === 0) return

				// Sort by their position on screen from top to bottom
				visibleEntries.sort(
					(a, b) =>
						a.getBoundingClientRect().top -
						b.getBoundingClientRect().top,
				)

				const topVisibleElement = visibleEntries[0]
				const newHash = "#" + topVisibleElement.target.id

				// Only update if it's different from current hash
				if (window.location.hash !== newHash) {
					hashChanging = true
					window.history.replaceState(null, "", newHash)
					hashChanging = false
				}
			},
			{
				threshold: [0, 0.25, 0.5, 0.75, 1],
				rootMargin: "-20% 0px -80% 0px",
			},
		)

		// Observe all elements with IDs
		const elementsWithIds = document.querySelectorAll("[id]")
		elementsWithIds.forEach((element) => observer.observe(element))

		return () => {
			observer.disconnect()
			window.removeEventListener("hashchange", handleHashChange)
		}
	})
</script>

<Navbar />

{@render children()}

<footer class="footer">
	<p>
		&copy; {new Date().getFullYear()} Neuro Recursion Institute. All rights reserved.
	</p>
	<p style="font-size: 0.9rem; margin-top: 0.5rem;">
		2120 University Ave, Berkeley, CA 94704, United States
	</p>
</footer>

<style>
	.footer {
		text-align: center;
		padding: 2rem;
		color: #707070;
		border-top: 1px solid #1e5a96;
		margin-top: 4rem;
	}
</style>
