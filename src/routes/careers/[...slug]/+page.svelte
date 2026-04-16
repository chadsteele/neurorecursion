<script>
	import {goto} from "$app/navigation"
	import {page} from "$app/stores"
	import Parallax from "$lib/Parallax.svelte"
	import CareersForm from "$lib/CareersForm.svelte"
	import LinkedInIcon from "$lib/LinkedInIcon.svelte"
	import ClinicalResearchAssociate from "$lib/jobs/ClinicalResearchAssociate.svelte"
	import GrowthAffiliateMarketingSpecialist from "$lib/jobs/GrowthAffiliateMarketingSpecialist.svelte"
	import SmallGroupFacilitator from "$lib/jobs/SmallGroupFacilitator.svelte"
	import CertifiedCoach from "$lib/jobs/CertifiedCoach.svelte"
	import SpeakerFacilitator from "$lib/jobs/SpeakerFacilitator.svelte"
	import OtherTalent from "$lib/jobs/OtherTalent.svelte"

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

	let CurrentComponent = $derived(jobMapping[$page.params.slug])
</script>

<Parallax background="/backgrounds/children.png">
	<section class="paper container">
		<button class="back-button" onclick={goBack}>← Back to Careers</button>

		<div class="job-content">
			{#if CurrentComponent}
				<svelte:component this={CurrentComponent} />
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
							rel="noopener noreferrer"
							class="social-link"
							title="Follow us on LinkedIn"
						>
							<LinkedInIcon />
							Find us on LinkedIn
						</a>
					</div>
				</div>
			{:else}
				<div class="error-message">Job listing not found</div>
			{/if}
		</div>
	</section>
</Parallax>

<style>
	.back-button {
		display: inline-block;
		margin-bottom: 2rem;
		padding: 0.5rem 1rem;
		background: rgba(74, 159, 216, 0.1);
		color: #4a9fd8;
		border: 1px solid rgba(74, 159, 216, 0.3);
		border-radius: 4px;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.back-button:hover {
		background: rgba(74, 159, 216, 0.2);
		border-color: #4a9fd8;
		transform: translateX(-4px);
	}

	.job-content {
		color: #d0d0d0;
		line-height: 1.8;
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
		border-top: 2px solid rgba(74, 159, 216, 0.2);
	}

	.application-form h2 {
		color: #4a9fd8;
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
		flex-direction: column;
		gap: 1.5rem;
		margin: 2rem 0 3rem 0;
		padding-top: 2rem;
		border-top: 1px solid rgba(74, 159, 216, 0.2);
	}

	.social-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #4a9fd8;
		text-decoration: none;
		font-weight: 500;
		transition: all 0.3s ease;
	}

	.social-link:hover {
		color: #a0d8ff;
		transform: translateY(-2px);
	}

	.social-link:hover svg {
		transform: scale(1.1);
	}
</style>
