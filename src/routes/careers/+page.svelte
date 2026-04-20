<script>
	import LinkedInIcon from "$lib/LinkedInIcon.svelte"
	import PageBackground from "$lib/PageBackground.svelte"
	import ShareModal from "$lib/ShareModal.svelte"
	import jobs from "../../data/Jobs.js"

	let showShareModal = $state(false)
	let Share2Icon = $state(null)

	$effect(() => {
		import("lucide-svelte").then((module) => {
			Share2Icon = module.Share2
		})
	})

	function handleShare() {
		showShareModal = true
	}
</script>

{#if showShareModal}
	<ShareModal
		title="Neuro Recursion Institute - Careers"
		description="Join our team! We're hiring talented people passionate about neuroscience research and clinical innovation."
		imageUrl="https://cri-cdn.netlify.app/src/neurorecursion.com/backgrounds/general-neurological-issues.png"
		url={typeof window !== "undefined"
			? `${window.location.origin}/careers`
			: "/careers"}
		onClose={() => (showShareModal = false)}
	/>
{/if}

<PageBackground
	src="https://cri-cdn.netlify.app/src/neurorecursion.com/backgrounds/general-neurological-issues.png"
/>

<section class="careers-section page-shell">
	<div class="paper container page-stack">
		<div class="header-flex">
			<img
				src="/logo.png"
				alt="Neuro Recursion Institute"
				class="float-logo"
			/>
			<div>
				<h2>Careers</h2>
				<p>
					We're always looking for talented people to join our team.
					If you're passionate about neuroscience research and
					clinical innovation, we'd love to hear from you.
				</p>

				<p>
					<strong>Why Join Us?</strong><br />
					We offer a fully remote work environment with generous benefits
					including competitive compensation, flexible scheduling, and
					professional development opportunities. We are an equal opportunity
					employer committed to building a diverse and inclusive team that
					reflects the communities we serve.
				</p>

				<p>
					If you're interested in becoming a certified practitioner of
					our protocol or joining our mission to advance neuroscience
					research, please reach out to discuss opportunities and how
					to get involved in our work.
				</p>
			</div>
		</div>
		<div class="jobs-section">
			<h3>Open Positions</h3>
			<div class="jobs-list">
				{#each jobs as job}
					<a href={`/careers/${job.id}`} class="job-item">
						<div class="job-title">{job.title}</div>
						<div class="job-info">{job.info}</div>
					</a>
				{/each}
			</div>
		</div>

		<div class="social-links">
			<a
				href="https://www.linkedin.com/company/neurorecursion"
				target="_blank"
				rel="noopener noreferrer"
				class="social-link"
				title="Follow us on LinkedIn"
			>
				<LinkedInIcon />
				LinkedIn
			</a>

			<button type="button" class="share-btn" onclick={handleShare}>
				{#if Share2Icon}
					<Share2Icon size={18} strokeWidth={2} />
				{/if}
				Share
			</button>
		</div>
	</div>
</section>

<style>
	.header-flex {
		display: flex;
		align-items: flex-start;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	@media (max-width: 799px) {
		.header-flex {
			flex-direction: column;
			align-items: center;
		}

		.float-logo {
			width: 100%;
			min-width: unset;
			max-width: 300px;
		}

		.header-flex > div {
			width: 100%;
		}
	}

	.float-logo {
		width: 30%;
		height: auto;
		border-radius: 8px;
		min-width: 300px;
	}

	h2 {
		color: #4a9fd8;
		font-size: 1.8rem;
		margin-bottom: 1rem;
		margin-top: 0;
	}

	p {
		color: #d0d0d0;
		line-height: 1.6;
	}

	.social-links {
		display: flex;
		gap: clamp(0.5rem, 2vw, 1rem);
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgb(var(--accent-rgb) / 0.2);
	}

	.social-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--accent-500);
		text-decoration: none;
		font-weight: 500;
		transition: all 0.3s ease;
	}

	.social-link:hover {
		color: var(--accent-soft);
		transform: translateY(-2px);
	}

	.social-link :global(svg) {
		width: 18px;
		height: 18px;
		transition: transform 0.3s ease;
		stroke-width: 2;
	}

	.social-link:hover :global(svg) {
		transform: scale(1.1);
	}

	.share-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: none;
		border: none;
		color: var(--accent-500);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		font-size: 1rem;
		padding: 0;
	}

	.share-btn:hover {
		color: var(--accent-soft);
		transform: translateY(-2px);
	}

	.share-btn :global(svg) {
		width: 18px;
		height: 18px;
		transition: transform 0.3s ease;
		stroke-width: 2;
	}

	.share-btn:hover :global(svg) {
		transform: scale(1.1);
	}

	.jobs-section {
		margin: 3rem 0;
		padding: 2rem;
		background: rgba(26, 36, 71, 0.5);
		border-radius: 8px;
		border: 1px solid rgb(var(--accent-rgb) / 0.2);
	}

	.jobs-section h3 {
		color: var(--accent-500);
		font-size: 1.4rem;
		margin-top: 0;
		margin-bottom: 1.5rem;
	}

	.jobs-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.job-item {
		background: rgba(43, 58, 84, 0.5);
		border: 1px solid rgb(var(--accent-rgb) / 0.15);
		border-radius: 6px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1.25rem;
		text-decoration: none;
		color: inherit;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.job-item:hover {
		background: rgba(43, 58, 84, 0.8);
		border-color: var(--accent-500);
		transform: translateX(4px);
		box-shadow: 0 4px 12px rgb(var(--accent-rgb) / 0.15);
	}

	.job-title {
		color: var(--accent-500);
		font-size: 1.1rem;
		font-weight: 600;
	}

	.job-info {
		color: var(--accent-soft);
		font-size: 0.9rem;
	}
</style>
