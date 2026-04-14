<script>
	import NGOCard from "./NGOCard.svelte"
	import {ngos} from "../data/NGOs.js"

	let {...props} = $props()
</script>

<section {...props}>
	<p>
		The Neuro Recursion Institute supports the world's leading
		non-governmental organizations dedicated to neurodivergent advocacy,
		clinical research, and systemic support.
	</p>
	<p>
		<a href="/signup">Contact us</a> to suggest a partnership or collaboration.
	</p>

	<div class="ngo-container">
		{#each ngos as ngo (ngo.href)}
			<NGOCard {...ngo} />
		{/each}
	</div>
</section>

<style>
	section p a {
		color: #4a9fd8;
		text-decoration: none;
		transition: color 0.3s ease;
	}

	section p a:hover {
		color: #6bb3e0;
		text-decoration: underline;
	}

	.ngo-container {
		column-count: 3;
		column-gap: 1.5rem;
		padding: 0;
	}

	:global(.ngo-container > *) {
		margin-bottom: 1rem;
		break-inside: avoid;
	}

	@media (max-width: 1200px) {
		.ngo-container {
			column-count: 2;
		}
	}

	@media (max-width: 799px) {
		.ngo-container {
			column-count: 1;
		}
	}
</style>
