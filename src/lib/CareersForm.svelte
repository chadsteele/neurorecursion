<script>
	import {goto} from "$app/navigation"

	let {jobId = ""} = $props()

	let formData = $state({
		name: "",
		email: "",
		website: "",
		message: "",
	})

	let errors = $state({
		name: "",
		email: "",
		website: "",
		message: "",
	})

	let touched = $state({
		name: false,
		email: false,
		website: false,
		message: false,
	})

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

	function validateWebsite() {
		if (formData.website.trim()) {
			try {
				new URL(formData.website)
				errors.website = ""
			} catch {
				errors.website = "Please enter a valid URL"
			}
		} else {
			errors.website = ""
		}
	}

	function validateMessage() {
		if (!formData.message.trim()) {
			errors.message = "Message is required"
		} else if (formData.message.length < 10) {
			errors.message = "Message must be at least 10 characters"
		} else if (/<[^>]*>/g.test(formData.message)) {
			errors.message = "Please use plain text only (no HTML)"
			return
		}
		errors.message = ""
	}

	function handleNameBlur() {
		touched.name = true
		validateName()
	}

	function handleEmailBlur() {
		touched.email = true
		validateEmail()
	}

	function handleWebsiteBlur() {
		touched.website = true
		validateWebsite()
	}

	function handleMessageBlur() {
		touched.message = true
		validateMessage()
	}

	function validateBeforeSubmit() {
		touched.name = true
		touched.email = true
		touched.website = true
		touched.message = true

		validateName()
		validateEmail()
		validateWebsite()
		validateMessage()

		return !(
			errors.name ||
			errors.email ||
			errors.website ||
			errors.message
		)
	}

	function handleFormSubmit(event) {
		if (!validateBeforeSubmit()) {
			event.preventDefault()
			return
		}

		// If validation passes, let the form submit naturally to Netlify Forms
		// No preventDefault - allow browser to handle the POST
	}

	function handleCancel() {
		goto("/careers")
	}
</script>

<form
	method="POST"
	netlify-honeypot="bot-field"
	netlify
	onsubmit={handleFormSubmit}
>
	<!-- Hidden field for Netlify Forms -->
	<input type="hidden" name="form-name" value="careers" />
	<!-- Job ID field -->
	{#if jobId}
		<input type="hidden" name="job_id" value={jobId} />
	{/if}
	<!-- Honeypot field for spam protection -->
	<div class="hidden">
		<label for="bot-field">
			Don't fill this out if you're human:
			<input id="bot-field" type="text" name="bot-field" tabindex="-1" />
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

	<div class="form-group">
		<label for="website">Website/Portfolio (Optional)</label>
		<div class="input-wrapper">
			<input
				type="url"
				id="website"
				name="website"
				bind:value={formData.website}
				placeholder="https://example.com"
				onblur={handleWebsiteBlur}
				class:error={touched.website && errors.website}
			/>
			{#if touched.website && errors.website}
				<div class="error-message">
					<span class="error-icon">⚠</span>
					{errors.website}
				</div>
			{/if}
		</div>
	</div>

	<div class="form-group">
		<label for="message">Message</label>
		<div class="input-wrapper">
			<textarea
				id="message"
				name="message"
				bind:value={formData.message}
				placeholder="Tell us about yourself and why you're interested in joining our team..."
				required
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

	<div class="button-group">
		<button type="submit" class="submit-button">Submit</button>
		<button type="button" class="cancel-button" onclick={handleCancel}>
			Cancel
		</button>
	</div>
</form>

<style>
	form {
		margin: 3rem 0;
		padding: 2rem;
		background: rgba(26, 36, 71, 0.5);
		border-radius: 8px;
		border: 1px solid rgba(74, 159, 216, 0.2);
	}

	.hidden {
		display: none !important;
		position: absolute !important;
		visibility: hidden !important;
		height: 0 !important;
		width: 0 !important;
		overflow: hidden !important;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		color: #a0d8ff;
		font-weight: 500;
		margin-bottom: 0.5rem;
		font-size: 0.95rem;
	}

	.input-wrapper {
		position: relative;
	}

	input,
	textarea {
		width: 100%;
		padding: 0.75rem;
		background: rgba(43, 58, 84, 0.5);
		border: 1px solid rgba(74, 159, 216, 0.3);
		border-radius: 4px;
		color: #d0d0d0;
		font-family: inherit;
		font-size: 0.95rem;
		transition: all 0.3s ease;
	}

	input::placeholder,
	textarea::placeholder {
		color: #708090;
	}

	input:focus,
	textarea:focus {
		outline: none;
		background: rgba(43, 58, 84, 0.8);
		border-color: #4a9fd8;
		box-shadow: 0 0 0 3px rgba(74, 159, 216, 0.1);
	}

	input.error,
	textarea.error {
		border-color: #ff6b6b;
		background: rgba(255, 107, 107, 0.05);
	}

	textarea {
		min-height: 150px;
		resize: vertical;
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #ff6b6b;
		font-size: 0.85rem;
		margin-top: 0.5rem;
	}

	.error-icon {
		font-weight: bold;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		justify-content: flex-start;
	}

	button {
		padding: 0.75rem 1.5rem;
		font-size: 0.95rem;
		font-weight: 500;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.submit-button {
		background: #4a9fd8;
		color: white;
	}

	.submit-button:hover {
		background: #63b3e8;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(74, 159, 216, 0.3);
	}

	.submit-button:active {
		transform: translateY(0);
	}

	.cancel-button {
		background: rgba(74, 159, 216, 0.1);
		color: #4a9fd8;
		border: 1px solid rgba(74, 159, 216, 0.3);
	}

	.cancel-button:hover {
		background: rgba(74, 159, 216, 0.2);
		border-color: #4a9fd8;
	}

	@media (max-width: 799px) {
		form {
			padding: 1.5rem;
		}

		.button-group {
			flex-direction: column;
		}

		button {
			width: 100%;
		}
	}
</style>
