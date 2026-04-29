<script>
	import {browser} from "$app/environment"
	import {goto} from "$app/navigation"
	import {getSupabaseClient, isSupabaseConfigured} from "$lib/supabaseClient.js"
	import {onMount} from "svelte"

	const EMAIL_COOLDOWN_SECONDS = 60
	const EMAIL_COOLDOWN_STORAGE_KEY = "auth:registration-email-cooldown-until"

	let formData = $state({
		email: "",
		firstName: "",
	})

	let errors = $state({
		email: "",
		firstName: "",
		submit: "",
	})

	let touched = $state({
		email: false,
		firstName: false,
	})

	let isSubmitting = $state(false)
	let successMessage = $state("")
	let cooldownRemaining = $state(0)
	let cooldownInterval = null

	function validateFirstName() {
		if (!formData.firstName.trim()) {
			errors.firstName = "First name is required"
		} else if (formData.firstName.trim().length < 2) {
			errors.firstName = "First name must be at least 2 characters"
		} else {
			errors.firstName = ""
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

	function handleFirstNameBlur() {
		touched.firstName = true
		validateFirstName()
	}

	function handleEmailBlur() {
		touched.email = true
		validateEmail()
	}

	function validateBeforeSubmit() {
		touched.firstName = true
		touched.email = true

		validateFirstName()
		validateEmail()

		return !errors.firstName && !errors.email
	}

	function cleanupCooldownInterval() {
		if (cooldownInterval) {
			clearInterval(cooldownInterval)
			cooldownInterval = null
		}
	}

	function startCooldown(seconds = EMAIL_COOLDOWN_SECONDS) {
		cleanupCooldownInterval()
		cooldownRemaining = Math.max(0, Math.floor(seconds))

		if (browser) {
			const until = Date.now() + cooldownRemaining * 1000
			localStorage.setItem(EMAIL_COOLDOWN_STORAGE_KEY, String(until))
		}

		if (cooldownRemaining === 0) return

		cooldownInterval = setInterval(() => {
			if (cooldownRemaining <= 1) {
				cooldownRemaining = 0
				cleanupCooldownInterval()
				if (browser) {
					localStorage.removeItem(EMAIL_COOLDOWN_STORAGE_KEY)
				}
				return
			}

			cooldownRemaining -= 1
		}, 1000)
	}

	function hydrateCooldown() {
		if (!browser) return

		const raw = localStorage.getItem(EMAIL_COOLDOWN_STORAGE_KEY)
		if (!raw) return

		const until = Number(raw)
		if (!Number.isFinite(until)) {
			localStorage.removeItem(EMAIL_COOLDOWN_STORAGE_KEY)
			return
		}

		const remaining = Math.ceil((until - Date.now()) / 1000)
		if (remaining > 0) {
			startCooldown(remaining)
		} else {
			localStorage.removeItem(EMAIL_COOLDOWN_STORAGE_KEY)
		}
	}

	function isRateLimitError(message) {
		const lower = (message || "").toLowerCase()
		return (
			lower.includes("rate limit") ||
			lower.includes("too many requests") ||
			lower.includes("email rate limit exceeded")
		)
	}

	onMount(() => {
		hydrateCooldown()

		return () => {
			cleanupCooldownInterval()
		}
	})

	async function handleFormSubmit(event) {
		event.preventDefault()

		if (isSubmitting) return
		if (cooldownRemaining > 0) {
			errors.submit = `Please wait ${cooldownRemaining}s before requesting another registration link.`
			return
		}
		if (!isSupabaseConfigured) {
			errors.submit =
				"Supabase is not configured. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in your environment."
			return
		}
		if (!validateBeforeSubmit()) return

		isSubmitting = true
		errors.submit = ""
		successMessage = ""

		try {
			const supabase = getSupabaseClient()
			if (!supabase) {
				errors.submit =
					"Supabase client is unavailable in this environment."
				isSubmitting = false
				return
			}
			const emailRedirectTo = `${window.location.origin}/auth/callback`

			const {error} = await supabase.auth.signInWithOtp({
				email: formData.email,
				options: {
					emailRedirectTo,
					shouldCreateUser: true,
					data: {
						first_name: formData.firstName,
					},
				},
			})

			if (error) {
				if (isRateLimitError(error.message)) {
					startCooldown(EMAIL_COOLDOWN_SECONDS)
					errors.submit =
						"Email rate limit exceeded. Please wait about a minute before trying again."
				} else {
					errors.submit =
						error.message || "Failed to send registration link"
				}
				isSubmitting = false
				return
			}

			successMessage =
				"Check your email for a secure registration link. Open it on this device to finish creating your account."

			startCooldown(EMAIL_COOLDOWN_SECONDS)

			formData = {
				email: "",
				firstName: "",
			}
			isSubmitting = false
		} catch (err) {
			errors.submit =
				err instanceof Error
					? err.message
					: "An unexpected error occurred"
			isSubmitting = false
		}
	}

	function handleCancel() {
		history.back()
	}
</script>

<div class="registration-container">
	<div class="registration-card">
		<img src="/brain.avif" alt="Neuro Recursion" class="auth-logo" />
		<h1>Create Your Account</h1>
		<p class="subtitle">Register with a secure email link</p>

		<form
			onsubmit={handleFormSubmit}
			class:is-submitting={isSubmitting}
			aria-busy={isSubmitting}
		>
			{#if errors.submit}
				<div class="error-banner">
					<span class="error-icon">⚠</span>
					<p>{errors.submit}</p>
				</div>
			{/if}

			{#if successMessage}
				<div class="success-banner">
					<span class="success-icon">✓</span>
					<p>{successMessage}</p>
				</div>
			{/if}

			<div class="form-group">
				<label for="firstName">First Name</label>
				<div class="input-wrapper">
					<input
						type="text"
						id="firstName"
						name="firstName"
						bind:value={formData.firstName}
						placeholder="Enter your first name"
						required
						onblur={handleFirstNameBlur}
						class:error={touched.firstName && errors.firstName}
						disabled={isSubmitting}
					/>
					{#if touched.firstName && errors.firstName}
						<div class="error-message">
							<span class="error-icon">⚠</span>
							{errors.firstName}
						</div>
					{/if}
				</div>
			</div>

			<div class="form-group">
				<label for="email">Email Address</label>
				<div class="input-wrapper">
					<input
						type="email"
						id="email"
						name="email"
						bind:value={formData.email}
						placeholder="Enter your email"
						required
						onblur={handleEmailBlur}
						class:error={touched.email && errors.email}
						disabled={isSubmitting}
					/>
					{#if touched.email && errors.email}
						<div class="error-message">
							<span class="error-icon">⚠</span>
							{errors.email}
						</div>
					{/if}
				</div>
			</div>

			<div class="submit-progress" class:is-visible={isSubmitting}>
				<div class="submit-progress-bar"></div>
			</div>

			<div class="button-group">
				<button
					type="submit"
					class="submit-button"
					disabled={isSubmitting || cooldownRemaining > 0}
				>
					{isSubmitting
						? "Sending link..."
						: cooldownRemaining > 0
							? `Retry in ${cooldownRemaining}s`
							: "Email Me a Registration Link"}
				</button>
				<button
					type="button"
					class="cancel-button"
					onclick={handleCancel}
					disabled={isSubmitting}
				>
					Back
				</button>
			</div>

			<p class="login-link">
				Already have an account? <a href="/user/login">Sign in here</a>
			</p>
		</form>
	</div>
</div>

<style>
	.registration-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.registration-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		padding: 2.5rem;
		width: 100%;
		max-width: 420px;
	}

	.auth-logo {
		display: block;
		width: 68px;
		height: 68px;
		object-fit: cover;
		border-radius: 50%;
		margin: 0 auto 1rem;
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
	}

	h1 {
		margin: 0 0 0.5rem 0;
		font-size: 28px;
		font-weight: 700;
		color: #1c1e21;
		text-align: center;
	}

	.subtitle {
		margin: 0 0 2rem 0;
		font-size: 14px;
		color: #65676b;
		text-align: center;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	form.is-submitting {
		opacity: 0.7;
		pointer-events: none;
	}

	.error-banner,
	.success-banner {
		padding: 12px 16px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		line-height: 1.5;
	}

	.error-banner {
		background-color: #fee;
		border: 1px solid #fcc;
		color: #c33;
	}

	.success-banner {
		background-color: #efe;
		border: 1px solid #cfc;
		color: #3c3;
	}

	.error-icon {
		font-size: 16px;
		flex-shrink: 0;
	}

	.success-icon {
		font-size: 16px;
		flex-shrink: 0;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-size: 14px;
		font-weight: 600;
		color: #1c1e21;
	}

	.input-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	input {
		padding: 12px 14px;
		border: 1px solid #ccc;
		border-radius: 6px;
		font-size: 14px;
		font-family: inherit;
		transition: all 0.2s ease;
	}

	input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	input.error {
		border-color: #ff6b6b;
		background-color: #fff5f5;
	}

	input:disabled {
		background-color: #f5f5f5;
		color: #999;
		cursor: not-allowed;
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: #c33;
		margin-top: 4px;
	}

	.submit-progress {
		height: 3px;
		background: #f0f0f0;
		border-radius: 2px;
		overflow: hidden;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.submit-progress.is-visible {
		opacity: 1;
	}

	.submit-progress-bar {
		height: 100%;
		background: linear-gradient(90deg, #667eea, #764ba2);
		animation: progress 2s ease-in-out infinite;
	}

	@keyframes progress {
		0% {
			width: 0%;
		}
		50% {
			width: 100%;
		}
		100% {
			width: 100%;
		}
	}

	.button-group {
		display: flex;
		gap: 12px;
		margin-top: 1rem;
	}

	.submit-button,
	.cancel-button {
		flex: 1;
		padding: 12px 24px;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.submit-button {
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
	}

	.submit-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
	}

	.submit-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.submit-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.cancel-button {
		background-color: #e4e6eb;
		color: #050505;
	}

	.cancel-button:hover:not(:disabled) {
		background-color: #d0d2d7;
	}

	.cancel-button:active:not(:disabled) {
		transform: scale(0.98);
	}

	.cancel-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.login-link {
		text-align: center;
		font-size: 14px;
		color: #65676b;
		margin: 1rem 0 0 0;
	}

	.login-link a {
		color: #667eea;
		text-decoration: none;
		font-weight: 600;
		transition: color 0.2s ease;
	}

	.login-link a:hover {
		color: #764ba2;
	}

	@media (max-width: 480px) {
		.registration-card {
			padding: 1.5rem;
		}

		h1 {
			font-size: 24px;
		}

		.button-group {
			flex-direction: column;
		}
	}
</style>
