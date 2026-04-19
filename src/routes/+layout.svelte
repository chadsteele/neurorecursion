<script>
	import "../app.css"
	import Navbar from "$lib/Navbar.svelte"
	import SearchBar from "$lib/SearchBar.svelte"
	import Disclaimer from "$lib/Disclaimer.svelte"
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

		<footer class="footer">
			<div class="footer-content">
				<p>
					&copy; {new Date().getFullYear()} Neuro Recursion Institute.
				</p>
				<p>All rights reserved.</p>
				<p>Patents Pending Worldwide.</p>
				<p>2120 University Ave, Berkeley, CA 94704, United States</p>
				<div class="footer-disclaimer">
					<Disclaimer />
				</div>
				<!-- <p>
					<a href="https://hire.chadsteele.com">Made with ❤️ by Chad Steele</a
					>
				</p> -->
			</div>
		</footer>
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

	.footer {
		margin-top: 4rem;
		padding: 2rem 0;
		background: rgba(10, 14, 39, 0.92);
		border-top: 1px solid #1e5a96;
	}

	.footer-content {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.5rem;
		justify-content: center;
		align-items: center;
		text-align: center;
	}

	.footer-content p {
		margin: 0;
		flex-shrink: 0;
		white-space: nowrap;
		color: #9fb4c8;
		font-size: 0.92rem;
		font-weight: 400;
	}

	.footer-disclaimer {
		flex-basis: 100%;
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid rgba(74, 159, 216, 0.18);
		color: #7fa9c8;
	}

	.footer-disclaimer :global(p) {
		margin: 0;
		color: inherit;
		text-align: center;
		font-size: 0.9rem;
		line-height: 1.6;
	}

	@media (max-width: 900px) {
		.footer-content {
			padding: 0 1rem;
			gap: 0.45rem;
		}

		.footer-content p {
			flex-basis: 100%;
			white-space: normal;
		}

		.footer-disclaimer {
			padding-top: 0.8rem;
		}
	}
</style>
