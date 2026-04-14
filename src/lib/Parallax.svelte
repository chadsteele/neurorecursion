<script>
	import {onMount} from "svelte"

	let {background, children, blur = 1.5} = $props()

	let container = $state()
	let isLoaded = $state(false)
	let showBackground = $state(true)
	let isScrolling = $state(false)
	let scrollTimeout

	const bgValue = $derived.by(() => {
		if (!isLoaded || !background || !showBackground) return null
		if (
			background.startsWith("url") ||
			background.startsWith("http") ||
			background.includes(".")
		) {
			return `url('${background}')`
		}
		return background
	})

	function handleScroll() {
		isScrolling = true

		clearTimeout(scrollTimeout)
		scrollTimeout = setTimeout(() => {
			isScrolling = false
			checkIfShouldLoad()
		}, 500)
	}

	function checkIfShouldLoad() {
		if (!isScrolling && !isLoaded && background && container) {
			if (window.innerWidth < 600) {
				return
			}

			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							isLoaded = true
							observer.unobserve(container)
						}
					})
				},
				{
					rootMargin: "200px",
				},
			)

			observer.observe(container)
		}
	}

	onMount(() => {
		// Don't load background images on devices < 600px wide
		const updateShowBackground = () => {
			showBackground = window.innerWidth >= 600
		}

		updateShowBackground()

		if (window.innerWidth < 600) {
			window.addEventListener("resize", updateShowBackground)
			return () => {
				window.removeEventListener("resize", updateShowBackground)
				clearTimeout(scrollTimeout)
			}
		}

		window.addEventListener("scroll", handleScroll)
		window.addEventListener("resize", updateShowBackground)
		checkIfShouldLoad()

		return () => {
			window.removeEventListener("scroll", handleScroll)
			window.removeEventListener("resize", updateShowBackground)
			clearTimeout(scrollTimeout)
		}
	})
</script>

{#if background}
	<div
		bind:this={container}
		class="parallax-container"
		style="--background: {bgValue}; --blur: {blur}px;"
	>
		<div class="parallax-content">
			{@render children?.()}
		</div>
	</div>
{:else}
	{@render children?.()}
{/if}

<style>
	@keyframes kenBurns {
		0% {
			background-size: 120%;
		}
		50% {
			background-size: 150%;
		}
		100% {
			background-size: 120%;
		}
	}

	.parallax-container {
		position: relative;
		width: 100vw;
		margin-left: calc(-50vw + 50%);
		min-height: 100vh;
	}

	@keyframes bgFadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.parallax-container::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: var(--background) center / cover no-repeat;
		background-attachment: fixed;
		animation:
			kenBurns 60s ease-in-out infinite,
			bgFadeIn 0.8s ease-in-out;
		filter: blur(var(--blur)) grayscale(0.35) brightness(0.8);
		z-index: 0;
	}

	/* Hide background image on devices < 600px */
	@media (max-width: 599px) {
		.parallax-container::before {
			display: none;
		}
	}

	.parallax-content {
		position: relative;
		padding: 1rem;
		z-index: 1;
	}
</style>
