<script>
	let {background, children} = $props()

	const bgValue =
		background.startsWith("url") ||
		background.startsWith("http") ||
		background.includes(".")
			? `url('${background}')`
			: background
</script>

<div class="parallax-container" style="--background: {bgValue};">
	<div class="parallax-content">
		{@render children?.()}
	</div>
</div>

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
		background: var(--background) center / cover no-repeat;
		background-attachment: fixed;
		animation: kenBurns 60s ease-in-out infinite;
	}

	.parallax-content {
		position: relative;
		padding: 3em;
		z-index: 1;
	}
</style>
