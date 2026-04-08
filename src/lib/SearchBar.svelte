<script>
	import {searchOpen, searchQuery} from "$lib/stores.js"
	import {onMount} from "svelte"
	import {browser} from "$app/environment"

	let X = $state(null)
	let ChevronLeft = $state(null)
	let ChevronRight = $state(null)

	if (browser) {
		import("lucide-svelte").then((module) => {
			X = module.X
			ChevronLeft = module.ChevronLeft
			ChevronRight = module.ChevronRight
		})
	}

	function closeSearch() {
		searchOpen.set(false)
		searchQuery.set("")
	}

	function handlePrevious() {
		// Previous result logic
	}

	function handleNext() {
		// Next result logic
	}
</script>

{#if $searchOpen}
	<div class="search-bar">
		<button
			class="search-icon-btn"
			onclick={closeSearch}
			aria-label="Close search"
			title="Close"
		>
			{#if X}
				<X size={20} strokeWidth={2} />
			{/if}
		</button>

		<input
			type="text"
			placeholder="Search conditions..."
			bind:value={$searchQuery}
			class="search-input"
		/>

		<button
			class="search-nav-btn"
			onclick={handlePrevious}
			aria-label="Previous result"
			title="Previous"
		>
			{#if ChevronLeft}
				<ChevronLeft size={18} strokeWidth={2} />
			{/if}
		</button>

		<button
			class="search-nav-btn"
			onclick={handleNext}
			aria-label="Next result"
			title="Next"
		>
			{#if ChevronRight}
				<ChevronRight size={18} strokeWidth={2} />
			{/if}
		</button>
	</div>
{/if}

<style>
	.search-bar {
		position: sticky;
		top: 70px;
		z-index: 20;
		background-color: black;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 0.75rem 2rem;
		border-bottom: 1px solid #1e5a96;
		animation: slideDown 0.3s ease;
	}

	@keyframes slideDown {
		from {
			transform: translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.search-icon-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		flex-shrink: 0;
	}

	:global(.search-icon-btn svg) {
		stroke: #4a9fd8;
		transition: all 0.3s ease;
	}

	.search-icon-btn:hover :global(svg) {
		filter: drop-shadow(0 0 8px rgba(74, 159, 216, 0.4));
		transform: scale(1.1);
	}

	.search-input {
		padding: 0.6rem 1rem;
		background: rgba(74, 159, 216, 0.1);
		border: 1px solid #4a9fd8;
		border-radius: 4px;
		color: #a0d8ff;
		font-size: 0.95rem;
		min-width: 300px;
		transition: all 0.3s ease;
	}

	.search-input:focus {
		outline: none;
		background: rgba(74, 159, 216, 0.15);
		border-color: #1e5a96;
		box-shadow: 0 0 12px rgba(74, 159, 216, 0.3);
	}

	.search-input::placeholder {
		color: rgba(160, 216, 255, 0.5);
	}

	.search-nav-btn {
		background: none;
		border: 1px solid #4a9fd8;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		flex-shrink: 0;
	}

	:global(.search-nav-btn svg) {
		stroke: #4a9fd8;
		transition: all 0.3s ease;
	}

	.search-nav-btn:hover {
		background: rgba(74, 159, 216, 0.15);
		transform: scale(1.05);
	}

	.search-nav-btn:hover :global(svg) {
		filter: drop-shadow(0 0 8px rgba(74, 159, 216, 0.3));
	}

	@media (max-width: 768px) {
		.search-bar {
			top: 60px;
			padding: 0.5rem 1rem;
			gap: 0.5rem;
		}

		.search-input {
			min-width: 150px;
			font-size: 0.85rem;
		}
	}
</style>
