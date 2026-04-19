<script>
	import ConditionGrid from "$lib/ConditionGrid.svelte"
	import {
		getCurrentFormPath,
		saveNetlifySuccessContext,
	} from "$lib/netlifySuccess.js"

	let {
		formData = {conditions: {}},
		getCondition = null,
		ConditionsMap = {},
	} = $props()
	let conditionSuggestion = $state("")
	let suggestionDebounceTimer = $state(null)

	let errors = $state({
		name: "",
		email: "",
		message: "",
	})

	let touched = $state({
		name: false,
		email: false,
		message: false,
	})
	let isSubmitting = $state(false)

	const successAction = "/consent"
	const selectedConditions = $derived(
		Object.keys(formData.conditions)
			.filter((key) => formData.conditions[key])
			.join(", "),
	)

	function validateName() {
		if (!formData.name.trim()) {
			errors.name = "Name is required"
		} else {
			errors.name = ""
		}
	}

	function validateEmail() {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!formData.email.trim()) {
			errors.email = "Email is required"
		} else if (!emailRegex.test(formData.email)) {
			errors.email = "Please enter a valid email address"
		} else {
			errors.email = ""
		}
	}

	function validateMessage() {
		if (!formData.message.trim()) {
			errors.message = ""
			return
		}
		// Check for HTML tags
		if (/<[^>]*>/g.test(formData.message)) {
			errors.message = "Please use plain text only (no HTML)"
			return
		}
		// Check for SQL syntax patterns
		if (
			/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b/i.test(
				formData.message,
			)
		) {
			errors.message = "Please use plain English only (no SQL commands)"
			return
		}
		// Check for JavaScript/code patterns
		if (
			/[{}<>()\[\]]/g.test(formData.message) &&
			formData.message.length > 20
		) {
			errors.message = "Please use plain text only (avoid code syntax)"
			return
		}
		errors.message = ""
	}

	function handleMessageBlur() {
		touched.message = true
		validateMessage()
	}

	function handleNameBlur() {
		touched.name = true
		validateName()
	}

	function handleEmailBlur() {
		touched.email = true
		validateEmail()
	}

	function selectConditionsBySuggestion(input) {
		conditionSuggestion = input

		// Clear any pending debounce timer
		if (suggestionDebounceTimer) {
			clearTimeout(suggestionDebounceTimer)
		}

		// Set a new debounce timer (1 second pause)
		suggestionDebounceTimer = setTimeout(() => {
			if (!input.trim()) {
				return
			}

			// Split input by spaces, commas, or slashes
			const words = input
				.toLowerCase()
				.split(/[\s,/_-]+/)
				.filter((w) => w.length > 0)

			// Limit selections to number of words (max)
			const maxSelections = Math.min(words.length, words.length)
			const selectedConditions = new Set()

			// For each word, find the best matching condition
			for (const word of words) {
				if (selectedConditions.size >= maxSelections) break

				const matchedCondition = getCondition(word)
				if (matchedCondition) {
					selectedConditions.add(matchedCondition.name)
				}
			}

			// Update form with selected conditions (only ADD new ones, don't clear existing)
			selectedConditions.forEach((conditionName) => {
				formData.conditions[conditionName] = true
			})
		}, 1000)
	}

	function validateBeforeSubmit() {
		// Validate all fields
		touched.name = true
		touched.email = true
		touched.message = true

		validateName()
		validateEmail()
		validateMessage()

		// Return true if no errors
		return !(errors.name || errors.email || errors.message)
	}

	function handleFormSubmit(event) {
		if (isSubmitting) {
			event.preventDefault()
			return
		}

		if (!validateBeforeSubmit()) {
			event.preventDefault()
			return
		}

		const currentFormPath = getCurrentFormPath()
		const form = event.currentTarget
		const formPathField = form.elements.namedItem("form_path")
		if (formPathField instanceof HTMLInputElement) {
			formPathField.value = currentFormPath
		}

		const conditionsField = form.elements.namedItem("conditions")
		if (conditionsField instanceof HTMLInputElement) {
			conditionsField.value = selectedConditions
		}

		localStorage.setItem(
			"signupFormData",
			JSON.stringify({
				name: formData.name,
				email: formData.email,
				message: formData.message,
				conditions: formData.conditions,
				formPath: currentFormPath,
			}),
		)

		saveNetlifySuccessContext({
			form: "signup",
			redirectTo: currentFormPath,
		})

		isSubmitting = true

		// If validation passes, let the form submit naturally to Netlify Forms
		// No preventDefault - allow browser to handle the POST
	}
</script>

<section class="paper container">
	<h2>Sign Up</h2>
	<p>This could be your breakthrough!</p>
	<p>
		Sign up to join a clinical study designed to inhibit frequency and
		intensity of neurological symptoms through targeted neuroplasticity.
		This research focuses on disrupting dysfunctional limbic loops between
		the limbic system and the amygdala to break the cycle of recursive
		anxiety and motor urgency. The protocol is non-invasive, involves no
		pharmacological intervention, it is applied neuroscience, no hypnosis,
		no psycho therapy, and often makes a profound difference in one 30
		minute session. More sessions are often unnecessary, but available
		according to your schedule.
	</p>
	<p>
		Results vary and are not guaranteed, but many patients experience
		significant relief after just one session. By participating in our
		research, you contribute to a growing body of evidence that
		neurodivergent symptoms are not static; rather, they are dynamic
		processes that can be modulated through precise, evidence-based
		neuroplastic training.
	</p>
	<p>
		If you or someone you know could benefit from our research, please
		contact us to learn more about eligibility and how to participate.
	</p>
	<p></p>
	<p></p>
	<form
		name="signup"
		method="POST"
		action={successAction}
		netlify-honeypot="bot-field"
		netlify
		onsubmit={handleFormSubmit}
		class:is-submitting={isSubmitting}
		aria-busy={isSubmitting}
	>
		<!-- Hidden field for Netlify Forms -->
		<input type="hidden" name="form-name" value="signup" />
		<input type="hidden" name="form_path" value="" />
		<input type="hidden" name="conditions" value={selectedConditions} />
		<!-- Honeypot field for spam protection -->
		<div class="hidden">
			<label for="bot-field">
				Don't fill this out if you're human:
				<input
					id="bot-field"
					type="text"
					name="bot-field"
					tabindex="-1"
				/>
			</label>
		</div>

		<div class="form-group">
			<label for="name">Name</label>
			<div class="input-wrapper">
				<input
					type="text"
					id="name"
					name="name"
					bind:value={formData.name}
					placeholder="Enter your full name"
					required
					onblur={handleNameBlur}
					class:error={touched.name && errors.name}
				/>
				{#if touched.name && errors.name}
					<div class="error-message">
						<span class="error-icon">⚠</span>
						{errors.name}
					</div>
				{/if}
			</div>
		</div>

		<div class="form-group">
			<label for="email">Email</label>
			<div class="input-wrapper">
				<input
					type="email"
					id="email"
					name="email"
					bind:value={formData.email}
					placeholder="Enter your email address"
					required
					onblur={handleEmailBlur}
					class:error={touched.email && errors.email}
				/>
				{#if touched.email && errors.email}
					<div class="error-message">
						<span class="error-icon">⚠</span>
						{errors.email}
					</div>
				{/if}
			</div>
		</div>

		<div class="conditions-section">
			<h3>Conditions & Interests</h3>
			<p>
				Describe your conditions and interests and we'll select the
				specific conditions below that best match your description. You
				can edit them manually too.
			</p>

			<input
				type="text"
				value={conditionSuggestion}
				oninput={(e) =>
					selectConditionsBySuggestion(e.currentTarget.value)}
				placeholder="e.g. anxiety, autism, adhd, ptsd, ocd, etc."
				class="suggestion-input"
			/>
			<p>
				Select all that apply. It will help us assign a mentor that
				specializes in your needs and will determine which research
				protocols are best suited to your profile. If you have a
				condition that is not listed, specify it in your message.
			</p>
			<ConditionGrid {formData} {ConditionsMap} />
		</div>

		<div class="form-group">
			<label for="message">Message (Optional)</label>
			<div class="input-wrapper">
				<textarea
					id="message"
					name="message"
					bind:value={formData.message}
					placeholder="Enter your message here... "
					onblur={handleMessageBlur}
					class:error={touched.message && errors.message}
				></textarea>
				{#if touched.message && errors.message}
					<div class="error-message">
						<span class="error-icon">⚠</span>
						{errors.message}
					</div>
				{/if}
			</div>
		</div>

		<div class="submit-progress" class:is-visible={isSubmitting}>
			<div class="submit-progress-bar"></div>
		</div>

		<button type="submit" class="submit-button" disabled={isSubmitting}>
			{isSubmitting ? "Submitting..." : "Submit"}
		</button>
	</form>
</section>

<style>
	h2 {
		color: #4a9fd8;
		font-size: 1.8rem;
		margin-bottom: 1rem;
		margin-top: 0;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group:has(.error-message) {
		margin-bottom: 2.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #a0d8ff;
		font-weight: 500;
	}

	.input-wrapper {
		position: relative;
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

	input.error,
	textarea.error {
		border-color: #ff6b6b;
		background: rgba(255, 107, 107, 0.05);
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: #4a9fd8;
		box-shadow: 0 0 0 3px rgba(74, 159, 216, 0.2);
		background: #202844;
	}

	input.error:focus {
		border-color: #ff6b6b;
		box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
		background: #202844;
	}

	.error-message {
		position: absolute;
		bottom: -1.75rem;
		left: 0;
		color: #ff6b6b;
		font-size: 0.85rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.error-icon {
		font-size: 1rem;
	}

	.conditions-section {
		margin-bottom: 1.5rem;
	}

	.suggestion-input {
		width: 100%;
		padding: 0.75rem;
		background: #1a2447;
		border: 2px solid #2b3a54;
		color: #e0e0e0;
		border-radius: 6px;
		font-size: 1rem;
		font-family: inherit;
		transition: all 0.3s ease;
		margin-bottom: 1rem;
	}

	.suggestion-input:focus {
		outline: none;
		border-color: #4a9fd8;
		box-shadow: 0 0 0 3px rgba(74, 159, 216, 0.2);
		background: #202844;
	}

	.is-submitting {
		pointer-events: none;
		opacity: 0.78;
	}

	.submit-progress {
		overflow: hidden;
		height: 0;
		margin: 0;
		border-radius: 999px;
		background: rgba(74, 159, 216, 0.12);
		border: 1px solid rgba(74, 159, 216, 0.22);
		opacity: 0;
		transition:
			height 0.2s ease,
			margin 0.2s ease,
			opacity 0.2s ease;
	}

	.submit-progress.is-visible {
		height: 0.5rem;
		margin: 1rem 0 0.85rem;
		opacity: 1;
	}

	.submit-progress-bar {
		width: 40%;
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, #4a9fd8, #9dd8ff);
		animation: submitProgress 1.1s ease-in-out infinite;
	}

	.submit-button {
		background: linear-gradient(135deg, #4a9fd8, #2e7caf);
		color: white;
		border: none;
		padding: 0.75rem 2rem;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.submit-button:disabled {
		cursor: wait;
		box-shadow: none;
		transform: none;
		filter: saturate(0.8);
	}

	.submit-button:hover {
		background: linear-gradient(135deg, #5aafed, #3d8bc4);
		box-shadow: 0 4px 12px rgba(74, 159, 216, 0.3);
		transform: translateY(-2px);
	}

	.submit-button:active {
		transform: translateY(0);
		box-shadow: 0 2px 6px rgba(74, 159, 216, 0.2);
	}

	.hidden {
		display: none !important;
		position: absolute !important;
		visibility: hidden !important;
		height: 0 !important;
		width: 0 !important;
		overflow: hidden !important;
	}

	@keyframes submitProgress {
		0% {
			transform: translateX(-115%);
		}

		100% {
			transform: translateX(260%);
		}
	}
</style>
