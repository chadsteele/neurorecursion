<script>
	import Parallax from "$lib/Parallax.svelte"
	import ShareModal from "$lib/ShareModal.svelte"
	import Tag from "$lib/Tag.svelte"
	import {Share2, ExternalLink} from "lucide-svelte"

	let {pioneer = {}} = $props()
	let showShareModal = $state(false)

	function handleShare() {
		showShareModal = true
	}
</script>

<div id={pioneer.id} path={pioneer.path}></div>

{#if showShareModal}
	<ShareModal
		title={pioneer.name}
		description={`${pioneer.title} at ${pioneer.institution}\n${pioneer.description}`}
		imageUrl={pioneer.img_url || pioneer.background_url}
		url={typeof window !== "undefined"
			? `${window.location.origin}${pioneer.path}`
			: pioneer.path}
		onClose={() => (showShareModal = false)}
	/>
{/if}

<Parallax background={pioneer.background_url || ""}>
	<section class="paper container">
		<div class="pioneer-header">
			{#if pioneer.img_url}
				<img
					src={pioneer.img_url}
					alt={pioneer.name}
					class="pioneer-image"
				/>
			{/if}
			<div class="pioneer-info">
				<h3>{pioneer.name}</h3>
				<p class="title">{pioneer.title}</p>
				<p class="institution">{pioneer.institution}</p>
				{#if pioneer.department}
					<p class="department">Department of {pioneer.department}</p>
				{/if}
			</div>
		</div>

		{#if pioneer.education}
			<div class="credentials">
				<h4>Education</h4>
				<p>{pioneer.education}</p>
			</div>
		{/if}

		{#if pioneer.researchFocus}
			<div class="research-focus">
				<h4>Research Focus</h4>
				<p>{pioneer.researchFocus}</p>
			</div>
		{/if}

		{#if pioneer.description}
			<div class="description">
				<h4>Research</h4>
				<div>
					{@html pioneer.description
						?.trim()
						.split("\n\n")
						.map(
							(para) =>
								`<p>${para.trim().replace(/\n/g, " ")}</p>`,
						)
						.filter((p) => p !== "<p></p>")
						.join("")}
				</div>
			</div>
		{/if}

		{#if pioneer.researchAreas && pioneer.researchAreas.length > 0}
			<div class="research-areas">
				<h4>Research Areas</h4>
				<div class="tags">
					{#each pioneer.researchAreas as area (area)}
						<Tag label={area} />
					{/each}
				</div>
			</div>
		{/if}

		<div class="pioneer-actions">
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
		font-size: 1.8rem;
		margin: 0 0 0.5rem 0;
	}

	h4 {
		color: #4a9fd8;
		font-size: 1.1rem;
		margin-bottom: 0.75rem;
		margin-top: 1.5rem;
	}

	h4:first-of-type {
		margin-top: 1rem;
	}

	p {
		color: #d0d0d0;
		line-height: 1.6;
		margin: 0 0 0.5rem 0;
	}

	.pioneer-header {
		display: flex;
		gap: 2rem;
		margin-bottom: 2rem;
		align-items: flex-start;
	}

	.pioneer-image {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		object-fit: cover;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		flex-shrink: 0;
	}

	.pioneer-info {
		flex: 1;
	}

	.title {
		font-size: 1rem;
		font-weight: 600;
		color: #a0d8ff;
		margin-bottom: 0.5rem;
	}

	.institution {
		font-weight: 500;
		color: #b8e0f0;
		margin-bottom: 0.25rem;
	}

	.department {
		font-size: 0.95rem;
		color: #8bc3e8;
	}

	.credentials {
		margin-top: 1.5rem;
	}

	.credentials p {
		font-size: 0.95rem;
	}

	.research-focus {
		margin-top: 1rem;
	}

	.research-focus p {
		font-size: 0.95rem;
	}

	:global(.description div p) {
		margin-bottom: 1rem;
	}

	:global(.description div p:last-child) {
		margin-bottom: 0;
	}

	.research-areas {
		margin-top: 1rem;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.pioneer-actions {
		display: flex;
		gap: clamp(0.5rem, 2vw, 1rem);
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(74, 159, 216, 0.2);
	}

	@media (max-width: 768px) {
		.pioneer-header {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}

		.pioneer-image {
			width: 120px;
			height: 120px;
		}

		h3 {
			font-size: 1.5rem;
		}
	}
</style>
