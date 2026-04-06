<script>
	import Intro from "$lib/Intro.svelte"
	import Partners from "$lib/Partners.svelte"
	import References from "$lib/References.svelte"
	import SignUp from "$lib/SignUp.svelte"
	import Skeleton from "$lib/Skeleton.svelte"
	import Featured from "$lib/Featured.svelte"
	import Alert from "$lib/Alert.svelte"
	import Parallax from "$lib/Parallax.svelte"
	import Conditions from "$lib/Conditions.js"
</script>

<Parallax background="/backgrounds/children.jpg">
	<Intro class="paper container" />
	<References class="paper container" />
</Parallax>

<SignUp class="paper container" />

{#each Conditions as condition (condition.name)}
	<Parallax background={condition.background_image}>
		<section class="paper container">
			<h3>{condition.name}</h3>
			<p>
				{@html condition?.description
					?.trim()
					.split("\n")
					.map((line) => `<p>${line}</p>`)
					.join("")}
			</p>
			<div class="condition-links">
				<a
					href={condition.ngo_url}
					target="_blank"
					rel="noopener noreferrer"
				>
					Support Organization
				</a>
				<a
					href={condition.scientific_reference}
					target="_blank"
					rel="noopener noreferrer"
				>
					Scientific Reference
				</a>
			</div>
		</section>
	</Parallax>
{/each}

<Partners class="paper container" />

<style>
	.conditions-section h2 {
		color: #4a9fd8;
		font-size: 1.8rem;
		margin-bottom: 1rem;
		margin-top: 0;
	}

	.conditions-section p {
		color: #d0d0d0;
		font-size: 1rem;
		line-height: 1.6;
		margin: 0 0 2rem 0;
	}

	h3 {
		color: #4a9fd8;
		font-size: 1.5rem;
		margin-bottom: 1rem;
		margin-top: 0;
	}

	p {
		color: #d0d0d0;
		line-height: 1.6;
	}

	.condition-links {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
		flex-wrap: wrap;
	}

	.condition-links a {
		padding: 0.5rem 1rem;
		background: #4a9fd8;
		color: white;
		text-decoration: none;
		border-radius: 4px;
		transition: background 0.3s ease;
		font-size: 0.9rem;
	}

	.condition-links a:hover {
		background: #357ba8;
	}
</style>
