<script>
	import {browser} from "$app/environment"
	import {onMount} from "svelte"
	import "../app.css"
	import Navbar from "$lib/Navbar.svelte"
	import SearchBar from "$lib/SearchBar.svelte"

	let {children} = $props()
</script>

<Navbar />
<SearchBar />

{@render children()}

<footer class="footer">
	<p>
		&copy; {new Date().getFullYear()} Neuro Recursion Institute. All rights reserved.
	</p>
	<p style="font-size: 0.9rem; margin-top: 0.5rem;">
		2120 University Ave, Berkeley, CA 94704, United States
	</p>
</footer>

<style>
	.footer {
		text-align: center;
		padding: 2rem;
		color: #707070;
		border-top: 1px solid #1e5a96;
		margin-top: 4rem;
	}
</style>
