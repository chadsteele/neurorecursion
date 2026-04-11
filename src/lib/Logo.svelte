<script>
</script>

<div class="nav-logo">
	<a href="/">
		<img src="/brain.png" alt="Neuro Recursion" class="brain-logo" />
		<div class="nav-logo-text">
			<div>Neuro</div>
			<div>Recursion</div>
			<div>Institute</div>
		</div>
	</a>
</div>

<style>
	.nav-logo {
		flex-shrink: 0;
	}

	.nav-logo a {
		display: flex;
		align-items: center;
		text-decoration: none;
		gap: 1rem;
	}

	.nav-logo-text {
		display: flex;
		flex-direction: column;
		justify-content: left;
		gap: 0.1rem;
	}

	.nav-logo-text > div {
		line-height: 1;
		color: #4a9fd8;
		font-weight: 600;
	}

	.nav-logo-text > div:nth-child(1) {
		font-size: 0.9rem;
		letter-spacing: 0.05em;
	}

	.nav-logo-text > div:nth-child(2) {
		font-size: 1.1rem;
		letter-spacing: 0.02em;
	}

	.nav-logo-text > div:nth-child(3) {
		font-size: 0.75rem;
		color: #a0d8ff;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.brain-logo {
		width: 50px;
		height: 50px;
		object-fit: cover;
		border-radius: 50%;
		box-shadow: 0 2px 8px rgba(30, 90, 150, 0.3);
		transition: all 0.3s ease;
	}

	.brain-logo:hover {
		box-shadow: 0 4px 16px rgba(74, 159, 216, 0.4);
		transform: scale(1.05);
	}

	@media (max-width: 768px) {
		.nav-logo a {
			gap: 0.5rem;
		}

		.brain-logo {
			width: 40px;
			height: 40px;
		}

		.nav-logo-text > div:nth-child(1) {
			font-size: 0.75rem;
		}

		.nav-logo-text > div:nth-child(2) {
			font-size: 0.9rem;
		}

		.nav-logo-text > div:nth-child(3) {
			font-size: 0.65rem;
		}
	}
</style>
