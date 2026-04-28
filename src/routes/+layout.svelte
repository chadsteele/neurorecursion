<script>
	import "../app.css"
	import Footer from "$lib/Footer.svelte"
	import Navbar from "$lib/Navbar.svelte"
	import SearchBar from "$lib/SearchBar.svelte"
	import {pageBackground} from "$lib/stores"
	import Reader from "$lib/Reader.svelte"

	let {children} = $props()
</script>

<div class="site-shell">
	<Reader />
	{#if $pageBackground.src}
		{#key `${$pageBackground.src}:${$pageBackground.blur}`}
			<div
				class="layout-background"
				style={`background-image: url('${$pageBackground.src}'); --layout-bg-blur: ${$pageBackground.blur}px;`}
			></div>
		{/key}
	{/if}

	<div class="site-content">
		<Navbar />
		<SearchBar />

		<div class="main-content">
			{@render children()}
		</div>

		<Footer />
	</div>
</div>

<style>
	.site-shell {
		position: relative;
		min-height: 100vh;
	}

	.layout-background {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		--layout-bg-blur: 0px;
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		animation:
			kenBurns 60s ease-in-out infinite,
			bgFadeIn 0.8s ease-in-out;
		filter: blur(var(--layout-bg-blur)) brightness(0.7);
		transform: scale(1.04);
		transform-origin: center;
	}

	.site-content {
		position: relative;
		z-index: 1;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.main-content {
		flex: 1;
	}

	@media (max-width: 900px) {
	}
</style>
