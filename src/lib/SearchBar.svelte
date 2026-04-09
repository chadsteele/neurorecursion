<script>
	import {
		searchOpen,
		searchQuery,
		currentMatchIndex,
		totalMatches,
	} from "$lib/stores.js"
	import {onMount} from "svelte"
	import {browser} from "$app/environment"
	import Mark from "mark.js"

	let X = $state(null)
	let ChevronLeft = $state(null)
	let ChevronRight = $state(null)
	let mainContent = $state(null)
	let markInstance = $state(null)

	if (browser) {
		import("lucide-svelte").then((module) => {
			X = module.X
			ChevronLeft = module.ChevronLeft
			ChevronRight = module.ChevronRight
		})
	}

	onMount(() => {
		// Load search query from localStorage
		const savedQuery = localStorage.getItem("searchQuery") || ""
		searchQuery.set(savedQuery)

		mainContent = document.querySelector(".main-content")
		if (mainContent) {
			markInstance = new Mark(mainContent)
		}
	})

	function closeSearch() {
		if (markInstance) {
			markInstance.unmark()
		}
		currentMatchIndex.set(-1)
		totalMatches.set(0)
		searchOpen.set(false)
		// Keep searchQuery for next time - don't clear it
	}

	function updateCurrentMatchHighlight() {
		const markElements = mainContent?.querySelectorAll("mark") || []
		markElements.forEach((el, idx) => {
			if (idx === $currentMatchIndex) {
				el.classList.add("search-highlight-current")
				// Scroll into view
				el.scrollIntoView({behavior: "smooth", block: "center"})
			} else {
				el.classList.remove("search-highlight-current")
			}
		})
	}

	// Reactive: when query changes, search and mark results
	$effect(() => {
		const query = $searchQuery

		// Lazy-initialize mainContent and markInstance if not already done
		if (!mainContent) {
			mainContent = document.querySelector(".main-content")
		}

		if (mainContent && !markInstance) {
			markInstance = new Mark(mainContent)
		}

		if (!query || !markInstance || !mainContent) {
			markInstance?.unmark()
			currentMatchIndex.set(-1)
			totalMatches.set(0)
			return
		}

		try {
			markInstance.unmark()
			markInstance.mark(query)

			// Query the mark elements after marking
			const markElements = mainContent.querySelectorAll("mark")
			const count = markElements.length

			totalMatches.set(count)

			if (count > 0) {
				currentMatchIndex.set(0)
			} else {
				currentMatchIndex.set(-1)
			}
		} catch (e) {
			// Silently handle mark.js errors
		}
	})

	// Separate effect: when match index changes, update highlighting
	$effect(() => {
		updateCurrentMatchHighlight()
	})

	// Persist search query to localStorage whenever it changes
	$effect(() => {
		localStorage.setItem("searchQuery", $searchQuery)
	})

	// Re-mark when search is reopened
	$effect(() => {
		if ($searchOpen && $searchQuery && mainContent && markInstance) {
			try {
				markInstance.mark($searchQuery)
				const markElements = mainContent.querySelectorAll("mark")
				const count = markElements.length
				totalMatches.set(count)
				if (count > 0) {
					currentMatchIndex.set(0)
				}
			} catch (e) {
				// Silently handle mark.js errors
			}
		}
	})

	function handlePrevious() {
		// Lazy-initialize if needed
		if (!mainContent) {
			mainContent = document.querySelector(".main-content")
		}

		const markElements = mainContent?.querySelectorAll("mark") || []
		if (markElements.length === 0) return

		let newIdx = $currentMatchIndex - 1
		if (newIdx < 0) {
			newIdx = markElements.length - 1
		}
		currentMatchIndex.set(newIdx)
	}

	function handleNext() {
		// Lazy-initialize if needed
		if (!mainContent) {
			mainContent = document.querySelector(".main-content")
		}

		const markElements = mainContent?.querySelectorAll("mark") || []
		if (markElements.length === 0) return

		let newIdx = $currentMatchIndex + 1
		if (newIdx >= markElements.length) {
			newIdx = 0
		}
		currentMatchIndex.set(newIdx)
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

		{#if $totalMatches > 0}
			<span class="match-counter">
				{$currentMatchIndex + 1} / {$totalMatches}
			</span>
		{/if}

		<button
			class="search-nav-btn"
			onclick={handlePrevious}
			aria-label="Previous result"
			title="Previous"
			disabled={!$searchQuery.trim()}
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
			disabled={!$searchQuery.trim()}
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

	.match-counter {
		color: #a0d8ff;
		font-size: 0.9rem;
		min-width: 50px;
		text-align: center;
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

	.search-nav-btn:hover:not(:disabled) {
		background: rgba(74, 159, 216, 0.15);
		transform: scale(1.05);
	}

	.search-nav-btn:hover:not(:disabled) :global(svg) {
		filter: drop-shadow(0 0 8px rgba(74, 159, 216, 0.3));
	}

	.search-nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
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

		.match-counter {
			font-size: 0.8rem;
			min-width: 40px;
		}
	}

	:global(mark) {
		background-color: rgba(30, 144, 255, 0.3);
		border-radius: 2px;
		padding: 0 2px;
		color: inherit;
	}

	:global(.search-highlight-current) {
		background-color: rgba(192, 192, 192, 0.7) !important;
		color: #1a1a1a !important;
		border-radius: 2px;
		font-weight: 600;
		padding: 0 2px !important;
		box-shadow: 0 0 10px rgba(192, 192, 192, 0.8);
	}
</style>
