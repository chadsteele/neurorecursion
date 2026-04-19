<script>
	import {
		Share2 as Share2Icon,
		Heart,
		Users,
		CheckCircle,
		QrCode,
		Copy,
		ArrowRight,
	} from "lucide-svelte"
	import LinkedInIcon from "$lib/LinkedInIcon.svelte"
	import PageBackground from "$lib/PageBackground.svelte"

	let showShareModal = $state(false)
	let affiliateId = "NR-8742-XKPQ"
	let copiedToClipboard = $state(false)

	function copyAffiliateId() {
		navigator.clipboard.writeText(affiliateId)
		copiedToClipboard = true
		setTimeout(() => {
			copiedToClipboard = false
		}, 2000)
	}

	function handleShare() {
		showShareModal = true
	}
</script>

<svelte:head>
	<title>Become an Affiliate | Neuro Recursion Institute</title>
	<meta
		name="description"
		content="Join the NeuroRecursion affiliate program. Share the breakthrough and earn from those you help recover. Empathy, purpose, and sustainable income."
	/>
</svelte:head>

<PageBackground
	src="https://neurorecursion-assets.netlify.app/assets/backgrounds/general-neurological-issues.png"
/>

<section class="affiliate-page page-shell">
	<div class="paper container page-stack">
		<div class="section-shell teaser-shell">
			<div class="teaser-copy">
				<h2>Show me the money!</h2>
				<div class="teaser-links">
					<a href="#math" class="primary-link">10% commission</a>
					<a href="#math" class="primary-link">$10k example</a>
					<a href="#math" class="primary-link">$25k example</a>
					<a href="#math" class="primary-link">$60k example</a>
				</div>
				<p>
					NeuroRecursion offers a flat 10% commission on referred
					purchases, tracked end to end, with revenue scenarios below
					so you can evaluate the opportunity without hype.
				</p>
			</div>
		</div>
		<div class="hero-panel">
			<div class="hero-copy">
				<div class="eyebrow">You're already an affiliate</div>
				<h1>
					Your recovery story is worth something. <br />To you and to
					others.
				</h1>
				<p class="lead">
					When you share what worked, you do two things at once: you
					help someone else find their way out, and you build
					something real from your own breakthrough. The
					NeuroRecursion affiliate program formalizes what naturally
					happens when recovery is genuine.
				</p>
				<p>
					You arrived with an ID. Every click you create is tracked.
					Every person who lands here through your link is known. All
					that's left is to get registered so we can honor your work
					with real payment.
				</p>
				<div class="hero-actions">
					<a
						href="https://neurorecursion.lemonsqueezy.com/checkout/buy/8e27e9f9-f15b-4c3e-800a-c67aed17dce6"
						target="_blank"
						rel="noopener noreferrer"
						class="primary-link"
					>
						→ Register as affiliate
					</a>
					<button
						type="button"
						class="share-trigger"
						onclick={handleShare}
					>
						<Share2Icon size={18} strokeWidth={2} />
						Share this
					</button>
				</div>
			</div>

			<div class="hero-stats">
				<div class="stat-card glow">
					<div class="stat-label">The real reason to do this</div>
					<div class="stat-value">Empathy</div>
					<p>
						You know what it's like to be trapped in a loop. You
						know the cost. You know the relief when it breaks. That
						knowing is something most marketers will never have. It
						is credible, rare, and transferable.
					</p>
				</div>
				<div class="stat-card">
					<div class="stat-label">The second reason</div>
					<div class="stat-value">Purpose</div>
					<p>
						Sharing your recovery is not selling. It is testimony.
						It is evidence. It is an invitation to someone else to
						try what worked for you. When they get better, you get
						better too. The ROI is human.
					</p>
				</div>
				<div class="stat-card">
					<div class="stat-label">The practical reason</div>
					<div class="stat-value">Money</div>
					<p>
						10% commission on every purchase your referral makes.
						Simple. Sustainable. No tricks. The math can be good if
						your audience is real and your message is true.
					</p>
				</div>
			</div>
		</div>

		<div class="section-shell prerequisite-shell">
			<h2>The first step is not optional</h2>
			<p>
				You cannot be an effective affiliate without a recovery story.
				And you cannot have a recovery story without doing the work.
			</p>
			<p>
				The clinical trial is free. Everyone has a source of anxiety, a
				pattern they've carried, a condition or circumstance that costs
				them. There is no stressful nervous system that cannot benefit
				from NeuroRecursion. That includes yours.
			</p>

			<div class="prerequisite-content">
				<div class="prerequisite-card">
					<h3>Why this matters</h3>
					<p>
						When you share your transformation, you're not making a
						pitch. You're giving testimony. You're saying: "This was
						hard for me. This worked for me. It can work for you
						too."
					</p>
					<p>
						That testimony only has power if it's real. And it can
						only be real if you've lived through it yourself.
					</p>
				</div>

				<div class="prerequisite-card">
					<h3>Everyone qualifies</h3>
					<p>
						You might think you don't have a "condition." You might
						think your anxiety or stress or pattern is just how you
						are. But if it costs you—in sleep, relationships, focus,
						peace, agency—then it qualifies.
					</p>
					<p>
						Do the trial. Let it work. Then share what you
						discovered.
					</p>
				</div>
			</div>

			<div class="prerequisite-cta">
				<p class="prerequisite-note">
					Do this first. Then come back here when you have your story
					to tell.
				</p>
				<a href="/#signup" class="primary-link"> → Start </a>
				&nbsp; the clinical trial. It's fast and free!
			</div>
		</div>

		<div class="section-shell how-it-works-shell">
			<h2>How it actually works</h2>
			<div class="timeline-grid">
				<article class="timeline-card">
					<div class="timeline-number">1</div>
					<h3>You already have an ID</h3>
					<p>
						When you first arrived here, the system gave you a
						unique affiliate identifier. It's been with you since
						that moment.
					</p>
				</article>
				<article class="timeline-card">
					<div class="timeline-number">2</div>
					<h3>Every share gets tracked</h3>
					<p>
						Share a link to any product page, training, or your own
						breakthrough story. If someone clicks it, the system
						knows it was you.
					</p>
				</article>
				<article class="timeline-card">
					<div class="timeline-number">3</div>
					<h3>They buy, you earn</h3>
					<p>
						If someone who clicks your link purchases a product, you
						get 10% of that purchase. No expiration. No games. Clean
						accounting.
					</p>
				</article>
				<article class="timeline-card">
					<div class="timeline-number">4</div>
					<h3>We send you payment</h3>
					<p>
						Register your account in LemonSqueezy, provide payment
						details, and you're ready to receive commissions. We
						process payouts monthly.
					</p>
				</article>
			</div>
		</div>

		<div class="section-shell empathy-shell">
			<h2>Empathy: Your unfair advantage</h2>
			<div class="advantage-grid">
				<div class="advantage-card">
					<div class="advantage-icon">
						<Heart size={20} strokeWidth={2} />
					</div>
					<h3>You've lived it</h3>
					<p>
						You didn't buy marketing data. You didn't hire
						consultants. You lived through the panic, the shame, the
						exhaustion. That lived experience is worth more than a
						thousand ad campaigns. People can feel it.
					</p>
				</div>
				<div class="advantage-card">
					<div class="advantage-icon">
						<Users size={20} strokeWidth={2} />
					</div>
					<h3>You know the audience</h3>
					<p>
						You know what questions they're asking because you asked
						them. You know what doubts they have because you had
						them. You know what keeps them stuck and what breaks
						them free.
					</p>
				</div>
				<div class="advantage-card">
					<div class="advantage-icon">
						<CheckCircle size={20} strokeWidth={2} />
					</div>
					<h3>You know what proof looks like</h3>
					<p>
						You don't need a testimonial. You are the proof. Your
						baseline is different now. Your presence is different.
						People notice and they believe.
					</p>
				</div>
			</div>
		</div>

		<div class="section-shell purpose-shell">
			<h2>Purpose: Make recovery contagious</h2>
			<p>
				The goal of NeuroRecursion is not to put people on medication
				for life. It is not to make therapy a permanent dependency. It
				is to give people durable freedom. To give them their agency
				back.
			</p>
			<p>
				When you share that mission with someone else, you are not
				selling. You are inviting. You are saying: "I got free. You can
				too."
			</p>
			<p>
				That is not a marketing message. That is a covenant. And people
				who believe in covenants attract other people who believe in
				covenants.
			</p>

			<div class="purpose-stats">
				<div class="stat-item">
					<div class="stat-item-label">Your recovery</div>
					<div class="stat-item-value">Durable</div>
					<p>The breakthrough holds because you practice it.</p>
				</div>
				<div class="stat-item">
					<div class="stat-item-label">Their hope</div>
					<div class="stat-item-value">Real</div>
					<p>
						Because you are proof that it is possible for them too.
					</p>
				</div>
				<div class="stat-item">
					<div class="stat-item-label">Your commission</div>
					<div class="stat-item-value">Earned</div>
					<p>
						For bridging the gap between their desperation and their
						freedom.
					</p>
				</div>
			</div>
		</div>

		<div class="section-shell strategy-shell">
			<h2>Strategy: Beyond the usual channels</h2>
			<p>
				Social media will get you starts. Email lists will get you
				consistency. Your personal network will get you credibility. But
				if you want to scale, you need a strategy that plays to your
				strengths: authenticity, empathy, and lived knowledge.
			</p>

			<div class="strategy-grid">
				<article class="strategy-card">
					<h3>1. Document your practice</h3>
					<p>
						Show what a week of NeuroRecursion practice looks like.
						Not a sales pitch. Just the mechanics. "This is how I do
						it. This is what changed."
					</p>
					<div class="strategy-note">
						Where: Blog, LinkedIn, YouTube Shorts, TikTok
					</div>
				</article>

				<article class="strategy-card">
					<h3>2. Answer the unasked questions</h3>
					<p>
						People don't ask "Is this real?" They ask "Will it work
						for me?" Address that. "I had X condition. Here's why I
						was skeptical. Here's what shifted."
					</p>
					<div class="strategy-note">
						Where: Podcast guest appearances, LinkedIn articles,
						Medium
					</div>
				</article>

				<article class="strategy-card">
					<h3>3. Build in the gaps</h3>
					<p>
						Find the communities of people with your condition. Not
						to pitch. To participate. To share what you've learned.
						To be present. Links happen naturally when you're
						genuinely helpful.
					</p>
					<div class="strategy-note">
						Where: Reddit communities, Facebook groups, Discord
						servers, support forums
					</div>
				</article>

				<article class="strategy-card">
					<h3>4. Teach what you learned</h3>
					<p>
						Host a free workshop on the fundamental principles.
						Share the mindset shifts that matter. Link to the full
						program for people ready to go deeper. You're not
						selling. You're filtering for people who are ready.
					</p>
					<div class="strategy-note">
						Where: Zoom webinars, YouTube, LinkedIn Live, Twitter
						Spaces
					</div>
				</article>

				<article class="strategy-card">
					<h3>5. Partner with other recovering people</h3>
					<p>
						Collaborate with therapists, coaches, and other
						practitioners who serve people with your condition. You
						don't compete. You complement. You cross-reference. You
						amplify.
					</p>
					<div class="strategy-note">
						Where: Joint webinars, podcast interviews, co-authored
						articles
					</div>
				</article>

				<article class="strategy-card">
					<h3>6. Use your story as infrastructure</h3>
					<p>
						The best marketing is just telling the truth in a way
						that lands. Share your recovery journey broken into
						chapters. Share setbacks and how you managed them. Share
						the real mechanics of how you stay free.
					</p>
					<div class="strategy-note">
						Where: Email newsletter, personal website, video series
					</div>
				</article>
			</div>
		</div>

		<div class="section-shell confidentiality-shell">
			<h2>Important: What you can and cannot share</h2>
			<p>
				The NeuroRecursion clinical trial process is proprietary. When
				you register as an affiliate, you're signing an NDA. That means
				the fundamental mechanics—how the protocol works, the specific
				technique, the detailed clinical methodology—are confidential.
				They belong to NeuroRecursion, not to you.
			</p>
			<p>
				This is not to limit your voice. It's to protect the integrity
				of something that works.
			</p>

			<div class="confidentiality-grid">
				<article class="confidentiality-card allowed">
					<div class="confidentiality-header">
						<h3>✓ You can share</h3>
					</div>
					<ul class="confidentiality-list">
						<li>
							<strong>Your transformation:</strong>
							"I was stuck in panic loops for 5 years. After the trial,
							things shifted."
						</li>
						<li>
							<strong>Your enthusiasm:</strong>
							"This changed my life. I'm serious."
						</li>
						<li>
							<strong>Your results:</strong>
							"My anxiety is down 80%. I sleep again. I'm functional."
						</li>
						<li>
							<strong>Your honest assessment:</strong>
							"It's not magic, but it's real. It requires practice."
						</li>
						<li>
							<strong>General principles:</strong>
							"It's about rewiring nervous system patterns through
							specific practice."
						</li>
						<li>
							<strong>Your invitation:</strong>
							"If you're struggling, it's worth trying. Click my link
							to learn more."
						</li>
					</ul>
				</article>

				<article class="confidentiality-card restricted">
					<div class="confidentiality-header">
						<h3>✗ You cannot share</h3>
					</div>
					<ul class="confidentiality-list">
						<li>
							<strong>The exact protocol:</strong>
							Step-by-step instructions for the clinical trial technique.
						</li>
						<li>
							<strong>Detailed methodology:</strong>
							How the technique is structured, why specific elements
							matter, exact timing/sequences.
						</li>
						<li>
							<strong>Training materials:</strong>
							Any internal guides, videos, or resources designed for
							certified practitioners.
						</li>
						<li>
							<strong>Clinical data:</strong>
							Specific results, statistics, or data from the trial
							that you don't have permission to share.
						</li>
						<li>
							<strong>Images or video:</strong>
							Recordings of yourself or others performing the technique
							(unless specifically authorized).
						</li>
						<li>
							<strong>Beyond your scope:</strong>
							Medical claims, diagnostic statements, or clinical guidance
							you're not certified to provide.
						</li>
					</ul>
				</article>
			</div>

			<div class="confidentiality-exception">
				<h3>When you can share everything</h3>
				<p>
					If you become a <strong>certified researcher</strong> or
					<strong>certified facilitator/coach</strong> professionally engaged
					with NeuroRecursion, you will receive specific training and authorization
					to teach the methodology. At that point, you have the legal authority
					and professional responsibility to share the process with your
					clients or research subjects.
				</p>
				<p>
					Until then, you're an affiliate sharing your story. Your
					story is powerful. Your story is enough. And your story is
					honest within the bounds of the NDA you've agreed to.
				</p>
			</div>
		</div>

		<div id="math" class="section-shell money-shell">
			<h2>Money: The math that works</h2>
			<p>
				Commission is 10% of every purchase your referral makes. There
				is no upper limit. No capping. No games.
			</p>

			<div class="revenue-examples">
				<div class="revenue-card">
					<div class="revenue-scenario">
						<h4>Conservative: 50 referrals per month</h4>
						<p>Average purchase value: $200</p>
					</div>
					<div class="revenue-math">
						<div class="math-row">
							<span>50 referrals × $200</span>
							<strong>$10,000</strong>
						</div>
						<div class="math-row">
							<span>10% commission</span>
							<strong>$1,000/month</strong>
						</div>
					</div>
				</div>

				<div class="revenue-card">
					<div class="revenue-scenario">
						<h4>Moderate: 100 referrals per month</h4>
						<p>Average purchase value: $250</p>
					</div>
					<div class="revenue-math">
						<div class="math-row">
							<span>100 referrals × $250</span>
							<strong>$25,000</strong>
						</div>
						<div class="math-row">
							<span>10% commission</span>
							<strong>$2,500/month</strong>
						</div>
					</div>
				</div>

				<div class="revenue-card">
					<div class="revenue-scenario">
						<h4>Ambitious: 200 referrals per month</h4>
						<p>Average purchase value: $300</p>
					</div>
					<div class="revenue-math">
						<div class="math-row">
							<span>200 referrals × $300</span>
							<strong>$60,000</strong>
						</div>
						<div class="math-row">
							<span>10% commission</span>
							<strong>$6,000/month</strong>
						</div>
					</div>
				</div>
			</div>

			<p class="revenue-note">
				These numbers represent potential, not guarantees. Real results
				depend on audience size, message quality, platform reach, and
				the genuine relevance of NeuroRecursion to your audience. But
				the math is real, the commission is real, and people do earn
				this kind of income from affiliate work when audience and offer
				align.
			</p>
		</div>

		<div class="section-shell closing-shell">
			<div class="closing-copy">
				<h2>You don't have to do this alone.</h2>
				<p>
					Your recovery is already proof. You don't need permission or
					credentials to share what saved your life. You need
					confidence, and that comes from knowing you're not selling
					something. You're inviting someone into freedom.
				</p>
				<p>
					The commission is real. The purpose is real. The impact is
					real. And it all starts with you deciding that your
					breakthrough is worth sharing.
				</p>
			</div>
			<div class="closing-actions">
				<a
					href="https://neurorecursion.lemonsqueezy.com/checkout/buy/8e27e9f9-f15b-4c3e-800a-c67aed17dce6"
					target="_blank"
					rel="noopener noreferrer"
					class="primary-link"
				>
					→ Complete affiliate registration
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	h1 {
		font-size: clamp(2.2rem, 4vw, 4.25rem);
		line-height: 1.05;
		margin: 0 0 1rem;
		color: #f5fbff;
		max-width: 12ch;
	}

	h2 {
		color: #4a9fd8;
		font-size: clamp(1.5rem, 2vw, 2.1rem);
		margin: 0 0 1rem;
	}

	h3 {
		margin: 0;
		color: #eaf7ff;
		font-size: 1.1rem;
	}

	h4 {
		margin: 0 0 0.5rem;
		color: #f5fbff;
		font-size: 1rem;
	}

	button,
	a {
		user-select: none;
	}

	p {
		color: #d5deea;
		line-height: 1.75;
	}

	.lead {
		font-size: 1.15rem;
		color: #eff8ff;
		max-width: 60ch;
	}

	.teaser-shell {
		display: grid;
		gap: 1.25rem;
	}

	.teaser-copy {
		display: grid;
		gap: 0.85rem;
		/* max-width: 72ch; */
	}

	.teaser-copy h2 {
		margin: 0;
		/* max-width: 26ch; */
	}

	.teaser-copy p {
		margin: 0;
		color: #dce8f2;
	}

	.teaser-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
	}

	.teaser-links .primary-link {
		padding: 0.55rem 0.95rem;
		font-size: 0.9rem;
		font-weight: 700;
		min-width: 140px;
	}

	.prerequisite-content {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		margin: 2rem 0;
	}

	.prerequisite-card {
		background: rgb(var(--accent-rgb) / 0.08);
		border: 1px solid rgb(var(--accent-soft-rgb) / 0.18);
		border-radius: 20px;
		padding: 1.5rem;
		user-select: none;
		transition:
			transform 0.25s ease,
			border-color 0.25s ease;
	}

	.prerequisite-card:hover {
		transform: translateY(-2px);
		border-color: rgb(var(--accent-bright-rgb) / 0.24);
	}

	.prerequisite-card h3 {
		margin-top: 0;
		color: var(--accent-soft);
		margin-bottom: 1rem;
	}

	.prerequisite-card p {
		font-size: 0.95rem;
		margin-bottom: 1rem;
	}

	.prerequisite-card p:last-child {
		margin-bottom: 0;
	}

	.prerequisite-cta {
		text-align: center;
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid rgb(var(--accent-soft-rgb) / 0.15);
	}

	.prerequisite-note {
		font-size: 0.9rem;
		color: var(--accent-muted);
		margin-top: 1rem;
		font-style: italic;
	}

	.timeline-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
	}

	.timeline-card {
		position: relative;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgb(var(--accent-soft-rgb) / 0.12);
		border-radius: 20px;
		padding: 1.5rem;
		user-select: none;
	}

	.timeline-number {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: linear-gradient(
			135deg,
			var(--accent-500),
			var(--accent-bright)
		);
		color: #07111d;
		font-size: 1.25rem;
		font-weight: 800;
		margin-bottom: 1rem;
	}

	.advantage-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1.2rem;
		margin-top: 1.5rem;
	}

	.advantage-card {
		position: relative;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgb(var(--accent-soft-rgb) / 0.12);
		border-radius: 20px;
		padding: 1.5rem;
		user-select: none;
		transition:
			transform 0.25s ease,
			border-color 0.25s ease;
	}

	.advantage-card h3 {
		text-align: center;
	}

	.advantage-card:hover {
		transform: translateY(-2px);
		border-color: rgb(var(--accent-bright-rgb) / 0.24);
	}

	.advantage-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 0.8rem;
		color: var(--accent-bright);
		opacity: 0.85;
	}

	.advantage-icon :global(svg) {
		width: 20px;
		height: 20px;
	}

	.advantage-card h3 {
		margin-bottom: 0.8rem;
	}

	.purpose-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.stat-item {
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgb(var(--accent-soft-rgb) / 0.12);
		border-radius: 18px;
		padding: 1.3rem;
		text-align: center;
	}

	.stat-item-label {
		color: var(--accent-muted);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 0.5rem;
	}

	.stat-item-value {
		font-size: 1.8rem;
		font-weight: 700;
		color: var(--accent-bright);
		margin-bottom: 0.8rem;
		display: block;
	}

	.stat-item p {
		font-size: 0.95rem;
		color: var(--accent-pale);
	}

	.strategy-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.2rem;
		margin-top: 1.5rem;
	}

	.strategy-card {
		position: relative;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgb(var(--accent-soft-rgb) / 0.12);
		border-radius: 20px;
		padding: 1.5rem;
		user-select: none;
		transition:
			transform 0.25s ease,
			border-color 0.25s ease;
	}

	.strategy-card:hover {
		transform: translateY(-2px);
		border-color: rgb(var(--accent-bright-rgb) / 0.24);
	}

	.strategy-card h3 {
		margin-bottom: 0.8rem;
		color: var(--accent-soft);
	}

	.strategy-card p {
		margin-bottom: 1rem;
		font-size: 0.95rem;
	}

	.strategy-note {
		font-size: 0.85rem;
		color: var(--accent-bright);
		padding-top: 1rem;
		border-top: 1px solid rgb(var(--accent-soft-rgb) / 0.15);
		font-style: italic;
	}

	.revenue-examples {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		margin: 2rem 0;
	}

	.revenue-card {
		background: rgb(var(--accent-rgb) / 0.08);
		border: 1px solid rgb(var(--accent-soft-rgb) / 0.18);
		border-radius: 20px;
		padding: 1.5rem;
		overflow: hidden;
	}

	.revenue-scenario {
		margin-bottom: 1.5rem;
	}

	.revenue-scenario h4 {
		color: var(--accent-soft);
		margin-bottom: 0.4rem;
	}

	.revenue-scenario p {
		font-size: 0.9rem;
		color: var(--accent-muted);
	}

	.revenue-math {
		background: rgba(0, 0, 0, 0.3);
		border-radius: 12px;
		padding: 1rem;
	}

	.math-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.8rem;
	}

	.math-row:last-child {
		margin-bottom: 0;
		padding-top: 0.8rem;
		border-top: 1px solid rgb(var(--accent-soft-rgb) / 0.15);
	}

	.math-row span {
		color: var(--accent-pale);
		font-size: 0.95rem;
	}

	.math-row strong {
		color: var(--accent-bright);
		font-size: 1.15rem;
		font-weight: 700;
	}

	.revenue-note {
		font-size: 0.95rem;
		color: var(--accent-muted);
		font-style: italic;
		margin: 0;
		padding: 1rem;
		border-left: 3px solid rgb(var(--accent-soft-rgb) / 0.3);
	}

	.closing-copy {
		margin-bottom: 1.5rem;
	}

	.confidentiality-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin: 2rem 0;
	}

	.confidentiality-card {
		position: relative;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgb(var(--accent-soft-rgb) / 0.12);
		border-radius: 20px;
		padding: 1.5rem;
		user-select: none;
		transition:
			transform 0.25s ease,
			border-color 0.25s ease;
	}

	.confidentiality-card.allowed {
		border-color: rgb(var(--accent-bright-rgb) / 0.24);
		background: rgb(var(--accent-bright-rgb) / 0.06);
	}

	.confidentiality-card.restricted {
		border-color: rgba(255, 152, 109, 0.24);
		background: rgba(255, 152, 109, 0.04);
	}

	.confidentiality-card:hover {
		transform: translateY(-2px);
	}

	.confidentiality-card.allowed:hover {
		border-color: rgb(var(--accent-bright-rgb) / 0.4);
	}

	.confidentiality-card.restricted:hover {
		border-color: rgba(255, 152, 109, 0.4);
	}

	.confidentiality-header {
		margin-bottom: 1.2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid rgb(var(--accent-soft-rgb) / 0.15);
	}

	.confidentiality-card.allowed .confidentiality-header {
		border-bottom-color: rgb(var(--accent-bright-rgb) / 0.24);
	}

	.confidentiality-card.restricted .confidentiality-header {
		border-bottom-color: rgba(255, 152, 109, 0.24);
	}

	.confidentiality-header h3 {
		margin: 0;
		font-size: 1.2rem;
	}

	.confidentiality-card.allowed .confidentiality-header h3 {
		color: var(--accent-bright);
	}

	.confidentiality-card.restricted .confidentiality-header h3 {
		color: #ff986d;
	}

	.confidentiality-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.confidentiality-list li {
		font-size: 0.95rem;
		color: var(--accent-pale);
		line-height: 1.6;
	}

	.confidentiality-list li strong {
		color: #eaf7ff;
		display: block;
		margin-bottom: 0.3rem;
	}

	.confidentiality-exception {
		background: rgb(var(--accent-rgb) / 0.08);
		border: 1px solid rgb(var(--accent-soft-rgb) / 0.18);
		border-radius: 20px;
		padding: 1.5rem;
		margin-top: 2rem;
	}

	.confidentiality-exception h3 {
		margin-top: 0;
		color: var(--accent-soft);
	}

	.confidentiality-exception strong {
		color: var(--accent-bright);
		font-weight: 700;
	}

	@media (max-width: 768px) {
		.teaser-links {
			justify-content: center;
		}

		h1 {
			font-size: clamp(1.8rem, 3vw, 3rem);
			max-width: none;
		}

		.timeline-grid,
		.advantage-grid,
		.strategy-grid,
		.revenue-examples,
		.prerequisite-content,
		.confidentiality-grid {
			grid-template-columns: 1fr;
		}
	}

	#math {
		scroll-margin-top: 80px;
	}
</style>
