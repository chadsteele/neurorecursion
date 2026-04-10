<script>
	import Parallax from "$lib/Parallax.svelte"
	import {browser} from "$app/environment"
	import {CheckCircle2, Heart, FlaskConical, Share2} from "lucide-svelte"

	let {condition = {}, formData = {}} = $props()

	function handleShare() {
		const shareUrl = browser
			? `${window.location.origin}${condition.path}`
			: condition.path

		// Check if Web Share API is available
		if (navigator.share) {
			navigator
				.share({
					title: condition.name,
					text: `Learn more about ${condition.name}`,
					url: shareUrl,
				})
				.catch((err) => {
					// User cancelled or error occurred, copy to clipboard as fallback
					copyToClipboard(shareUrl)
				})
		} else {
			// Fallback: copy to clipboard
			copyToClipboard(shareUrl)
		}
	}

	function copyToClipboard(text) {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				// Show brief feedback (optional)
				alert("Link copied to clipboard!")
			})
			.catch((err) => {
				console.error("Failed to copy to clipboard:", err)
			})
	}
</script>

<div id={condition.id} path={condition.path}></div>
<Parallax background={condition.background_image}>
	<section class="paper container">
		<h3>{condition.name}</h3>
		<div>
			{@html condition?.description
				?.trim()
				.split("\n\n")
				.map((para) => `<p>${para.trim().replace(/\n/g, " ")}</p>`)
				.filter((p) => p !== "<p></p>")
				.join("")}
		</div>

		<p>This could be your breakthrough! Sign up now.</p>

		<div class="condition-links">
			<label class="toggle-slider">
				<input
					type="checkbox"
					bind:checked={formData.conditions[condition.name]}
				/>
				<span class="slider"></span>
				<span class="toggle-label">
					{formData.conditions[condition.name]
						? "Yes, maybe?"
						: "No, not me!"}
				</span>
			</label>
			<a type="button" class="signup-btn" href="#signup">
				<CheckCircle2 size={18} strokeWidth={2} />
				Sign up!
			</a>

			{#if condition.ngo_url}
				<a
					href={condition.ngo_url}
					target="_blank"
					rel="noopener noreferrer"
				>
					<Heart size={18} strokeWidth={2} />
					Support
				</a>
			{/if}
			<a
				href={condition.scientific_reference ||
					`https://pmc.ncbi.nlm.nih.gov/search/?term=${condition.name}`}
				target="_blank"
				rel="noopener noreferrer"
			>
				<FlaskConical size={18} strokeWidth={2} />
				Science
			</a>
			<button type="button" class="share-btn" onclick={handleShare}>
				<Share2 size={18} strokeWidth={2} />
				Share
			</button>
		</div>
	</section>
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

	p:first-child {
		margin-top: 0;
	}

	p:last-child {
		margin-bottom: 0;
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
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.condition-links a:hover {
		background: #357ba8;
	}

	.share-btn {
		padding: 0.5rem 1rem;
		background: #4a9fd8;
		color: white;
		border: none;
		border-radius: 4px;
		transition: background 0.3s ease;
		font-size: 0.9rem;
		cursor: pointer;
		font-family: inherit;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.share-btn:hover {
		background: #357ba8;
	}

	.share-btn:active {
		transform: scale(0.98);
	}

	.toggle-slider {
		display: flex;
		align-items: center;
		cursor: pointer;
		user-select: none;
	}

	.toggle-slider input {
		display: none;
	}

	.slider {
		position: relative;
		display: inline-block;
		width: 50px;
		height: 26px;
		background-color: #4a5f7f;
		border-radius: 24px;
		transition: background-color 0.3s ease;
		border: 1px solid rgba(74, 159, 216, 0.3);
	}

	.slider::after {
		content: "";
		position: absolute;
		width: 20px;
		height: 20px;
		left: 2px;
		top: 2px;
		background-color: white;
		border-radius: 50%;
		transition: transform 0.3s ease;
	}

	.toggle-slider input:checked + .slider {
		background-color: #4a9fd8;
		border-color: rgba(74, 159, 216, 0.8);
	}

	.toggle-slider input:checked + .slider::after {
		transform: translateX(26px);
	}

	.toggle-label {
		margin-left: 0.5rem;
		font-weight: 600;
		font-size: 0.85rem;
		color: #a0d8ff;
		min-width: 35px;
	}
</style>
