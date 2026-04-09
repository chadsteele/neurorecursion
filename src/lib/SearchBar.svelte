<script>
	import {
		searchOpen,
		searchQuery,
		currentMatchIndex,
		totalMatches,
	} from "$lib/stores.js"
	import {onMount} from "svelte"
	import {browser} from "$app/environment"
	import {page} from "$app/stores"
	import {slide} from "svelte/transition"
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
		// Load search query and index from localStorage
		const savedQuery = localStorage.getItem("searchQuery") || ""
		const savedIndex = parseInt(localStorage.getItem("searchIndex") || "-1")
		searchQuery.set(savedQuery)
		currentMatchIndex.set(savedIndex)

		mainContent = document.querySelector(".main-content")
		if (mainContent) {
			markInstance = new Mark(mainContent)
		}
	})

	let previousPath = $state($page.url.pathname)

	// Close search when navigating to a different page
	$effect(() => {
		const currentPath = $page.url.pathname
		if (currentPath !== previousPath) {
			previousPath = currentPath
			if ($searchOpen) {
				closeSearch()
			}
		}
	})

	function closeSearch() {
		// Save current index before closing
		if ($currentMatchIndex >= 0) {
			localStorage.setItem("searchIndex", $currentMatchIndex.toString())
		}
		if (markInstance) {
			markInstance.unmark()
		}
		currentMatchIndex.set(-1)
		totalMatches.set(0)
		searchOpen.set(false)
		// Keep searchQuery for next time - don't clear it
	}

	function getMatchGroups() {
		// Group marks into match instances
		// Marks that are close together (same match) are in the same group
		const allMarks = Array.from(mainContent?.querySelectorAll("mark") || [])
		// Filter to only leaf marks (marks not containing other marks)
		const markElements = allMarks.filter(
			(mark) => !mark.querySelector("mark"),
		)
		if (markElements.length === 0) return []

		const groups = []
		let currentGroup = []
		let lastMarkEnd = null

		markElements.forEach((mark, idx) => {
			const markStart = mark.offsetTop

			// If mark is on a different line or far from last, start new group
			if (lastMarkEnd !== null && markStart > lastMarkEnd) {
				groups.push(currentGroup)
				currentGroup = []
			}

			currentGroup.push(mark)
			lastMarkEnd = markStart
		})

		if (currentGroup.length > 0) {
			groups.push(currentGroup)
		}

		return groups
	}

	function highlightMatchGroup(groupIdx) {
		const groups = getMatchGroups()
		if (groups.length === 0) return

		// Remove highlight from all marks
		mainContent?.querySelectorAll("mark").forEach((mark) => {
			mark.classList.remove("search-highlight-current")
		})

		// Highlight marks in the current group
		const currentGroup = groups[groupIdx]
		if (currentGroup) {
			currentGroup.forEach((mark) => {
				mark.classList.add("search-highlight-current")
				// Scroll first mark into view
				if (mark === currentGroup[0]) {
					requestAnimationFrame(() => {
						mark.scrollIntoView({
							behavior: "smooth",
							block: "center",
						})
					})
				}
			})
		}
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

			// Get all words from query
			const words = query
				.trim()
				.split(/\s+/)
				.filter((w) => w.length > 0)
			if (words.length === 0) return

			// Helper to check if element contains all words
			const hasAllWords = (text) => {
				const lowerText = text.toLowerCase()
				return words.every((word) =>
					lowerText.includes(word.toLowerCase()),
				)
			}

			// Mark with filter: only mark words if their parent contains all search words
			markInstance.mark(words, {
				separateWordSearch: true,
				filter: function (node, term, totalCounter, counter) {
					// Get closest element with meaningful text content
					let parent = node.parentElement
					while (
						parent &&
						parent !== mainContent &&
						!parent.textContent
					) {
						parent = parent.parentElement
					}
					// Only mark if parent contains ALL search words
					return parent ? hasAllWords(parent.textContent) : false
				},
			})

			// Count unique match instances by grouping marks
			const markElements = Array.from(
				mainContent.querySelectorAll("mark"),
			)
			// Filter out marks that are parents of other marks (nested marks)
			// Only count leaf marks (marks containing actual text)
			const leafMarks = markElements.filter(
				(mark) => !mark.querySelector("mark"),
			)

			const wordCount = words.length
			const markCount = leafMarks.length

			// Count actual match groups, not calculated counts
			// This ensures navigation matches what the user sees
			let matchGroups = []
			if (markCount > 0) {
				let currentGroup = []
				let lastMarkEnd = null
				leafMarks.forEach((mark) => {
					const markStart = mark.offsetTop
					// If mark is on a different line, start new group
					if (lastMarkEnd !== null && markStart > lastMarkEnd) {
						matchGroups.push(currentGroup)
						currentGroup = []
					}
					currentGroup.push(mark)
					lastMarkEnd = markStart
				})
				if (currentGroup.length > 0) {
					matchGroups.push(currentGroup)
				}
			}

			const count = matchGroups.length

			// Debug logging
			if (import.meta.env.DEV) {
				console.log(
					`[Search] Query: "${query}", Words: ${wordCount}, Total Marks: ${markElements.length}, Leaf Marks: ${markCount}, Groups: ${count}`,
				)
			}

			totalMatches.set(count)

			if (count > 0) {
				currentMatchIndex.set(0)
				// Highlight after DOM has updated with marks
				requestAnimationFrame(() => {
					highlightMatchGroup(0)
				})
			} else {
				currentMatchIndex.set(-1)
			}
		} catch (e) {
			// Silently handle mark.js errors
		}
	})

	// Separate effect: when match index changes, update highlighting
	$effect(() => {
		const idx = $currentMatchIndex
		if (idx >= 0) {
			highlightMatchGroup(idx)
		} else {
			mainContent?.querySelectorAll("mark").forEach((mark) => {
				mark.classList.remove("search-highlight-current")
			})
		}
	})

	// Persist search query to localStorage whenever it changes
	$effect(() => {
		localStorage.setItem("searchQuery", $searchQuery)
	})

	// Re-mark when search is reopened
	$effect(() => {
		if ($searchOpen && $searchQuery && mainContent && markInstance) {
			try {
				const words = $searchQuery
					.trim()
					.split(/\s+/)
					.filter((w) => w.length > 0)
				if (words.length === 0) return

				const hasAllWords = (text) => {
					const lowerText = text.toLowerCase()
					return words.every((word) =>
						lowerText.includes(word.toLowerCase()),
					)
				}

				markInstance.mark(words, {
					separateWordSearch: true,
					filter: function (node, term, totalCounter, counter) {
						let parent = node.parentElement
						while (
							parent &&
							parent !== mainContent &&
							!parent.textContent
						) {
							parent = parent.parentElement
						}
						return parent ? hasAllWords(parent.textContent) : false
					},
				})
				const allMarks = Array.from(
					mainContent.querySelectorAll("mark"),
				)
				// Filter to only leaf marks (marks not containing other marks)
				const leafMarks = allMarks.filter(
					(mark) => !mark.querySelector("mark"),
				)

				// Count actual match groups by positioning
				let matchGroups = []
				if (leafMarks.length > 0) {
					let currentGroup = []
					let lastMarkEnd = null
					leafMarks.forEach((mark) => {
						const markStart = mark.offsetTop
						if (lastMarkEnd !== null && markStart > lastMarkEnd) {
							matchGroups.push(currentGroup)
							currentGroup = []
						}
						currentGroup.push(mark)
						lastMarkEnd = markStart
					})
					if (currentGroup.length > 0) {
						matchGroups.push(currentGroup)
					}
				}

				const wordCount = words.length
				const count = matchGroups.length

				// Debug logging
				if (import.meta.env.DEV) {
					console.log(
						`[Search Re-mark] Query: "${$searchQuery}", Words: ${wordCount}, Leaf Marks: ${leafMarks.length}, Groups: ${count}`,
					)
				}

				totalMatches.set(count)
				if (count > 0) {
					// Don't set index or highlight when reopening search
					// Only navigate to matches when user clicks < or >
					currentMatchIndex.set(-1)
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

		const groups = getMatchGroups()
		if (groups.length === 0) return

		let newIdx = $currentMatchIndex - 1
		if (newIdx < 0) {
			newIdx = groups.length - 1
		}
		currentMatchIndex.set(newIdx)
	}

	function handleNext() {
		// Lazy-initialize if needed
		if (!mainContent) {
			mainContent = document.querySelector(".main-content")
		}

		const groups = getMatchGroups()
		if (groups.length === 0) return

		let newIdx = $currentMatchIndex + 1
		if (newIdx >= groups.length) {
			newIdx = 0
		}
		currentMatchIndex.set(newIdx)
	}
</script>

{#if $searchOpen}
	<div class="search-bar" transition:slide>
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

	@keyframes slideUp {
		from {
			transform: translateY(0);
			opacity: 1;
		}
		to {
			transform: translateY(-100%);
			opacity: 0;
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
