<script>
	import Parallax from "$lib/Parallax.svelte"
	import Conditions from "$lib/Conditions.js"

	let {onSignUpClick = () => {}} = $props()

	function handleSignUp(conditionName) {
		const checkbox = document.querySelector(
			`input[id="condition-${conditionName}"]`,
		)
		if (checkbox) {
			checkbox.checked = true
		}
		onSignUpClick(conditionName)
		window.location.hash = "signup"
	}
</script>

<div id="trials"></div>
{#each Conditions as condition (condition.name)}
	<div id={condition.id} path={condition.path}></div>
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
				<button
					type="button"
					class="signup-btn"
					onclick={() => handleSignUp(condition.name)}
				>
					✅ Sign up!
				</button>
				<a
					href={condition.ngo_url}
					target="_blank"
					rel="noopener noreferrer"
				>
					❤️ Support
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

<style>
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
		cursor: pointer;
	}

	.condition-links a:hover {
		background: #357ba8;
	}

	.condition-links .signup-btn {
		padding: 0.5rem 1rem;
		background: #4a9fd8;
		color: white;
		border: none;
		border-radius: 4px;
		transition: background 0.3s ease;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.condition-links .signup-btn:hover {
		background: #357ba8;
	}
</style>
