<script>
	import {browser} from "$app/environment"
	import {goto} from "$app/navigation"
	import {page} from "$app/stores"
	import {
		clearNetlifySuccessContext,
		readNetlifySuccessContext,
	} from "$lib/netlifySuccess.js"
	import {onMount} from "svelte"

	let countdown = $state(5)
	let CheckCircleIcon = $state(null)
	let redirectTo = $state("/")
	let formType = $state("")

	onMount(() => {
		const storedContext = readNetlifySuccessContext()
		redirectTo =
			$page.url.searchParams.get("redirectTo") ||
			storedContext.redirectTo ||
			"/"
		formType =
			$page.url.searchParams.get("form") || storedContext.form || ""
		clearNetlifySuccessContext()
	})

	const successContent = $derived.by(() => {
		switch (formType) {
			case "careers":
				return {
					title: "Application Received",
					message:
						"Your application has been successfully submitted.",
					detail: "We've received your information and will review your application.",
					followUp: "You'll hear from us soon if there is a fit.",
				}
			case "marketplace":
				return {
					title: "Order Request Received",
					message:
						"Your order request has been successfully submitted.",
					detail: "We've received your product selections and contact information.",
					followUp:
						"We'll follow up with pricing, availability, and next steps.",
				}
			case "consent":
				return {
					title: "Agreement Received",
					message: "Your agreement has been successfully submitted.",
					detail: "We've received your consent and digital signature.",
					followUp: "We'll use this to move your next steps forward.",
				}
			case "signup":
				return {
					title: "Thank You!",
					message: "Your form has been successfully submitted.",
					detail: "We've received your information and will review your application.",
					followUp: "You'll hear from us soon with next steps.",
				}
			default:
				return {
					title: "Thank You!",
					message: "Your form has been successfully submitted.",
					detail: "We've received your information.",
					followUp: "We'll be in touch if follow-up is needed.",
				}
		}
	})

	$effect(() => {
		import("lucide-svelte").then((module) => {
			CheckCircleIcon = module.CheckCircle2
		})
	})

	$effect(() => {
		const interval = setInterval(() => {
			countdown--
			if (countdown === 0) {
				goto(redirectTo)
			}
		}, 1000)

		return () => clearInterval(interval)
	})
</script>

<div class="success-container">
	<div class="success-card">
		<div class="success-icon">
			{#if CheckCircleIcon}
				<CheckCircleIcon size={48} strokeWidth={2} />
			{/if}
		</div>
		<h1>{successContent.title}</h1>
		<p>{successContent.message}</p>
		<p>{successContent.detail}</p>
		<p>{successContent.followUp}</p>

		<div class="redirect-notice">
			Redirecting in <span class="countdown">{countdown}</span>s...
		</div>
		<button
			class="return-now"
			type="button"
			onclick={() => goto(redirectTo)}
		>
			Return now
		</button>
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

	.success-icon {
		display: flex;
		justify-content: center;
		margin-bottom: 1.5rem;
		animation: scaleIn 0.6s ease-in-out;
		color: #4a9fd8;
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

	.return-now {
		margin-top: 1rem;
		padding: 0.8rem 1.4rem;
		border: 1px solid rgba(74, 159, 216, 0.45);
		border-radius: 999px;
		background: rgba(74, 159, 216, 0.14);
		color: #f4f8ff;
		font-size: 0.95rem;
		font-weight: 600;
		letter-spacing: 0.01em;
		cursor: pointer;
		transition:
			transform 0.18s ease,
			background 0.18s ease,
			border-color 0.18s ease;
	}

	.return-now:hover {
		transform: translateY(-1px);
		background: rgba(74, 159, 216, 0.22);
		border-color: rgba(74, 159, 216, 0.62);
	}

	.return-now:focus-visible {
		outline: 2px solid rgba(74, 159, 216, 0.75);
		outline-offset: 3px;
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

	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
