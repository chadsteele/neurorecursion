<script>
	let {...props} = $props()
</script>

<div id="about"></div>
<section {...props}>
	<h1>Join our clinical trials</h1>
	<p>
		<img
			src="/logo.png"
			alt="Neuro Recursion Institute"
			class="float-logo"
		/>
		The Neuro Recursion Institute (<strong>NRI</strong>) studies the
		neurological feedback loops that drive chronic anxiety and motor urgency
		in neurodivergent populations. At the core of many neurodivergent
		conditions, such as, but not limited to Tourette Syndrome, Stuttering,
		ADHD, OCD, and many phobias is a phenomenon of pathological signaling
		within the Cortico-Striato-Thalamo-Cortical (CSTC) circuits. When these
		inhibitory filters fail, a "premonitory urge" triggers a recursive loop
		where the brain's output constantly re-feeds as a new, amplified input.
		Our protocol focuses on interrupting these self-perpetuating cycles,
		providing patients with a neurological "off-ramp" that de-escalates the
		recursive activity before it manifests as a physical tic, seizure, or a
		panic response.
	</p>

	<p>
		Research indicates that neurodivergence often involves a distinct
		processing of dopamine and sensory information within the basal ganglia,
		leading to what is frequently described as a state of "hyper-arousal."
		This heightened state of recursive anxiety not only increases the
		frequency of symptoms but also their intensity, as the limbic system
		becomes trapped in a persistent threat-detection mode. By leveraging
		targeted neuroplasticity, the NRI method aims to strengthen the brain's
		natural lateral inhibition. This process effectively "rewires" the
		pathway, decreasing the signal-to-noise ratio in the brain and allowing
		the nervous system to return to a state of homeostasis.
	</p>

	<p>
		The efficacy of this approach is grounded in translational neuroscience
		and the study of re-entrant signaling. Peer-reviewed studies on
		non-invasive neuromodulation and habit reversal have shown that focused,
		high-state interventions can significantly reduce symptom severity by
		disrupting dysfunctional loops between the amygdala and the motor
		cortex. By participating in our research, patients contribute to a
		growing body of evidence that neurodivergent symptoms are not static;
		rather, they are dynamic processes that can be modulated through
		precise, evidence-based neuroplastic training.
	</p>
	<p>
		We are currently enrolling patients for our clinical trial. If you or
		someone you know could benefit from our research, please contact us to
		learn more about eligibility and how to participate.
	</p>

	<p>
		Sign up to join a clinical study designed to inhibit limbic loop
		frequency and intensity, providing relief from chronic anxiety and motor
		urgency through targeted neuroplasticity. This research focuses on
		disrupting dysfunctional limbic loops between the limbic system and the
		amygdala to break the cycle of recursive anxiety and motor urgency. The
		protocol is non-invasive, involves no pharmacological intervention, it
		is applied neuroscience, no hypnosis, no psycho therapy, and often makes
		a profound difference in one 30 minute session. More sessions are often
		unnecessary, but available according to your schedule.
	</p>
	<p class="button-container">
		<button
			class="submit-btn"
			on:click={() => {
				window.location.hash = "signup"
			}}>Sign up</button
		>
	</p>
	<p>This could be your breakthrough!</p>
</section>

<style>
	h2 {
		color: #4a9fd8;
		font-size: 1.8rem;
		margin-bottom: 1rem;
		margin-top: 0;
	}

	p {
		margin-top: 0.75rem;
		margin-bottom: 0.75rem;
		color: #e8e8e8;
		font-size: 1.02rem;
		line-height: 1.75;
	}

	.button-container {
		text-align: center;
		margin: 1.5rem 0;
	}
</style>
