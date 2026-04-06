<script>
	let {background, strength = 0.5, children} = $props()

	// Determine if background is a URL or color
	const bgValue =
		background.startsWith("url") ||
		background.startsWith("http") ||
		background.includes(".")
			? `url('${background}')`
			: background
</script>

<div
	class="parallax-container"
	style="--background: {bgValue}; --strength: {strength};"
>
	<div class="parallax-overlay" />
	<div class="parallax-content">
		{@render children?.()}
	</div>
</div>

<style>
	.parallax-container {
		position: relative;
		width: 100vw;
		margin-left: calc(-50vw + 50%);
		background: var(--background) center / contain no-repeat;
		background-attachment: fixed;
	}

	.parallax-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		/* background: rgba(74, 159, 216, 0.4); */
		z-index: 0;
	}

	.parallax-content {
		position: relative;
		z-index: 1;
		padding: 3em;
	}
</style>
