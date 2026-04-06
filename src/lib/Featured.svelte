<section class="main-section">
	<h2>Featured Sections</h2>
	<div class="grid-section">
		<div class="card">
			<h3>Research</h3>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
				eiusmod tempor incididunt ut labore et dolore magna aliqua.
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
				Duis aute irure dolor in reprehenderit in voluptate velit esse
				cillum dolore eu fugiat nulla pariatur excepteur.
			</p>
		</div>
	</div>
</section>

<style>
	.grid-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-top: 1.5rem;
	}

	.card {
		background: rgba(50, 50, 70, 0.6);
		border: 1px solid rgba(74, 159, 216, 0.3);
		border-radius: 6px;
		padding: 1.5rem;
		transition: all 0.3s ease;
	}

	.card:hover {
		background: rgba(60, 60, 85, 0.8);
		border-color: rgba(74, 159, 216, 0.6);
		transform: translateY(-4px);
		box-shadow: 0 8px 16px rgba(74, 159, 216, 0.2);
	}

	.card h3 {
		color: #4a9fd8;
		font-size: 1.3rem;
		margin-bottom: 0.75rem;
		margin-top: 0;
	}

	.card p {
		color: #d0d0d0;
		font-size: 0.95rem;
		line-height: 1.6;
		margin: 0;
	}
</style>
