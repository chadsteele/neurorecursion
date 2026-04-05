<script>
	import {onMount} from "svelte"
	import backgroundsList from "$lib/backgrounds.json"
	import Partners from "$lib/Partners.svelte"

	let formData = $state({
		name: "",
		email: "",
		message: "",
	})

	let showSkeleton = $state(true)
	let submitted = $state(false)

	function handleSubmit(e) {
		e.preventDefault()
		submitted = true
		setTimeout(() => {
			showSkeleton = false
		}, 2000)
	}

	function toggleSkeleton() {
		showSkeleton = !showSkeleton
	}

	onMount(() => {
		if (!Array.isArray(backgroundsList) || backgroundsList.length === 0)
			return

		// Shuffle the images array
		const shuffled = [...backgroundsList].sort(() => Math.random() - 0.5)

		// Assign unique backgrounds to each parallax section
		const parallaxSections = document.querySelectorAll(
			".main-section.parallax-section",
		)

		parallaxSections.forEach((section, index) => {
			const imageIndex = index % shuffled.length
			const imagePath = `/backgrounds/${shuffled[imageIndex]}`
			section.style.backgroundImage = `url("${imagePath}")`
		})
	})
</script>

<div class="container">
	<!-- Main Content Section -->
	<section class="main-section parallax-section">
		<h2>About the Neuro Recursion Institute</h2>
		<p>
			<img
				src="/logo.png"
				alt="Neuro Recursion Institute"
				class="float-logo"
			/>
			The Neuro Recursion Institute (NRI) provides a specialized clinical approach
			to managing the neurological feedback loops that drive chronic anxiety
			and motor urgency in neurodivergent populations. At the core of many
			neurodivergent conditions, such as, but not limited to Tourette Syndrome,
			Stuttering, ADHD, OCD, and many phobias is a phenomenon of pathological
			signaling within the Cortico-Striato-Thalamo-Cortical (CSTC) circuits.
			When these inhibitory filters fail, a "premonitory urge" triggers a recursive
			loop where the brain's output constantly re-feeds as a new, amplified
			input. Our protocol focuses on interrupting these self-perpetuating cycles,
			providing patients with a neurological "off-ramp" that de-escalates the
			recursive activity before it manifests as a physical tic or a panic response.
		</p>

		<p>
			Research indicates that neurodivergence often involves a distinct
			processing of dopamine and sensory information within the basal
			ganglia, leading to what is frequently described as a state of
			"hyper-arousal." This heightened state of recursive anxiety not only
			increases the frequency of symptoms but also their intensity, as the
			limbic system becomes trapped in a persistent threat-detection mode.
			By leveraging targeted neuroplasticity, the NRI method aims to
			strengthen the brain’s natural lateral inhibition. This process
			effectively "rewires" the pathway, decreasing the signal-to-noise
			ratio in the brain and allowing the nervous system to return to a
			state of homeostasis.
		</p>

		<p>
			The efficacy of this approach is grounded in translational
			neuroscience and the study of re-entrant signaling. Peer-reviewed
			studies on non-invasive neuromodulation and habit reversal have
			shown that focused, high-state interventions can significantly
			reduce symptom severity by disrupting dysfunctional loops between
			the amygdala and the motor cortex. By participating in our research,
			patients contribute to a growing body of evidence that
			neurodivergent symptoms are not static; rather, they are dynamic
			processes that can be modulated through precise, evidence-based
			neuroplastic training.
		</p>
		<p>
			We are currently enrolling patients for our clinical trial. If you
			or someone you know could benefit from our research, please contact
			us to learn more about eligibility and how to participate.
		</p>
		<p class="button-container">
			<button class="submit-btn">Sign up</button>
		</p>

		<div class="references">
			<h3>Scientific References</h3>
			<p>
				Our work is grounded in the pioneering research and
				computational models developed by the world’s leading
				neurological institutions.
			</p>
			<ul>
				<li>
					<strong>University of California, Berkeley</strong> - Helen Wills
					Neuroscience Institute and Department of Neurobiology; local
					research leaders in computational neuroscience, neuroplasticity,
					and circuit-level investigation of motor control and learning
				</li>
				<li>
					<strong>MIT</strong> - Brain and Cognitive Sciences Division
					and McGovern Institute for Brain Research; pioneering work in
					neuroplasticity and neuromodulation
				</li>
				<li>
					<strong>Stanford University</strong> - Department of Neurobiology;
					leading research on neural circuits, habit formation, and therapeutic
					neurotechnology
				</li>
				<li>
					<strong>University of Cambridge</strong> - Department of Psychology;
					advanced research in neurodevelopmental disorders and cognitive
					neuroscience
				</li>
				<li>
					<strong>Max Planck Institute for Brain Research</strong> (Frankfurt,
					Germany) - Cutting-edge neurobiological research on brain connectivity
					and learning mechanisms
				</li>
				<li>
					<strong>ETH Zurich</strong> (Switzerland) - Institute for Neuroinformatics
					and Brain Research Institute; world-leading research in computational
					neuroscience, neural circuits, and neuromorphic systems relevant
					to understanding recursive neural dynamics
				</li>
				<li>
					<strong>University of Tokyo</strong> - Institute of Medical Science;
					pioneering non-invasive neuromodulation and brain-computer interface
					research
				</li>
			</ul>
		</div>
	</section>

	<!-- Partners Section -->
	<Partners />

	<!-- Skeleton Loader -->
	<section class="main-section">
		<h2>Data Loading Example</h2>
		<button class="toggle-skeleton" onclick={toggleSkeleton}>
			{showSkeleton ? "Hide" : "Show"} Skeleton
		</button>
		{#if showSkeleton}
			<div class="skeleton"></div>
		{:else}
			<div class="skeleton disabled"></div>
		{/if}
	</section>

	<!-- Form Section -->
	<section class="main-section parallax-section">
		<h2>Contact Form</h2>
		<form onsubmit={handleSubmit}>
			<div class="form-group">
				<label for="name">Name</label>
				<input
					type="text"
					id="name"
					bind:value={formData.name}
					placeholder="Enter your full name"
					required
				/>
			</div>

			<div class="form-group">
				<label for="email">Email</label>
				<input
					type="email"
					id="email"
					bind:value={formData.email}
					placeholder="Enter your email address"
					required
				/>
			</div>

			<div class="form-group">
				<label for="message">Message</label>
				<textarea
					id="message"
					bind:value={formData.message}
					placeholder="Enter your message here..."
					required
				></textarea>
			</div>

			<button type="submit" class="submit-btn">Submit</button>
			{#if submitted}
				<div class="status status-good">
					✓ Form submitted successfully!
				</div>
			{/if}
		</form>
	</section>

	<!-- Alerts Section -->
	<section class="main-section">
		<h2>Messages & Alerts</h2>

		<div class="alerts-grid">
			<div class="alert alert-success">
				<div class="alert-title">✓ Success</div>
				<div class="alert-message">
					Your operation completed successfully. All systems are
					functioning normally.
				</div>
				<span class="status status-good">Good to Go</span>
			</div>

			<div class="alert alert-error">
				<div class="alert-title">✕ Error</div>
				<div class="alert-message">
					An error occurred during the process. Please check your
					input and try again.
				</div>
				<span class="status status-bad">Action Required</span>
			</div>

			<div class="alert alert-warning">
				<div class="alert-title">⚠ Warning</div>
				<div class="alert-message">
					This action may have unintended consequences. Please proceed
					with caution.
				</div>
				<span class="status status-warning">Proceed Carefully</span>
			</div>

			<div class="alert alert-info">
				<div class="alert-title">ℹ Information</div>
				<div class="alert-message">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit sed
					do eiusmod tempor.
				</div>
				<span class="status" style="background: #4a9fd8; color: white;"
					>Learn More</span
				>
			</div>
		</div>
	</section>

	<!-- Content Cards -->
	<section class="main-section parallax-section">
		<h2>Featured Sections</h2>
		<div class="grid-section">
			<div class="card">
				<h3>Research</h3>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
					do eiusmod tempor incididunt ut labore et dolore magna
					aliqua.
				</p>
			</div>

			<div class="card">
				<h3>Innovation</h3>
				<p>
					Ut enim ad minim veniam, quis nostrud exercitation ullamco
					laboris nisi ut aliquip ex ea commodo consequat.
				</p>
			</div>

			<div class="card">
				<h3>Education</h3>
				<p>
					Duis aute irure dolor in reprehenderit in voluptate velit
					esse cillum dolore eu fugiat nulla pariatur excepteur.
				</p>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="footer">
		<p>
			&copy; {new Date().getFullYear()} Neuro Recursion Institute. All rights
			reserved.
		</p>
		<p style="font-size: 0.9rem; margin-top: 0.5rem;">
			2120 University Ave, Berkeley, CA 94704, United States
		</p>
	</footer>
</div>

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		background: linear-gradient(
			135deg,
			#0a0e27 0%,
			#1a2447 50%,
			#0f1829 100%
		);
		color: #f0f0f0;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			"Helvetica Neue", Arial, sans-serif;
		line-height: 1.8;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.main-section {
		margin-bottom: 4rem;
		padding: 2rem;
		background: rgba(30, 90, 150, 0.1);
		border-left: 4px solid #4a9fd8;
		border-radius: 8px;
		position: relative;
	}
	.main-section p {
		margin-top: 0.75rem;
		margin-bottom: 0.75rem;
		color: #e8e8e8;
		font-size: 1.02rem;
		line-height: 1.75;
	}

	.main-section.parallax-section {
		padding: 6rem 2rem;
		background-attachment: fixed;
		background-position: center top;
		background-size: cover;
		background-repeat: no-repeat;
		background-color: rgba(10, 14, 39, 0.85);
		background-blend-mode: multiply;
		border-left: none;
		margin-left: calc(-50vw + 50%);
		margin-right: calc(-50vw + 50%);
		margin-bottom: 4rem;
		width: 100vw;
		min-height: 60vh;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	.main-section.parallax-section > * {
		position: relative;
		z-index: 1;
	}

	.main-section.parallax-section > h2,
	.main-section.parallax-section > p,
	.main-section.parallax-section > form,
	.main-section.parallax-section > div {
		max-width: 1200px;
		margin-left: auto;
		margin-right: auto;
	}

	h2 {
		color: #4a9fd8;
		font-size: 1.8rem;
		margin-bottom: 1rem;
		margin-top: 0;
	}

	h3 {
		color: #4a9fd8;
		font-size: 1.4rem;
		margin-bottom: 1rem;
		margin-top: 1.5rem;
	}

	.references {
		padding: 1.5rem;
		background: rgba(20, 40, 80, 0.3);
		border-left: 4px solid #4a9fd8;
		border-radius: 6px;
		margin-top: 2rem;
	}

	.references h3 {
		margin-top: 0;
		margin-bottom: 1.25rem;
	}

	.references ul {
		list-style: none;
		padding-left: 0;
	}

	.references li {
		margin-bottom: 1rem;
		padding-left: 1.5rem;
		position: relative;
		line-height: 1.7;
		color: #e8e8e8;
		font-size: 0.98rem;
	}

	.references li:before {
		content: "◆";
		position: absolute;
		left: 0;
		color: #4a9fd8;
		font-size: 0.8rem;
	}

	.lorem-text {
		color: #e8e8e8;
		line-height: 1.8;
		margin-bottom: 1.5rem;
		font-size: 1.02rem;
	}

	.skeleton {
		width: 100%;
		height: 300px;
		background: linear-gradient(
			90deg,
			#1a2447 0%,
			#2b3a54 50%,
			#1a2447 100%
		);
		background-size: 200% 100%;
		animation: shimmer 2s infinite;
		border-radius: 8px;
		margin: 2rem 0;
		border: 2px solid #2b7bc8;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	.skeleton.disabled {
		animation: none;
		background: #333;
	}

	button {
		transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		position: relative;
		overflow: hidden;
	}

	button:active {
		transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
	}

	button:focus-visible {
		outline: 2px solid #4a9fd8;
		outline-offset: 2px;
	}

	.button-container {
		text-align: center;
		margin: 1.5rem 0;
	}

	.toggle-skeleton {
		background: #4a9fd8;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.95rem;
		margin-bottom: 1rem;
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.2),
			0 4px 8px rgba(74, 159, 216, 0.15);
	}

	.toggle-skeleton:hover {
		background: #2b7bc8;
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.25),
			0 8px 16px rgba(74, 159, 216, 0.35);
		transform: translateY(-2px);
	}

	.toggle-skeleton:active {
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.2),
			0 2px 4px rgba(74, 159, 216, 0.15);
		transform: translateY(0);
	}

	.form-section {
		padding: 2rem;
		background: rgba(20, 40, 80, 0.4);
		border: 1px solid #1e5a96;
		border-radius: 8px;
		margin-bottom: 4rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #a0d8ff;
		font-weight: 500;
	}

	input,
	textarea {
		width: 100%;
		padding: 0.75rem;
		background: #1a2447;
		border: 2px solid #2b3a54;
		color: #e0e0e0;
		border-radius: 6px;
		font-size: 1rem;
		font-family: inherit;
		transition: all 0.3s ease;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: #4a9fd8;
		box-shadow: 0 0 0 3px rgba(74, 159, 216, 0.2);
		background: #202844;
	}

	textarea {
		resize: vertical;
		min-height: 120px;
	}

	.submit-btn {
		background: #4a9fd8;
		color: white;
		border: none;
		padding: 0.875rem 2rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.95rem;
		font-weight: 600;
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.2),
			0 4px 8px rgba(74, 159, 216, 0.15);
	}

	.submit-btn:hover {
		background: #2b7bc8;
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.25),
			0 12px 24px rgba(74, 159, 216, 0.35);
		transform: translateY(-2px);
	}

	.submit-btn:active {
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.2),
			0 2px 4px rgba(74, 159, 216, 0.15);
		transform: translateY(0);
	}

	.alerts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 4rem;
	}

	.alert {
		padding: 1.5rem;
		border-radius: 8px;
		border-left: 4px solid;
		background-color: rgba(0, 0, 0, 0.3);
		margin-bottom: 1rem;
	}

	.alert-success {
		border-left-color: #22c55e;
		background-color: rgba(34, 197, 94, 0.1);
	}

	.alert-error {
		border-left-color: #ef4444;
		background-color: rgba(239, 68, 68, 0.1);
	}

	.alert-warning {
		border-left-color: #f97316;
		background-color: rgba(249, 115, 22, 0.1);
	}

	.alert-info {
		border-left-color: #4a9fd8;
		background-color: rgba(74, 159, 216, 0.1);
	}

	.alert-title {
		font-weight: 700;
		margin-bottom: 0.5rem;
		font-size: 1.1rem;
	}

	.alert-success .alert-title {
		color: #22c55e;
	}

	.alert-error .alert-title {
		color: #ef4444;
	}

	.alert-warning .alert-title {
		color: #f97316;
	}

	.alert-info .alert-title {
		color: #4a9fd8;
	}

	.alert-message {
		color: #e8e8e8;
		font-size: 1rem;
		line-height: 1.7;
	}

	.status {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-size: 0.85rem;
		font-weight: 600;
		margin-top: 0.5rem;
	}

	.status-good {
		background: #22c55e;
		color: white;
	}

	.status-bad {
		background: #ef4444;
		color: white;
	}

	.status-warning {
		background: #f97316;
		color: white;
	}

	.grid-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
		margin-bottom: 4rem;
	}

	.card {
		background: rgba(30, 90, 150, 0.15);
		border: 1px solid #2b7bc8;
		border-radius: 8px;
		padding: 1.5rem;
		transition: all 0.3s ease;
	}

	.card:hover {
		background: rgba(30, 90, 150, 0.25);
		box-shadow: 0 8px 24px rgba(74, 159, 216, 0.2);
		transform: translateY(-4px);
	}

	.card h3 {
		color: #a0d8ff;
		margin-bottom: 1rem;
		font-size: 1.2rem;
	}

	.card p {
		color: #e0e0e0;
		font-size: 1rem;
		line-height: 1.7;
	}

	@media (max-width: 799px) {
		.container {
			width: 90%;
			margin: 0 auto;
			padding: 1rem;
		}
	}

	@media (max-width: 399px) {
		.container {
			width: 100%;
			margin: 0;
			padding: 0.5rem;
		}
	}

	@media (max-width: 768px) {
		.main-section.parallax-section {
			background-attachment: scroll;
		}
	}

	.footer {
		text-align: center;
		padding: 2rem;
		color: #707070;
		border-top: 1px solid #1e5a96;
		margin-top: 4rem;
	}

	.float-logo {
		float: left;
		margin: 0 1.5rem 1rem 0;
		width: 25%;
		height: auto;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(74, 159, 216, 0.3);
		background: white;
		padding: 8px;
	}
</style>
