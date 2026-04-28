<script>
	import Parallax from "$lib/Parallax.svelte"
	import LazyParallaxImage from "$lib/LazyParallaxImage.svelte"
	import ShareModal from "$lib/ShareModal.svelte"
	import {ConditionsMap} from "$data/Conditions.js"
	import {
		CheckCircle2,
		Heart,
		FlaskConical,
		Share2,
		MapPin,
		Play,
	} from "lucide-svelte"
	import Virtues from "$data/Virtues.js"
	import RelatedVirtues from "$data/RelatedVirtues.js"
	import Speak from "./Speak.svelte"

	let {condition = {}, formData = {}, blur = 10} = $props()
	let showShareModal = $state(false)

	function handleShare() {
		showShareModal = true
	}

	let checked = $derived(
		formData.conditions && condition.name
			? formData.conditions[condition.name]
			: false,
	)
	function handleCheckedChange(event) {
		if (formData.conditions && condition.name) {
			formData.conditions[condition.name] = event.target.checked
		}
	}

	let isVirtue = $derived(!RelatedVirtues[condition.id])
	let relatedVirtueIds = $derived(
		isVirtue ? [] : (RelatedVirtues[condition.id] ?? []),
	)
	let relatedVirtues = $derived(
		relatedVirtueIds
			.map((virtueId) => Virtues.find((v) => v.id === virtueId))
			.filter(Boolean),
	)
	let relatedConditions = $derived(
		isVirtue
			? []
			: relatedVirtueIds
					.map((virtueId) => ConditionsMap[virtueId])
					.filter(Boolean),
	)
</script>

<div id={condition.id} path={condition.path}></div>

{#if showShareModal}
	<ShareModal
		title={condition.name}
		description={condition.description}
		imageUrl={condition.background_image || undefined}
		url={typeof window !== "undefined"
			? `${window.location.origin}${condition.path}`
			: condition.path}
		onClose={() => (showShareModal = false)}
	/>
{/if}

<Parallax background={condition.background_image || undefined} {blur}>
	<section class="paper container">
		{#if condition.background_image}
			<LazyParallaxImage
				src={condition.background_image}
				alt={condition.name}
			/>
		{/if}
		<Speak>
			<h3>{condition.name}</h3>

			{#if condition.type !== "virtue"}
				<div class="condition-description">
					A single traumatic moment that takes a fraction of a second
					can create limbic loops that can terrorize you for a
					lifetime. This employs the same neuroplasticity, but without
					the trauma, and it works in reverse. As powerfully as trauma
					can cause a lifetime of fear, this process can cause a
					lifetime of freedom from that fear.
				</div>
				<p>This could be your breakthrough!</p>
			{/if}

			<div class="condition-description">
				{@html condition?.description
					?.trim()
					.split("\n\n")
					.map((para) => `<p>${para.trim().replace(/\n/g, " ")}</p>`)
					.filter((p) => p !== "<p></p>")
					.join("")}
			</div>

			{#if condition.type !== "virtue"}
				<p>This could be your breakthrough! Sign up now.</p>
			{/if}
		</Speak>

		<div class="condition-links">
			{#if condition.type !== "virtue"}
				<label class="toggle-slider">
					<input
						type="checkbox"
						{checked}
						onchange={handleCheckedChange}
					/>
					<span class="slider"></span>
					<span class="toggle-label">
						{formData.conditions &&
						condition.name &&
						formData.conditions[condition.name]
							? "Yes, maybe?"
							: "No, not me!"}
					</span>
				</label>
				<a type="button" class="signup-btn" href="/signup">
					<CheckCircle2 size={18} strokeWidth={2} />
					Sign up!
				</a>
			{/if}

			{#if condition.ngo_url}
				<a href={condition.ngo_url} target="_blank" rel="noopener">
					<Heart size={18} strokeWidth={2} />
					Support
				</a>
			{/if}

			{#if condition.type !== "virtue"}
				<a
					href={`https://www.google.com/search?q=near+me+${encodeURIComponent(condition.name)}`}
					target="_blank"
					rel="noopener"
				>
					<MapPin size={18} strokeWidth={2} />
					Help near you
				</a>
				<a
					href={condition.scientific_reference ||
						`https://pmc.ncbi.nlm.nih.gov/search/?term=${condition.name}`}
					target="_blank"
					rel="noopener"
				>
					<FlaskConical size={18} strokeWidth={2} />
					Science
				</a>
				<a
					class="share-btn"
					href={`https://www.youtube.com/results?search_query=${encodeURIComponent("neurorecursion neuroscience neuroplasticity " + condition.name)}`}
					target="_blank"
					rel="noopener"
				>
					<Play size={18} strokeWidth={2} />
					Watch
				</a>
				<button type="button" class="share-btn" onclick={handleShare}>
					<Share2 size={18} strokeWidth={2} />
					Share
				</button>
			{/if}
		</div>

		{#if relatedVirtues.length > 0}
			<h3 style="margin-top:2rem">
				Opportunities for more emotional freedom
			</h3>
			<div class="related-conditions" aria-label="Related virtues">
				{#each relatedVirtues as virtue (virtue.id)}
					<a href={virtue.path} class="related-condition-link">
						{virtue.name}
					</a>
				{/each}
			</div>
		{/if}

		{#if relatedConditions.length > 0}
			<h3 style="margin-top:2rem">Related Conditions</h3>
			<div class="related-conditions" aria-label="Related conditions">
				{#each relatedConditions as relatedCondition (relatedCondition.id)}
					<a
						href={relatedCondition.path}
						class="related-condition-link"
					>
						{relatedCondition.name}
					</a>
				{/each}
			</div>
		{/if}
	</section>
</Parallax>

<style>
	:global(.condition-description a) {
		color: #a0d8ff !important;
		text-decoration: none !important;
		/* background: rgba(74, 159, 216, 0.15) !important; */
		padding: 0.2rem 0.4rem !important;
		border-radius: 3px !important;
		transition: all 0.2s ease !important;
		border-bottom: 1px solid rgba(74, 159, 216, 0.4) !important;
		cursor: pointer !important;
	}

	:global(.condition-description a:hover) {
		color: white !important;
		background: rgba(74, 159, 216, 0.35) !important;
		border-bottom-color: #4a9fd8 !important;
		transform: translateY(-1px) !important;
	}

	:global(.condition-description a:active) {
		transform: translateY(0) !important;
	}

	.related-conditions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		margin: 1rem 0 1.25rem;
	}

	.related-condition-link {
		display: inline-flex;
		align-items: center;
		padding: 0.45rem 0.75rem;
		border-radius: 999px;
		border: 1px solid rgba(74, 159, 216, 0.35);
		background: rgba(74, 159, 216, 0.12);
		color: #a0d8ff;
		text-decoration: none;
		font-size: 0.9rem;
		line-height: 1.3;
		transition:
			background 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease,
			transform 0.2s ease;
	}

	.related-condition-link:hover {
		background: rgba(74, 159, 216, 0.24);
		border-color: rgba(74, 159, 216, 0.65);
		color: white;
		transform: translateY(-1px);
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

	p:first-child {
		margin-top: 0;
	}

	p:last-child {
		margin-bottom: 0;
	}

	.condition-links {
		display: flex;
		gap: clamp(0.5rem, 2vw, 1rem);
		margin-top: 1.5rem;
		flex-wrap: wrap;
		justify-content: flex-start;
	}

	.condition-links a {
		text-decoration: none;
	}

	@media (max-width: 768px) {
		.condition-links {
			justify-content: flex-end;
		}
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
		font-size: clamp(0.7rem, 2vw, 0.95rem);
		color: #a0d8ff;
		min-width: 35px;
	}
</style>
