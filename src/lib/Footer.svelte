<script>
	import Disclaimer from "$lib/Disclaimer.svelte"
	import Logo from "$lib/Logo.svelte"
	import {footerLegalLinks} from "$lib/legalSections.js"
</script>

<footer class="footer">
	<div class="footer-content">
		<div class="footer-top">
			<div class="footer-brand" aria-label="Neuro Recursion Institute home">
				<Logo />
			</div>

			<div class="footer-links" aria-label="Legal links">
				{#each footerLegalLinks as link (link.href)}
					<a href={link.href}>{link.label}</a>
				{/each}
				<a href="/signup">Contact us</a>
				<a href="/careers">Careers</a>
				<a
					href="https://pmc.ncbi.nlm.nih.gov/search/?term=neuro+recursion&sort=relevance&size=10&display_snippets=show"
					target="_blank"
					rel="noopener">Science</a
				>
			</div>
		</div>

		<div class="footer-meta">
			<p>
				&copy; {new Date().getFullYear()} Neuro Recursion Institute.
			</p>
			<p>All rights reserved.</p>
			<p>Patents Pending Worldwide.</p>
			<p>2120 University Ave, Berkeley, CA 94704, United States</p>
		</div>
		<div class="footer-disclaimer">
			<Disclaimer />
		</div>
	</div>
</footer>

<style>
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

	.footer-top {
		flex-basis: 100%;
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.footer-brand {
		flex-shrink: 0;
		margin-right: auto;
	}

	.footer-links {
		display: flex;
		flex: 1;
		flex-wrap: wrap;
		gap: 0.5rem 0.9rem;
		justify-content: center;
		align-items: center;
	}

	.footer-links a {
		color: #a8d5f0;
		text-decoration: none;
		font-size: 0.92rem;
	}

	.footer-links a:hover {
		color: white;
		text-decoration: underline;
	}

	.footer-brand :global(.nav-logo a) {
		gap: 0.75rem;
	}

	.footer-brand :global(.nav-logo-text) {
		align-items: flex-start;
	}

	.footer-meta {
		flex-basis: 100%;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.5rem;
		justify-content: center;
		align-items: center;
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

		.footer-links {
			flex-basis: 100%;
		}

		.footer-top {
			flex-direction: column;
			align-items: center;
			gap: 1rem;
		}

		.footer-brand {
			margin-right: 0;
		}

		.footer-meta {
			gap: 0.45rem;
		}

		.footer-disclaimer {
			padding-top: 0.8rem;
		}
	}
</style>
