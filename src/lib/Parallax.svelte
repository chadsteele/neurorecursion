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
	.parallax-container {
		position: relative;
		width: 100vw;
		margin-left: calc(-50vw + 50%);
		min-height: 50vh;
		background: var(--background) center / cover no-repeat;
		background-attachment: fixed;
	}

	.parallax-content {
		position: relative;
		padding: 3em;
	}
</style>
