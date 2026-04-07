<script>
	import Conditions from "./Conditions.js"

	let formData = $state({
		name: "",
		email: "",
		message: "",
		conditions: {},
	})

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

	async function handleFormSubmit(event) {
		if (!validateBeforeSubmit()) {
			event.preventDefault()
			return
		}

		// Prepare form data for submission
		const form = event.target
		const formDataObj = new FormData(form)

		// Convert conditions to comma-separated string
		const selectedConditions = Object.keys(formData.conditions)
			.filter((key) => formData.conditions[key])
			.join(", ")

		if (selectedConditions) {
			formDataObj.set("conditions", selectedConditions)
		}

		try {
			// Submit to Netlify Forms via POST
			const response = await fetch("/", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams(formDataObj).toString(),
			})

			if (response.ok) {
				// Show success and redirect after delay
				alert("Thank you! We'll be in touch soon.")
				setTimeout(() => {
					window.location.href = "/success?redirectTo=/consent"
				}, 1000)
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

	let {...props} = $props()
</script>

<div id="signup"></div>
<section {...props}>
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
		method="POST"
		netlify-honeypot="bot-field"
		data-netlify="true"
		onsubmit={handleFormSubmit}
	>
		<!-- Hidden field for Netlify Forms -->
		<input type="hidden" name="form-name" value="signup" />
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

		<div class="conditions-section">
			<h3>Conditions & Interests</h3>
			<p>
				Select all that apply. It will help us assign a mentor that
				specializes in your needs and will determine which research
				protocols are best suited to your profile. If you have a
				condition that is not listed, specify it in your message.
			</p>
			<div class="conditions-grid">
				{#each Conditions as condition (condition.name)}
					<div class="condition-card">
						<input
							type="checkbox"
							id={`condition-${condition.id}`}
							name={`conditions`}
							value={condition.name}
							bind:checked={formData.conditions[condition.name]}
							class="condition-checkbox"
						/>
						<label
							for={`condition-${condition.id}`}
							class="condition-label"
						>
							{condition.name}
						</label>
					</div>
				{/each}
			</div>
		</div>

		<button type="submit" class="submit-button">Submit</button>
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

	.conditions-section {
		margin-bottom: 1.5rem;
	}

	.conditions-label {
		display: block;
		margin-bottom: 1rem;
		color: #a0d8ff;
		font-weight: 600;
		font-size: 1rem;
	}

	.conditions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
	}

	.condition-card {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 1rem;
		background: rgba(26, 36, 71, 0.8);
		border: 2px solid rgba(74, 159, 216, 0.2);
		border-radius: 6px;
		transition: all 0.3s ease;
	}

	.condition-card:hover {
		background: rgba(26, 36, 71, 1);
		border-color: rgba(74, 159, 216, 0.5);
		box-shadow: 0 4px 12px rgba(74, 159, 216, 0.15);
	}

	.condition-checkbox {
		margin-top: 0.25rem;
		min-width: 20px;
		width: 20px;
		height: 20px;
		cursor: pointer;
		accent-color: #4a9fd8;
	}

	.condition-label {
		color: #d0d0d0;
		margin: 0;
		display: block;
		cursor: pointer;
		font-weight: 500;
	}

	.condition-card:has(.condition-checkbox:checked) {
		background: rgba(74, 159, 216, 0.15);
		border-color: rgba(74, 159, 216, 0.6);
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
</style>
