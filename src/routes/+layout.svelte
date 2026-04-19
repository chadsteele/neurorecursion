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
				<p class="footer-chip">
					&copy; {new Date().getFullYear()} Neuro Recursion Institute.
				</p>
				<p class="footer-chip">All rights reserved.</p>
				<p class="footer-chip">Patents Pending Worldwide.</p>
				<p class="footer-chip">
					2120 University Ave, Berkeley, CA 94704, United States
				</p>
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
		padding: 0 0 2rem;
	}

	.footer::before {
		content: "";
		display: block;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(30, 90, 150, 0.2),
			rgba(74, 159, 216, 0.7),
			rgba(30, 90, 150, 0.2),
			transparent
		);
		margin-bottom: 1.25rem;
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1.2rem 2rem 1.5rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
		justify-content: center;
		align-items: center;
		text-align: center;
		background: rgba(10, 14, 39, 0.95);
		border-top: 1px solid #1e5a96;
		border-bottom: 1px solid rgba(30, 90, 150, 0.45);
		backdrop-filter: blur(10px);
		box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.22);
	}

	.footer-chip {
		margin: 0;
		padding: 0.5rem 0.95rem;
		flex-shrink: 0;
		white-space: nowrap;
		color: #a0d8ff;
		font-size: clamp(0.75rem, 1.5vw, 0.95rem);
		font-weight: 500;
		border: 1px solid rgba(74, 159, 216, 0.2);
		border-radius: 999px;
		background: rgba(26, 36, 71, 0.45);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
	}

	.footer-disclaimer {
		flex-basis: 100%;
		margin-top: 0.35rem;
		padding-top: 0.9rem;
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
			padding: 1rem 1rem 1.25rem;
			gap: 0.65rem;
		}

		.footer-chip {
			flex-basis: 100%;
			white-space: normal;
			padding: 0.6rem 0.85rem;
		}

		.footer-disclaimer {
			padding-top: 0.8rem;
		}
	}
</style>
