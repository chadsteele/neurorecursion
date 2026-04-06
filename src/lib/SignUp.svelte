<script>
	let formData = $state({
		name: "",
		email: "",
		message: "",
	})

	let submitted = $state(false)

	function handleSubmit(e) {
		e.preventDefault()
		submitted = true
		setTimeout(() => {
			submitted = false
		}, 2000)
	}
</script>

<section class="main-section">
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
			<div class="status status-good">✓ Form submitted successfully!</div>
		{/if}
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
</style>
