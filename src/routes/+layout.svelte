<script>
	import "../app.css"
	import Footer from "$lib/Footer.svelte"
	import Navbar from "$lib/Navbar.svelte"
	import SearchBar from "$lib/SearchBar.svelte"
	import {pageBackground} from "$lib/stores"

	let {children} = $props()
</script>

<div class="site-shell">
	{#if $pageBackground}
		{#key $pageBackground}
			<div
				class="layout-background"
				style={`background-image: url('${$pageBackground}');`}
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
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		animation:
			kenBurns 60s ease-in-out infinite,
			bgFadeIn 0.8s ease-in-out;
		filter: brightness(0.7);
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
