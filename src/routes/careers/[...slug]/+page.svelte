<script>
	import {goto} from "$app/navigation"
	import {page} from "$app/stores"
	import CareersForm from "$lib/CareersForm.svelte"
	import LinkedInIcon from "$lib/LinkedInIcon.svelte"
	import PageBackground from "$lib/PageBackground.svelte"
	import ShareModal from "$lib/ShareModal.svelte"
	import ClinicalResearchAssociate from "$lib/jobs/ClinicalResearchAssociate.svelte"
	import GrowthAffiliateMarketingSpecialist from "$lib/jobs/GrowthAffiliateMarketingSpecialist.svelte"
	import SmallGroupFacilitator from "$lib/jobs/SmallGroupFacilitator.svelte"
	import CertifiedCoach from "$lib/jobs/CertifiedCoach.svelte"
	import SpeakerFacilitator from "$lib/jobs/SpeakerFacilitator.svelte"
	import OtherTalent from "$lib/jobs/OtherTalent.svelte"
	import jobs from "../../../data/Jobs.js"

	const jobMapping = {
		"clinical-research-associate": ClinicalResearchAssociate,
		"growth-affiliate-marketing-specialist":
			GrowthAffiliateMarketingSpecialist,
		"small-group-facilitator": SmallGroupFacilitator,
		"certified-coach": CertifiedCoach,
		"speaker-facilitator": SpeakerFacilitator,
		"other-talent": OtherTalent,
	}

	function goBack() {
		goto("/careers")
	}

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

	let CurrentComponent = $derived(jobMapping[$page.params.slug])
	let backgroundUrl = $derived.by(() => {
		const job = jobs.find((job) => job.id === $page.params.slug)
		return job
			? job.background_url
			: "https://cri-cdn.netlify.app/src/neurorecursion.com/backgrounds/general-neurological-issues.png"
	})
</script>

{#if showShareModal}
	<ShareModal
		title={CurrentComponent
			? jobs.find((j) => j.id === $page.params.slug)?.title
			: "Join Our Team"}
		description="We're hiring! Join the Neuro Recursion Institute team."
		imageUrl={backgroundUrl}
		url={typeof window !== "undefined"
			? `${window.location.origin}/careers/${$page.params.slug}`
			: `/careers/${$page.params.slug}`}
		onClose={() => (showShareModal = false)}
	/>
{/if}

<PageBackground src={backgroundUrl} />

<section class="job-section page-shell">
	<div class="paper container page-stack">
		<!-- <button class="back-button" onclick={goBack}>← Back to Careers</button> -->

		<div class="job-content">
			{#if CurrentComponent}
				<CurrentComponent />
				<div class="application-form">
					<h2>Apply Now</h2>
					<p>
						Interested in this position? Please fill out the form
						below and we'll get back to you soon.
					</p>
					<CareersForm jobId={$page.params.slug} />
					<div class="social-links">
						<a
							href="https://www.linkedin.com/company/neurorecursion"
							target="_blank"
							rel="noopener"
							class="social-link"
							title="Follow us on LinkedIn"
						>
							<LinkedInIcon />
							LinkedIn
						</a>

						<button
							type="button"
							class="share-btn"
							onclick={handleShare}
						>
							{#if Share2Icon}
								<Share2Icon size={18} strokeWidth={2} />
							{/if}
							Share
						</button>
					</div>
				</div>
			{:else}
				<div class="error-message">Job listing not found</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.job-content {
		color: #d0d0d0;
		line-height: 1.8;
		margin: 3rem 0;
		padding: 2rem;
		background: rgba(26, 36, 71, 0.5);
		border-radius: 8px;
		border: 1px solid rgb(var(--accent-rgb) / 0.2);
	}

	.error-message {
		color: #ff6b6b;
		font-size: 1.1rem;
		padding: 2rem;
		text-align: center;
	}

	.application-form {
		margin-top: 4rem;
		padding-top: 3rem;
		border-top: 2px solid rgb(var(--accent-rgb) / 0.2);
	}

	.application-form h2 {
		color: var(--accent-500);
		font-size: 1.6rem;
		margin-bottom: 1rem;
	}

	.application-form p {
		color: #d0d0d0;
		margin-bottom: 2rem;
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
</style>
