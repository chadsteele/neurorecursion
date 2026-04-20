<script>
	import Consent from "$lib/Consent.js"
	import {
		getCurrentFormPath,
		handleLocalFormNavigation,
		saveNetlifySuccessContext,
	} from "$lib/netlifySuccess.js"
	import {onMount} from "svelte"
	import PageBackground from "$lib/PageBackground.svelte"

	let formData = $state({
		signupData: {
			name: "",
			email: "",
			message: "",
			conditions: {},
		},
		consent: {},
		signature: {
			fullName: "",
			birthdate: "",
		},
	})

	let errors = $state({
		consent: "",
		signature: "",
	})

	let touched = $state({
		consent: false,
		signature: false,
	})
	let isSubmitting = $state(false)

	const successAction = "/success"
	const selectedSignupConditions = $derived(
		Object.keys(formData.signupData.conditions || {})
			.filter((key) => formData.signupData.conditions[key])
			.join(", "),
	)

	onMount(() => {
		// Load signup form data from localStorage
		const savedData = localStorage.getItem("signupFormData")
		if (savedData) {
			try {
				const parsed = JSON.parse(savedData)
				formData.signupData = parsed
				// Pre-fill signature name if available
				if (parsed.name) {
					formData.signature.fullName = parsed.name
				}
			} catch (e) {
				console.error("Failed to parse localStorage data:", e)
			}
		}
	})

	$effect(() => {
		if (touched.consent) {
			validateConsent()
		}
	})

	$effect(() => {
		if (touched.signature) {
			validateSignature()
		}
	})

	function validateConsent() {
		const allAgreed = Consent.every(
			(agreement) => formData.consent[agreement.id],
		)
		if (!allAgreed) {
			errors.consent = "You must agree to all terms to proceed"
		} else {
			errors.consent = ""
		}
	}

	function validateSignature() {
		if (!formData.signature.fullName.trim()) {
			errors.signature =
				"Please enter your full name for digital signature"
		} else if (!formData.signature.birthdate.trim()) {
			errors.signature =
				"Please enter your birthdate for digital signature"
		} else {
			const birthDate = new Date(formData.signature.birthdate)
			const today = new Date()
			let age = today.getFullYear() - birthDate.getFullYear()
			const monthDiff = today.getMonth() - birthDate.getMonth()
			if (
				monthDiff < 0 ||
				(monthDiff === 0 && today.getDate() < birthDate.getDate())
			) {
				age--
			}
			if (age < 18) {
				errors.signature = "You must be at least 18 years old"
			} else {
				errors.signature = ""
			}
		}
	}

	function handleConsentBlur() {
		touched.consent = true
		validateConsent()
	}

	function handleSignatureBlur() {
		touched.signature = true
		validateSignature()
	}

	async function handleSubmit(e) {
		if (isSubmitting) {
			e.preventDefault()
			return
		}

		// Validate all fields before submission
		touched.consent = true
		touched.signature = true

		validateConsent()
		validateSignature()

		// If validation fails, prevent form submission
		if (errors.consent || errors.signature) {
			e.preventDefault()
			return
		}

		const currentFormPath = getCurrentFormPath()
		const form = e.currentTarget
		const formPathField = form.elements.namedItem("form_path")
		if (formPathField instanceof HTMLInputElement) {
			formPathField.value = currentFormPath
		}

		const signupConditionsField =
			form.elements.namedItem("signup_conditions")
		if (signupConditionsField instanceof HTMLInputElement) {
			signupConditionsField.value = selectedSignupConditions
		}

		saveNetlifySuccessContext({
			form: "consent",
			redirectTo: "/",
		})

		isSubmitting = true

		if (await handleLocalFormNavigation(e, successAction)) {
			return
		}

		// If validation passes, let the form submit naturally to Netlify Forms
		// The form element will handle the actual POST submission
	}
</script>

<PageBackground
	src="https://cri-cdn.netlify.app/neurorecursion.com/backgrounds/general-neurological-issues.png"
/>

<section class="paper container">
	<h2>Consent & Legal Agreements</h2>
	<p>
		Please review and accept all agreements below to proceed with the
		research study.
	</p>

	{#if formData.signupData.name}
		<div class="participant-info">
			<p>
				<strong>Participant Name:</strong>
				{formData.signupData.name}
			</p>
			<p><strong>Email:</strong> {formData.signupData.email}</p>
		</div>
	{/if}

	<form
		name="consent"
		method="POST"
		action={successAction}
		netlify-honeypot="bot-field"
		netlify
		onsubmit={handleSubmit}
		novalidate
		class:is-submitting={isSubmitting}
		aria-busy={isSubmitting}
	>
		<!-- Hidden field for Netlify Forms -->
		<input type="hidden" name="form-name" value="consent" />
		<input type="hidden" name="form_path" value="" />
		<input
			type="hidden"
			name="signup_name"
			value={formData.signupData.name}
		/>
		<input
			type="hidden"
			name="signup_email"
			value={formData.signupData.email}
		/>
		<input
			type="hidden"
			name="signup_message"
			value={formData.signupData.message}
		/>
		<input
			type="hidden"
			name="signup_conditions"
			value={selectedSignupConditions}
		/>
		<input
			type="hidden"
			name="signup_form_path"
			value={formData.signupData.formPath || ""}
		/>
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
		<div class="consent-section">
			<h3 class="consent-section-label">Consent & Legal Agreements</h3>
			<div class="consent-agreements">
				{#each Consent as agreement (agreement.id)}
					<div
						class="consent-agreement-card"
						role="button"
						tabindex="0"
						onclick={() => {
							formData.consent[agreement.id] =
								!formData.consent[agreement.id]
						}}
						onkeydown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault()
								formData.consent[agreement.id] =
									!formData.consent[agreement.id]
							}
						}}
					>
						<input
							type="checkbox"
							id={`consent-${agreement.id}`}
							name="consents"
							value={agreement.id}
							bind:checked={formData.consent[agreement.id]}
							required
							onblur={handleConsentBlur}
							class:error={touched.consent && errors.consent}
							class="consent-checkbox"
							onclick={(e) => e.stopPropagation()}
						/>
						<div class="consent-agreement-content">
							<label
								for={`consent-${agreement.id}`}
								class="agreement-title"
							>
								{agreement.title}
							</label>
							<p class="agreement-text">{agreement.text}</p>
						</div>
					</div>
				{/each}
			</div>
			{#if touched.consent && errors.consent}
				<div class="error-message consent-error">
					<span class="error-icon">⚠</span>
					{errors.consent}
				</div>
			{/if}
		</div>

		<div class="signature-section">
			<h3 class="signature-section-label">Digital Signature</h3>
			<p class="signature-instructions">
				To complete your agreement, please enter your full name and
				birthdate below as your digital signature.
			</p>
			<div class="signature-grid">
				<div class="form-group">
					<label for="signature-name">Full Name</label>
					<div class="input-wrapper">
						<input
							type="text"
							id="signature-name"
							name="signature_full_name"
							bind:value={formData.signature.fullName}
							placeholder="Enter your full name"
							required
							onblur={handleSignatureBlur}
							class:error={touched.signature && errors.signature}
						/>
					</div>
				</div>
				<div class="form-group">
					<label for="signature-birthdate">Birthdate</label>
					<div class="input-wrapper">
						<input
							type="date"
							id="signature-birthdate"
							name="signature_birthdate"
							bind:value={formData.signature.birthdate}
							required
							onblur={handleSignatureBlur}
							class:error={touched.signature && errors.signature}
						/>
					</div>
				</div>
			</div>
			{#if touched.signature && errors.signature}
				<div class="error-message signature-error">
					<span class="error-icon">⚠</span>
					{errors.signature}
				</div>
			{/if}
		</div>

		<div class="submit-progress" class:is-visible={isSubmitting}>
			<div class="submit-progress-bar"></div>
		</div>

		<button type="submit" class="submit-button" disabled={isSubmitting}>
			{isSubmitting ? "Submitting..." : "Accept Agreement"}
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

	.is-submitting {
		pointer-events: none;
		opacity: 0.78;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: var(--accent-soft);
		font-weight: 500;
	}

	.input-wrapper {
		position: relative;
	}

	input {
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

	input.error {
		border-color: #ff6b6b;
		background: rgba(255, 107, 107, 0.05);
	}

	input:focus {
		outline: none;
		border-color: var(--accent-500);
		box-shadow: 0 0 0 3px rgb(var(--accent-rgb) / 0.2);
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

	.consent-section {
		margin-bottom: 1.5rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgb(var(--accent-rgb) / 0.2);
	}

	.consent-section-label {
		display: block;
		margin-bottom: 1.5rem;
		color: var(--accent-soft);
		font-weight: 600;
		font-size: 1rem;
	}

	.consent-agreements {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.consent-agreement-card {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
		padding: 1rem;
		background: rgba(26, 36, 71, 0.8);
		border: 2px solid rgb(var(--accent-rgb) / 0.2);
		border-radius: 6px;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.consent-agreement-card:hover {
		background: rgba(26, 36, 71, 1);
		border-color: rgb(var(--accent-rgb) / 0.5);
		box-shadow: 0 4px 12px rgb(var(--accent-rgb) / 0.15);
	}

	.consent-agreement-card:active {
		transform: scale(0.98);
	}

	.consent-agreement-card:has(.consent-checkbox:checked) {
		background: rgb(var(--accent-rgb) / 0.15);
		border-color: rgb(var(--accent-rgb) / 0.6);
	}

	.consent-agreement-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}

	.agreement-title {
		color: var(--accent-soft);
		font-weight: 600;
		cursor: pointer;
		margin: 0;
		display: block;
	}

	.agreement-text {
		color: #d0d0d0;
		font-size: 0.9rem;
		line-height: 1.5;
		margin: 0;
	}

	.consent-checkbox {
		min-width: 20px;
		width: 20px;
		height: 20px;
		margin-top: 0.25rem;
		cursor: pointer;
		accent-color: var(--accent-500);
		flex-shrink: 0;
		transition: all 0.3s ease;
	}

	.consent-checkbox.error {
		accent-color: var(--accent-500);
	}

	.consent-error {
		position: static;
		margin-top: 0.5rem;
	}

	.signature-section {
		margin-bottom: 1.5rem;
		margin-top: 2rem;
		padding: 1.5rem;
		background: rgb(var(--accent-rgb) / 0.08);
		border: 2px solid rgb(var(--accent-rgb) / 0.3);
		border-radius: 6px;
	}

	.signature-section-label {
		display: block;
		margin-bottom: 0.75rem;
		color: var(--accent-soft);
		font-weight: 600;
		font-size: 1rem;
	}

	.signature-instructions {
		color: #d0d0d0;
		font-size: 0.95rem;
		margin: 0 0 1rem 0;
		line-height: 1.5;
	}

	.signature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.signature-grid .form-group {
		margin-bottom: 0;
	}

	.signature-error {
		position: static;
		margin-top: 0.5rem;
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
		background: linear-gradient(90deg, var(--accent-500), #9dd8ff);
		animation: submitProgress 1.1s ease-in-out infinite;
	}

	.submit-button {
		background: linear-gradient(135deg, var(--accent-500), #2e7caf);
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
		box-shadow: 0 4px 12px rgb(var(--accent-rgb) / 0.3);
		transform: translateY(-2px);
	}

	.submit-button:active {
		transform: translateY(0);
		box-shadow: 0 2px 6px rgb(var(--accent-rgb) / 0.2);
	}

	.participant-info {
		background: rgb(var(--accent-rgb) / 0.08);
		border: 2px solid rgb(var(--accent-rgb) / 0.3);
		border-radius: 6px;
		padding: 1rem 1.5rem;
		margin: 1.5rem 0;
	}

	.participant-info p {
		color: #d0d0d0;
		font-size: 0.95rem;
		margin: 0.5rem 0;
		line-height: 1.5;
	}

	.participant-info strong {
		color: var(--accent-soft);
		font-weight: 600;
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
