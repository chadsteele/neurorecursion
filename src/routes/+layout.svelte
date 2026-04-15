<script>
	import "../app.css"
	import Navbar from "$lib/Navbar.svelte"
	import SearchBar from "$lib/SearchBar.svelte"
	import Disclaimer from "$lib/Disclaimer.svelte"

	let {children} = $props()
</script>

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
		<div style="flex-basis: 100%;">
			<Disclaimer />
		</div>
		<!-- <p>
			<a href="https://hire.chadsteele.com">Made with ❤️ by Chad Steele</a
			>
		</p> -->
	</div>
</footer>

<style>
	.footer {
		text-align: center;
		padding: 2rem;
		color: #707070;
		border-top: 1px solid #1e5a96;
		margin-top: 4rem;
	}

	.footer-content {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: center;
		align-items: center;
	}

	.footer-content p {
		margin: 0;
		flex-shrink: 0;
		white-space: nowrap;
	}

	.footer-content p:last-child {
		flex-basis: 100%;
		white-space: normal;
		margin-top: 0.5rem;
	}

	@media (max-width: 900px) {
		.footer-content {
			gap: 0.5rem;
			font-size: 0.95rem;
		}

		.footer-content p {
			flex-basis: 100%;
			white-space: normal;
		}
	}
</style>
