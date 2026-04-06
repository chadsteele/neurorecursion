<script>
	import Conditions from "./Conditions.js"
</script>

<section class="main-section">
	<h2>Conditions & Anxiety-Triggered Manifestations</h2>
	<div class="grid-section">
		{#each Conditions as condition (condition.name)}
			<div class="card">
				<h3>{condition.name}</h3>
				<p>{condition.description}</p>
				<div class="card-links">
					<a
						href={condition.ngo_url}
						target="_blank"
						rel="noopener noreferrer">Support Organization</a
					>
					<a
						href={condition.scientific_reference}
						target="_blank"
						rel="noopener noreferrer">Research</a
					>
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.grid-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-top: 1.5rem;
	}

	.card {
		background: rgba(50, 50, 70, 0.6);
		border: 1px solid rgba(74, 159, 216, 0.3);
		border-radius: 6px;
		padding: 1.5rem;
		transition: all 0.3s ease;
	}

	.card:hover {
		background: rgba(60, 60, 85, 0.8);
		border-color: rgba(74, 159, 216, 0.6);
		transform: translateY(-4px);
		box-shadow: 0 8px 16px rgba(74, 159, 216, 0.2);
	}

	.card h3 {
		color: #4a9fd8;
		font-size: 1.3rem;
		margin-bottom: 0.75rem;
		margin-top: 0;
	}

	.card p {
		color: #d0d0d0;
		font-size: 0.95rem;
		line-height: 1.6;
		margin: 0 0 1rem 0;
	}

	.card-links {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.card-links a {
		color: #4a9fd8;
		text-decoration: none;
		font-size: 0.9rem;
		border: 1px solid rgba(74, 159, 216, 0.4);
		padding: 0.5rem 0.75rem;
		border-radius: 4px;
		transition: all 0.2s ease;
	}

	.card-links a:hover {
		background: rgba(74, 159, 216, 0.15);
		border-color: rgba(74, 159, 216, 0.8);
		color: #6ab5e8;
	}
</style>
