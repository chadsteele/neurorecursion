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

	<div class="ngo-container">
		{#each ngos as ngo (ngo.href)}
			<NGOCard {...ngo} />
		{/each}
	</div>
</section>

<style>
	.ngo-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		padding: 0;
	}

	@media (max-width: 799px) {
		.ngo-container {
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		}
	}

	@media (max-width: 400px) {
		.ngo-container {
			grid-template-columns: 1fr;
		}
	}
</style>
