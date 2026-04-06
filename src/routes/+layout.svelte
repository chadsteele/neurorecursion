<script>
	import {browser} from "$app/environment"
	import {onMount} from "svelte"
	import "../app.css"
	import Navbar from "$lib/Navbar.svelte"

	let {children} = $props()

	onMount(() => {
		if (!browser) return

		const updateHash = () => {
			// Get all elements with IDs, excluding svelte's internal elements
			const elements = document.querySelectorAll(
				"[id]:not(#svelte-announcer)",
			)
			let closestElement = null
			let closestDistance = Infinity

			// Find element whose top is closest to viewport top
			elements.forEach((el) => {
				const rect = el.getBoundingClientRect()
				// Prefer elements in viewport or just above it
				const distance = Math.abs(rect.top)

				// Only consider elements that are visible or just off-screen
				if (rect.top < window.innerHeight && rect.bottom > -100) {
					if (distance < closestDistance) {
						closestDistance = distance
						closestElement = el
					}
				}
			})

			if (closestElement && closestElement.id) {
				const newHash = "#" + closestElement.id
				if (window.location.hash !== newHash) {
					window.history.replaceState(null, "", newHash)
				}
			}
		}

		// Debounce scroll updates
		let scrollTimeout
		const handleScroll = () => {
			clearTimeout(scrollTimeout)
			scrollTimeout = setTimeout(updateHash, 50)
		}

		window.addEventListener("scroll", handleScroll, {passive: true})

		// Initial hash update
		updateHash()

		return () => {
			window.removeEventListener("scroll", handleScroll)
			clearTimeout(scrollTimeout)
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
