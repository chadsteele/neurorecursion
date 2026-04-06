<script>
	import {slugToCondition} from "$lib/utils.js"

	const {params} = $props()

	let condition = $derived(slugToCondition(params.slug))
</script>

{#if condition}
	<section class="paper container">
		<h2>{condition.name}</h2>
		<p>{condition.description}</p>
		<div class="condition-resources">
			{#if condition.ngo_url}
				<a
					href={condition.ngo_url}
					target="_blank"
					rel="noopener noreferrer"
				>
					Learn More - Support Organization
				</a>
			{/if}
			{#if condition.scientific_reference}
				<a
					href={condition.scientific_reference}
					target="_blank"
					rel="noopener noreferrer"
				>
					Scientific Reference
				</a>
			{/if}
		</div>
	</section>
{:else}
	<section class="paper container">
		<p>Condition not found.</p>
	</section>
{/if}

<style>
	section {
		padding: 2rem;
		background: #0f1419;
		border-radius: 8px;
		margin: 2rem auto;
	}

	h2 {
		color: #4a9fd8;
		margin-bottom: 1rem;
	}

	p {
		color: #d0d0d0;
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	.condition-resources {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
	}

	a {
		padding: 0.75rem 1.5rem;
		background: #4a9fd8;
		color: white;
		border-radius: 6px;
		text-decoration: none;
		transition: background 0.3s ease;
	}

	a:hover {
		background: #357ba8;
	}
</style>
