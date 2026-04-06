<script>
	import Partners from "$lib/Partners.svelte"
	import References from "$lib/References.svelte"
	import SignUp from "$lib/SignUp.svelte"

	let showSkeleton = $state(true)

	function toggleSkeleton() {
		showSkeleton = !showSkeleton
	}
</script>

<div class="container">
	<!-- Main Content Section -->
	<section class="main-section">
		<h2>About the Neuro Recursion Institute</h2>
		<p>
			<img
				src="/logo.png"
				alt="Neuro Recursion Institute"
				class="float-logo"
			/>
			The Neuro Recursion Institute (NRI) studies the neurological feedback
			loops that drive chronic anxiety and motor urgency in neurodivergent
			populations. At the core of many neurodivergent conditions, such as,
			but not limited to Tourette Syndrome, Stuttering, ADHD, OCD, and many
			phobias is a phenomenon of pathological signaling within the Cortico-Striato-Thalamo-Cortical
			(CSTC) circuits. When these inhibitory filters fail, a "premonitory urge"
			triggers a recursive loop where the brain's output constantly re-feeds
			as a new, amplified input. Our protocol focuses on interrupting these
			self-perpetuating cycles, providing patients with a neurological "off-ramp"
			that de-escalates the recursive activity before it manifests as a physical
			tic or a panic response.
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

		<p>
			Sign up to join a clinical study designed to inhibit tic frequency
			through targeted neuroplasticity. This research focuses on
			disrupting dysfunctional limbic loops between the limbic system and
			the amygdala to break the cycle of recursive anxiety and motor
			urgency. The protocol is non-invasive, involves no pharmacological
			intervention, it is applied neuroscience, no hypnosis, no psycho
			therapy, and often makes a profound difference in one 30 minute
			session. More sessions are often unnecessary, but available
			according to your schedule.
		</p>
		<p class="button-container">
			<button class="submit-btn">Sign up</button>
		</p>
		<p>This could be your breakthrough!</p>
	</section>
	<References />
	<SignUp />
	<Partners />

	<!-- Skeleton Loader -->
	<!-- <section class="main-section">
		<h2>Data Loading Example</h2>
		<button class="toggle-skeleton" onclick={toggleSkeleton}>
			{showSkeleton ? "Hide" : "Show"} Skeleton
		</button>
		{#if showSkeleton}
			<div class="skeleton"></div>
		{:else}
			<div class="skeleton disabled"></div>
		{/if}
	</section> -->

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
	<section class="main-section">
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
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
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
