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
		const query = $page.params.query

		if (query) {
			// Extract the first word from the query
			const firstWord = query.toLowerCase().split(/[\s-_]+/)[0]

			// Skip if trying to navigate to svelte's internal elements
			if (firstWord === "svelte-announcer") return

			// Find first element whose ID contains the first word
			const allElements = document.querySelectorAll(
				"[id]:not(#svelte-announcer)",
			)
			let targetElement = null

			for (const el of allElements) {
				// Skip elements inside forms
				if (el.closest("form")) {
					continue
				}
				if (el.id && el.id.toLowerCase().includes(firstWord)) {
					targetElement = el
					break
				}
			}

			// If no ID found, search for h1 or h2 with the word in its text
			if (!targetElement) {
				const headings = document.querySelectorAll(
					"h1, h2, h3, h4, h5, h6",
				)
					? document.querySelectorAll("h1, h2, h3, h4, h5, h6")
					: []
				for (const heading of headings) {
					// Skip headings inside forms
					if (heading.closest("form")) {
						continue
					}
					if (
						heading.textContent &&
						heading.textContent.toLowerCase().includes(firstWord)
					) {
						targetElement = heading
						break
					}
				}
			}

			// Scroll to the found element
			if (targetElement) {
				setTimeout(() => {
					targetElement.scrollIntoView({
						behavior: "smooth",
						block: "start",
					})
				}, 100)
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
