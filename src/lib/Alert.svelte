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
				An error occurred during the process. Please check your input
				and try again.
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
				Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do
				eiusmod tempor.
			</div>
			<span class="status" style="background: #4a9fd8; color: white;"
				>Learn More</span
			>
		</div>
	</div>
</section>

<style>
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
		color: #e8e8e8;
		font-size: 1rem;
		line-height: 1.7;
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
</style>
