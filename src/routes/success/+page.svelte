<script>
	import {goto} from "$app/navigation"

	let countdown = $state(5)

	$effect(() => {
		const interval = setInterval(() => {
			countdown--
			if (countdown === 0) {
				goto("/consent")
			}
		}, 1000)

		return () => clearInterval(interval)
	})
</script>

<div class="success-container">
	<div class="success-card">
		<h1>✅ Thank You!</h1>
		<p>Your form has been successfully submitted.</p>
		<p>We've received your information and will review your application.</p>
		<p>You'll hear from us soon with next steps.</p>

		<div class="redirect-notice">
			Redirecting in <span class="countdown">{countdown}</span>s...
		</div>
	</div>
</div>

<style>
	:global(body) {
		background: linear-gradient(
			135deg,
			#0a0e27 0%,
			#1a2447 50%,
			#0f1829 100%
		);
	}

	.success-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
	}

	.success-card {
		background: rgba(70, 70, 90, 0.9);
		border-radius: 12px;
		padding: 4rem 2rem;
		max-width: 600px;
		text-align: center;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	h1 {
		color: #4a9fd8;
		font-size: 2.5rem;
		margin-bottom: 1.5rem;
		animation: fadeIn 0.6s ease-in-out;
	}

	p {
		color: #d0d0d0;
		font-size: 1.1rem;
		line-height: 1.8;
		margin: 1rem 0;
	}

	.redirect-notice {
		margin-top: 2.5rem;
		font-size: 0.95rem;
		color: #a0d8ff;
	}

	.countdown {
		font-weight: bold;
		color: #4a9fd8;
		font-size: 1.1rem;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
