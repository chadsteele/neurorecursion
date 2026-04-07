<script>
	import {onMount} from "svelte"

	let {background, children} = $props()

	let container
	let isLoaded = $state(false)

	const bgValue = $derived(
		isLoaded && background
			? background.startsWith("url") ||
				background.startsWith("http") ||
				background.includes(".")
				? `url('${background}')`
				: background
			: null,
	)

	onMount(() => {
		if (!background || !container) return

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

		return () => {
			observer.disconnect()
		}
	})
</script>

{#if background}
	<div
		bind:this={container}
		class="parallax-container"
		style="--background: {bgValue};"
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
		min-height: 50vh;
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
		filter: blur(1.5px) grayscale(0.35) brightness(0.8);
		z-index: 0;
	}

	.parallax-content {
		position: relative;
		padding: 3em;
		z-index: 1;
	}
</style>
