<script>
	import {onMount} from "svelte"
	import backgroundsList from "$lib/backgrounds.json"

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
		<img
			src="/logo.png"
			alt="Neuro Recursion Institute"
			class="float-logo"
		/>
		<h2>Welcome to the Institute</h2>
		<p class="lorem-text">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
			eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
			ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
			aliquip ex ea commodo consequat. Duis aute irure dolor in
			reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
			pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
			culpa qui officia deserunt mollit anim id est laborum.
		</p>
	</section>

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
		color: #e0e0e0;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			"Helvetica Neue", Arial, sans-serif;
		line-height: 1.6;
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

	.main-section.parallax-section {
		padding: 4rem 2rem;
		background-attachment: fixed;
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		background-color: rgba(10, 14, 39, 0.88);
		background-blend-mode: overlay;
		border-left: none;
		margin-left: calc(-50vw + 50%);
		margin-right: calc(-50vw + 50%);
		margin-bottom: 4rem;
		width: 100vw;
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

	.lorem-text {
		color: #d0d0d0;
		line-height: 1.8;
		margin-bottom: 1.5rem;
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

	.toggle-skeleton {
		background: #4a9fd8;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
		margin-bottom: 1rem;
		transition: all 0.3s ease;
	}

	.toggle-skeleton:hover {
		background: #2b7bc8;
		box-shadow: 0 4px 12px rgba(74, 159, 216, 0.3);
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
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(74, 159, 216, 0.2);
	}

	.submit-btn:hover {
		background: #2b7bc8;
		box-shadow: 0 6px 20px rgba(74, 159, 216, 0.4);
		transform: translateY(-2px);
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
		color: #d0d0d0;
		font-size: 0.95rem;
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
		color: #c0c0c0;
		font-size: 0.95rem;
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
		max-width: 150px;
		height: auto;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(74, 159, 216, 0.3);
		background: white;
		padding: 8px;
	}
</style>
