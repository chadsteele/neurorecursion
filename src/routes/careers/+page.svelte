<script>
	import {goto} from "$app/navigation"
	import Parallax from "$lib/Parallax.svelte"

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
		if (!formData.website.trim()) {
			errors.website = ""
			return
		}
		try {
			new URL(formData.website)
			errors.website = ""
		} catch {
			errors.website = "Please enter a valid URL"
		}
	}

	function validateMessage() {
		if (!formData.message.trim()) {
			errors.message = "Message is required"
			return
		}
		// Check for HTML tags
		if (/<[^>]*>/g.test(formData.message)) {
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

	async function handleFormSubmit(event) {
		event.preventDefault()

		if (!validateBeforeSubmit()) {
			return
		}

		// Prepare form data for submission
		const form = event.target
		const formDataObj = new FormData(form)

		try {
			// Submit to Netlify Forms via POST
			const response = await fetch("/careers", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams(formDataObj).toString(),
			})

			if (response.ok) {
				// Redirect after successful submission
				setTimeout(() => {
					window.location.href = "/success?redirectTo=/"
				}, 500)
			} else {
				alert(
					"There was an error submitting the form. Please try again.",
				)
			}
		} catch (error) {
			console.error("Form submission error:", error)
			alert("There was an error submitting the form. Please try again.")
		}
	}

	function handleCancel() {
		goto("/")
	}
</script>

<Parallax background="/backgrounds/children.jpg">
	<section class="paper container">
		<div class="header-flex">
			<img
				src="/logo.png"
				alt="Neuro Recursion Institute"
				class="float-logo"
			/>
			<div>
				<h2>Careers</h2>
				<p>
					We're always looking for talented people to join our team.
					If you're passionate about neuroscience research and
					clinical innovation, we'd love to hear from you.
				</p>

				<p>
					<strong>Why Join Us?</strong><br />
					We offer a fully remote work environment with generous benefits
					including competitive compensation, flexible scheduling, and
					professional development opportunities. We are an equal opportunity
					employer committed to building a diverse and inclusive team that
					reflects the communities we serve.
				</p>

				<p>
					If you're interested in becoming a certified practitioner of
					our protocol or joining our mission to advance neuroscience
					research, please reach out to discuss opportunities and how
					to get involved in our work.
				</p>

				<div class="social-links">
					<a
						href="https://www.linkedin.com/company/neuro-recursion-institute"
						target="_blank"
						rel="noopener noreferrer"
						class="social-link"
						title="Follow us on LinkedIn"
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="currentColor"
							aria-label="LinkedIn"
						>
							<path
								d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.924 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"
							/>
						</svg>
						Connect on LinkedIn
					</a>
				</div>
			</div>
		</div>

		<form
			method="POST"
			netlify-honeypot="bot-field"
			netlify
			onsubmit={handleFormSubmit}
		>
			<!-- Hidden field for Netlify Forms -->
			<input type="hidden" name="form-name" value="careers" />
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
				<button
					type="button"
					class="cancel-button"
					onclick={handleCancel}
				>
					Cancel
				</button>
			</div>
		</form>
	</section>
</Parallax>

<style>
	.header-flex {
		display: flex;
		align-items: flex-start;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	@media (max-width: 599px) {
		.header-flex {
			flex-direction: column;
			align-items: center;
		}

		.float-logo {
			width: 100%;
			min-width: unset;
			max-width: 300px;
		}

		.header-flex > div {
			width: 100%;
		}
	}

	.float-logo {
		width: 30%;
		height: auto;
		border-radius: 8px;
		min-width: 300px;
	}

	h2 {
		color: #4a9fd8;
		font-size: 1.8rem;
		margin-bottom: 1rem;
		margin-top: 0;
	}

	p {
		color: #d0d0d0;
		line-height: 1.6;
	}

	.social-links {
		display: flex;
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

	.social-link svg {
		width: 24px;
		height: 24px;
		transition: transform 0.3s ease;
	}

	.social-link:hover svg {
		transform: scale(1.1);
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

	input:focus,
	textarea:focus {
		outline: none;
		border-color: #4a9fd8;
		box-shadow: 0 0 0 3px rgba(74, 159, 216, 0.1);
	}

	input.error,
	textarea.error {
		border-color: #ff6b6b;
		background: rgba(255, 107, 107, 0.05);
	}

	textarea {
		resize: vertical;
		min-height: 120px;
	}

	.error-message {
		color: #ff6b6b;
		font-size: 0.875rem;
		margin-top: 0.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.error-icon {
		font-size: 1rem;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.submit-button {
		padding: 0.875rem;
		background: #4a9fd8;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.submit-button:hover {
		background: #357ba8;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(74, 159, 216, 0.3);
	}

	.submit-button:active {
		transform: translateY(0);
	}

	.cancel-button {
		padding: 0.875rem;
		background: transparent;
		color: #a0d8ff;
		border: 2px solid #2b3a54;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.cancel-button:hover {
		background: rgba(74, 159, 216, 0.1);
		border-color: #4a9fd8;
		transform: translateY(-2px);
	}

	.cancel-button:active {
		transform: translateY(0);
	}

	.hidden {
		display: none !important;
		position: absolute !important;
		visibility: hidden !important;
		height: 0 !important;
		width: 0 !important;
		overflow: hidden !important;
	}
</style>
