<script>
	let {children} = $props()
</script>

{@render children()}

<style>
	/* Job component styles - shared across all job listings */
	:global(h1) {
		color: #4a9fd8;
		font-size: 2rem;
		margin: 0 0 1rem 0;
		font-weight: 700;
	}

	:global(.meta-info) {
		display: inline-block;
		background: rgba(74, 159, 216, 0.15);
		color: #a0d8ff;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 500;
		border: 1px solid rgba(74, 159, 216, 0.3);
		margin-bottom: 1.5rem;
	}

	:global(.job-content p) {
		color: #d0d0d0;
		margin-bottom: 1rem;
		line-height: 1.7;
	}

	:global(h2) {
		color: #4a9fd8;
		font-size: 1.4rem;
		margin-top: 2rem;
		margin-bottom: 1rem;
		font-weight: 600;
	}

	:global(.job-content ul) {
		margin: 1rem 0;
		padding-left: 1.5rem;
	}

	:global(.job-content li) {
		color: #d0d0d0;
		margin-bottom: 0.75rem;
		line-height: 1.6;
	}

	:global(.link-section) {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid rgba(74, 159, 216, 0.2);
	}
</style>
