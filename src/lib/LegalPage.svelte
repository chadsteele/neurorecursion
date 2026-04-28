<script>
	import {browser} from "$app/environment"
	import {onMount, tick} from "svelte"
	import PageBackground from "$lib/PageBackground.svelte"
	import {legalSections, resolveLegalSection} from "$lib/legalSections.js"
	import Speak from "./Speak.svelte"

	let {activeSection = ""} = $props()
	let currentSectionId = $state("")

	const resolvedSection = $derived(resolveLegalSection(activeSection))

	function syncCurrentSection() {
		if (!browser) {
			return
		}

		const hashSectionId = window.location.hash.replace(/^#/, "")
		currentSectionId = resolvedSection?.id || hashSectionId || ""
	}

	onMount(() => {
		syncCurrentSection()

		window.addEventListener("hashchange", syncCurrentSection)

		return () => {
			window.removeEventListener("hashchange", syncCurrentSection)
		}
	})

	$effect(() => {
		if (!browser || !resolvedSection?.id) {
			return
		}

		currentSectionId = resolvedSection.id

		tick().then(() => {
			document.getElementById(resolvedSection.id)?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			})
		})
	})

	$effect(() => {
		if (!browser || resolvedSection?.id) {
			return
		}

		syncCurrentSection()
	})
</script>

<svelte:head>
	<title>Legal | Neuro Recursion Institute</title>
	<meta
		name="description"
		content="Legal terms, privacy, intellectual property, confidentiality, liability limitations, and related corporate legal notices for Neuro Recursion Institute."
	/>
</svelte:head>

<PageBackground
	src="https://cri-cdn.netlify.app/src/neurorecursion.com/backgrounds/general-neurological-issues.avif"
/>

<section class="legal-page page-shell">
	<Speak>
		<div class="paper container page-stack">
			<header class="legal-header">
				<h2>Legal Terms</h2>
				<p class="effective-date">Effective date: April 21, 2016</p>
			</header>

			<nav class="toc" aria-labelledby="toc-heading">
				<h3 id="toc-heading">Table of Contents</h3>
				<div class="toc-grid">
					{#each legalSections as section}
						<a
							href={section.href}
							class:toc-link-active={currentSectionId ===
								section.id}
							class="toc-link"
						>
							{section.title}
						</a>
					{/each}
				</div>
			</nav>

			<section id="overview" class="legal-section">
				<h3>Overview</h3>
				<p>
					By accessing this website, submitting information through
					forms, communicating with the organization, purchasing
					services or products, participating in research or related
					programs, or using any materials provided by Neuro Recursion
					Institute, you agree that your use is subject to these legal
					terms together with any additional consent, purchase,
					onboarding, professional, research, or engagement-specific
					agreements presented to you.
				</p>
				<p>
					If a separate written agreement applies to a specific
					relationship, transaction, or program, that separate
					agreement controls to the extent of any conflict. If you do
					not agree with these terms, you should not use the site or
					rely on any materials made available through it.
				</p>
			</section>

			<section id="privacy-data-use" class="legal-section">
				<h3>Privacy and Data Use</h3>
				<p>
					We may collect information you voluntarily provide,
					including contact information, inquiry details, form
					submissions, messages, program interest, consent records,
					business communications, and any other information you
					choose to send. We may also collect ordinary technical
					information associated with site operation, security,
					performance, analytics, fraud prevention, and support.
				</p>
				<p>
					We may use information to respond to inquiries, manage
					relationships, operate programs, process purchases, support
					research or business operations, send administrative
					communications, improve products, protect the site, comply
					with law, and maintain records. We may store, process, and
					disclose information to service providers, affiliates,
					professional advisors, researchers, payment processors,
					hosting or analytics vendors, or legal authorities when
					reasonably necessary for business, security, contractual, or
					legal purposes.
				</p>
				<p>
					You should not submit highly sensitive, regulated, or
					confidential information through general website forms
					unless the site expressly requests it in a controlled
					context and you are comfortable with the associated
					handling. No system can guarantee absolute security, and by
					using the site you acknowledge that electronic storage and
					transmission always involve some risk.
				</p>
			</section>

			<section id="acceptable-use" class="legal-section">
				<h3>Acceptable Use</h3>
				<p>
					You may not use the site or any materials in a way that is
					unlawful, fraudulent, defamatory, infringing, abusive,
					deceptive, invasive of privacy, harmful to infrastructure,
					or inconsistent with legitimate business or educational
					purposes. You may not interfere with site operation, scrape
					or harvest data at scale without permission,
					reverse-engineer restricted materials, bypass access
					controls, or use the site to develop competing commercial
					materials from protected content.
				</p>
				<p>
					We may restrict, suspend, or terminate access if we believe
					use is unsafe, abusive, unlawful, commercially exploitative
					beyond authorized scope, or otherwise creates operational,
					reputational, legal, or security risk.
				</p>
			</section>

			<section id="intellectual-property" class="legal-section">
				<h3>Intellectual Property and Copyright</h3>
				<p>
					Unless otherwise stated, the site design, branding, copy,
					protocols, graphics, media, downloadable materials, layouts,
					trade names, trademarks, service marks, research framing,
					compilations, source materials, and related content are
					owned by Neuro Recursion Institute or used under permission.
					All rights not expressly granted are reserved.
				</p>
				<p>
					You may view and use publicly available materials for
					personal, informational, or internal evaluation purposes
					only. You may not copy, republish, distribute, modify, train
					commercial systems on, create derivative works from,
					publicly exploit, sublicense, or commercially use protected
					materials without prior written permission. Copyright,
					trademark, trade secret, and unfair competition protections
					apply to the fullest extent available.
				</p>
			</section>

			<section id="confidentiality-nda" class="legal-section">
				<h3>Confidentiality and NDA Expectations</h3>
				<p>
					Public website content is not itself confidential merely
					because it is valuable. However, non-public documents,
					methods, pricing details, research materials, technical
					information, business plans, patient or participant
					information, unpublished protocols, partnership terms,
					contractor materials, draft agreements, and internal
					communications may constitute confidential information.
				</p>
				<p>
					If you receive or access non-public information from Neuro
					Recursion Institute, you must treat it as confidential
					unless we clearly state otherwise in writing. If an NDA,
					contractor agreement, collaboration agreement, clinical
					document, or other written confidentiality document applies,
					that document governs. In the absence of a signed NDA, you
					should not assume that sending us your own confidential
					information creates a mutual confidentiality obligation
					unless we expressly agree to that in writing.
				</p>
			</section>

			<section id="medical-professional-disclaimer" class="legal-section">
				<h3>Medical and Professional Disclaimer</h3>
				<p>
					Website content is provided for general informational,
					educational, research, commercial, and discussion purposes
					only. It is not medical advice, psychiatric advice,
					psychotherapy, diagnosis, treatment, emergency guidance,
					legal advice, accounting advice, fiduciary advice, or
					professional advice tailored to your specific circumstances.
				</p>
				<p>
					Nothing on the site creates a clinician-patient,
					therapist-client, attorney-client, fiduciary, partnership,
					agency, employment, or other formal professional
					relationship unless a separate written agreement explicitly
					establishes one. You are responsible for obtaining
					independent medical, legal, financial, and professional
					advice where appropriate.
				</p>
			</section>

			<section id="no-guarantees" class="legal-section">
				<h3>No Guarantees</h3>
				<p>
					We do not guarantee any specific clinical, educational,
					commercial, financial, therapeutic, research, licensing,
					certification, hiring, partnership, or business outcome.
					Outcomes depend on facts outside our control, including user
					circumstances, health, environment, implementation quality,
					third-party systems, regulatory issues, market conditions,
					and operational constraints.
				</p>
				<p>
					The site and its materials are provided on an "as is" and
					"as available" basis to the maximum extent permitted by law.
					We disclaim warranties of merchantability, fitness for a
					particular purpose, non-infringement, uninterrupted access,
					error-free operation, and any warranty arising from course
					of dealing or usage of trade.
				</p>
			</section>

			<section id="payments-refunds" class="legal-section">
				<h3>Payments, Refunds, and Future Commercial Terms</h3>
				<p>
					If products, programs, services, certifications,
					subscriptions, coaching, or related commercial offerings are
					sold through the site or associated channels, additional
					commercial terms may apply at the point of sale. Pricing,
					refund rules, cancellation windows, recurring billing,
					delivery timing, taxes, and eligibility may vary by
					offering.
				</p>
				<p>
					Unless a specific offer says otherwise in writing, no user
					should assume an automatic refund right, transfer right,
					lifetime access, exclusive territory, certification right,
					or perpetual license. The terms presented at purchase or in
					the operative agreement control.
				</p>
			</section>

			<section id="third-party-links" class="legal-section">
				<h3>Third-Party Links and External Services</h3>
				<p>
					The site may link to third-party websites, papers,
					platforms, payment processors, communications services,
					scheduling tools, marketplace systems, cloud vendors, or
					social platforms. Those services operate under their own
					terms and privacy practices. We do not control and are not
					responsible for third-party availability, security, content,
					accuracy, or business practices.
				</p>
				<p>
					Use of third-party services is at your own risk. Inclusion
					of a link does not imply endorsement, affiliation, warranty,
					or ongoing review.
				</p>
			</section>

			<section id="liability" class="legal-section">
				<h3>Limitation of Liability</h3>
				<p>
					To the fullest extent permitted by law, Neuro Recursion
					Institute and its affiliates, officers, directors,
					employees, researchers, contractors, licensors, advisors,
					and service providers will not be liable for indirect,
					incidental, consequential, special, exemplary, punitive,
					reputational, lost-profit, lost-data, lost-business, loss of
					opportunity, personal, medical, regulatory, or similar
					damages arising from or related to your use of the site,
					reliance on content, participation in offerings, inability
					to access services, third-party failures, or any alleged
					breach of these terms.
				</p>
				<p>
					To the extent any direct liability cannot be disclaimed, it
					will be limited to the lesser of the amount you actually
					paid us for the specific service or product giving rise to
					the claim during the prior twelve months, or the minimum
					amount permitted by applicable law.
				</p>
			</section>

			<section id="indemnification" class="legal-section">
				<h3>Indemnification</h3>
				<p>
					You agree to defend, indemnify, and hold harmless Neuro
					Recursion Institute and its affiliates, officers, directors,
					employees, contractors, licensors, advisors, and service
					providers from and against claims, liabilities, damages,
					judgments, losses, costs, and expenses, including reasonable
					attorneys' fees, arising out of your misuse of the site,
					your breach of these terms, your infringement of third-party
					rights, your unlawful conduct, or your submission of
					content, data, or materials you did not have the right to
					provide.
				</p>
			</section>

			<section id="governing-law" class="legal-section">
				<h3>Governing Law and Disputes</h3>
				<p>
					Unless a separate written agreement says otherwise, these
					terms are governed by the laws of the State of California,
					without regard to conflict-of-law rules. You agree that
					disputes relating to the site or these terms will be brought
					in courts of competent jurisdiction located in California,
					unless mandatory law requires a different venue.
				</p>
				<p>
					Before filing a formal claim, the parties must first make a
					good-faith attempt to resolve the matter informally through
					written notice and reasonable discussion. If that does not
					resolve the dispute, the parties agree to participate in
					non-binding mediation with a mutually acceptable mediator
					before initiating litigation, unless mandatory law requires
					immediate access to court or emergency injunctive relief.
				</p>
			</section>

			<section id="changes-contact" class="legal-section">
				<h3>Changes and Contact</h3>
				<p>
					We may update these legal terms from time to time to reflect
					changes in operations, products, research activity, laws,
					vendor relationships, security practices, or business
					structure. Updated terms become effective when posted unless
					a later date is stated.
				</p>
				<p>
					For legal notices, permissions, IP questions,
					confidentiality inquiries, privacy requests, or general
					legal contact, reach out through the organization's official
					contact channels and identify the nature of the request
					clearly so it can be routed appropriately.
				</p>
			</section>
		</div>
	</Speak>
</section>

<style>
	.legal-header {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.effective-date {
		margin: 0;
		color: #b8e0f0;
		font-size: 0.95rem;
	}

	h2 {
		margin: 0;
		color: #4a9fd8;
		font-size: 2rem;
		line-height: 1.15;
	}

	h3 {
		margin: 0 0 0.75rem;
		color: #7fd0ff;
		font-size: 1.35rem;
		scroll-margin-top: 8rem;
	}

	.toc {
		padding: 1.5rem;
		border: 1px solid rgba(74, 159, 216, 0.28);
		border-radius: 10px;
		background: rgba(10, 22, 44, 0.42);
	}

	.toc-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem 1rem;
		margin-top: 1rem;
	}

	.toc-link {
		display: block;
		padding: 0.7rem 0.85rem;
		border-radius: 8px;
		background: rgba(74, 159, 216, 0.12);
		border: 1px solid rgba(74, 159, 216, 0.22);
		color: #dff4ff;
		text-decoration: none;
		transition:
			background 0.2s ease,
			transform 0.2s ease,
			border-color 0.2s ease;
	}

	.toc-link:hover {
		background: rgba(74, 159, 216, 0.2);
		border-color: rgba(74, 159, 216, 0.45);
		transform: translateY(-1px);
	}

	.toc-link-active {
		background: rgba(74, 159, 216, 0.26);
		border-color: rgba(127, 208, 255, 0.7);
		box-shadow: 0 0 0 1px rgba(127, 208, 255, 0.18);
		color: #ffffff;
	}

	.legal-section {
		scroll-margin-top: 80px;
		padding-top: 0.5rem;
		border-top: 1px solid rgba(143, 195, 232, 0.15);
	}

	.legal-section:first-of-type {
		padding-top: 0;
		border-top: none;
	}

	@media (max-width: 800px) {
		.toc-grid {
			grid-template-columns: 1fr;
		}

		h2 {
			font-size: 1.65rem;
		}
	}
</style>
