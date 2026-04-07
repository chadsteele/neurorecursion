<script>
	import {onMount} from "svelte"
	import {page} from "$app/stores"
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

	onMount(() => {
		// Get query parameter and navigate to that section if it exists
		const params = new URLSearchParams(window.location.search)
		const query = params.get("q") || $page.params.query

		if (query) {
			// Skip if trying to navigate to svelte's internal elements
			if (query.toLowerCase() === "svelte-announcer") return

			// First, try exact ID match
			let element = document.getElementById(query)

			// If no exact match, find first element whose ID contains the query
			if (!element) {
				const allElements = document.querySelectorAll(
					"[id]:not(#svelte-announcer)",
				)
				for (const el of allElements) {
					if (
						el.id &&
						el.id.toLowerCase().includes(query.toLowerCase())
					) {
						element = el
						break
					}
				}
			}

			// Navigate to the element if found
			if (element) {
				window.location.hash = "#" + element.id
			}
		}
	})
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
				<button
					type="button"
					class="signup-btn"
					onclick={() => handleSignUpClick(condition.name)}
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

<div id="partners"></div>
<Parallax background="/backgrounds/kids-blowing-bubbles.webp">
	<Partners class="paper container" />
</Parallax>

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
