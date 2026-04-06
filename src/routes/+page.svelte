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

	function handleSignUpClick(conditionName) {
		// Find the checkbox for this condition and check it
		const checkbox = document.querySelector(
			`input[id="condition-${conditionName}"]`,
		)
		if (checkbox) {
			checkbox.checked = true
		}

		// Update hash and let browser scroll to it
		window.location.hash = "signup"
	}
</script>

<Parallax background="/backgrounds/children.jpg">
	<div id="about"></div>
	<Intro class="paper container" />
	<References class="paper container" />
</Parallax>

<SignUp class="paper container" />

<div id="trials"></div>
{#each Conditions as condition (condition.name)}
	<div id={condition.id}></div>
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

			<p>This could be your breakthrough! Sign up now.</p>
			<div class="condition-links">
				<a onclick={() => handleSignUpClick(condition.name)}
					>✅ Sign up!</a
				>
				<a
					href={condition.ngo_url}
					target="_blank"
					rel="noopener noreferrer"
				>
					❤️ NGO Support
				</a>
				<a
					href={condition.scientific_reference}
					target="_blank"
					rel="noopener noreferrer"
				>
					🔬 Science
				</a>
			</div>
		</section>
	</Parallax>
{/each}

<div id="partners"></div>
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

	.stats {
		background: rgba(74, 159, 216, 0.1);
		border-left: 4px solid #4a9fd8;
		padding: 1rem;
		border-radius: 4px;
		margin: 1.5rem 0;
		font-size: 0.95rem;
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
		cursor: pointer;
	}

	.condition-links a:hover {
		background: #357ba8;
	}
</style>
