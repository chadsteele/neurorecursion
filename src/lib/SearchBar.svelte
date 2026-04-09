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
	import {goto} from "$app/navigation"
	import {slide} from "svelte/transition"
	import Mark from "mark.js"

	let X = $state(null)
	let ChevronLeft = $state(null)
	let ChevronRight = $state(null)
	let mainContent = $state(null)
	let markInstance = $state(null)
	let localQuery = $state("")

	if (browser) {
		import("lucide-svelte").then((module) => {
			X = module.X
			ChevronLeft = module.ChevronLeft
			ChevronRight = module.ChevronRight
		})
	}

	onMount(() => {
		mainContent = document.querySelector(".main-content")
		if (mainContent) {
			markInstance = new Mark(mainContent)
		}

		// Check URL params for search terms (use window.location for consistency)
		const urlParams = new URLSearchParams(window.location.search)
		const urlQuery = urlParams.get("q") || ""
		const urlIndex = parseInt(urlParams.get("i") || "-1")

		// Use URL params if available, otherwise fall back to localStorage
		const query = urlQuery || localStorage.getItem("searchQuery") || ""
		const index = urlQuery
			? urlIndex
			: parseInt(localStorage.getItem("searchIndex") || "-1")

		localQuery = query
		searchQuery.set(query)
		currentMatchIndex.set(index)

		// If URL has search terms, open the search box and perform search
		if (query) {
			searchStartPath = $page.url.pathname
			searchOpen.set(true)
			// Perform search immediately (effect will also handle it)
			setTimeout(() => {
				performSearch(query)
			}, 0)
		}
	})

	let previousPath = $state($page.url.pathname)
	let searchStartPath = $state($page.url.pathname)

	// Close search when navigating to a different page
	$effect(() => {
		const currentPath = $page.url.pathname
		if (currentPath !== previousPath) {
			console.log(
				"[SearchBar] Path changed from",
				previousPath,
				"to",
				currentPath,
			)
			previousPath = currentPath
			if ($searchOpen) {
				console.log("  -> Search was open, closing it")
				closeSearch()
			} else {
				// Update search start path when navigating (for next time search opens)
				searchStartPath = currentPath
				console.log(
					"  -> Updated searchStartPath for next search:",
					searchStartPath,
				)
			}
		}
	})

	// Remove search parameters from URL whenever search closes (any way)
	$effect(() => {
		if (!$searchOpen) {
			const urlParams = new URLSearchParams(window.location.search)
			const hadSearchParams = urlParams.has("q") || urlParams.has("i")

			if (hadSearchParams) {
				urlParams.delete("q")
				urlParams.delete("i")
				const newSearch = urlParams.toString()
				const newUrl = newSearch
					? `${window.location.pathname}?${newSearch}`
					: window.location.pathname
				goto(newUrl, {replaceState: true})
			}
		}
	})

	// Get match groups from current DOM marks
	function getMatchGroups() {
		const allMarks = Array.from(mainContent?.querySelectorAll("mark") || [])
		const leafMarks = allMarks.filter((mark) => !mark.querySelector("mark"))

		if (leafMarks.length === 0) return []

		const groups = []
		let currentGroup = []
		let lastMarkEnd = null

		leafMarks.forEach((mark) => {
			const markStart = mark.offsetTop
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

	// Perform search: mark DOM and update counts
	function performSearch(query) {
		if (!mainContent || !markInstance) return

		// Clear old marks
		markInstance.unmark()

		if (!query.trim()) {
			totalMatches.set(0)
			currentMatchIndex.set(-1)
			return
		}

		// Parse query
		const words = query
			.trim()
			.split(/\s+/)
			.filter((w) => w.length > 0)
		if (words.length === 0) {
			totalMatches.set(0)
			currentMatchIndex.set(-1)
			return
		}

		// Helper to check if text contains all words
		const hasAllWords = (text) => {
			const lowerText = text.toLowerCase()
			return words.every((word) => lowerText.includes(word.toLowerCase()))
		}

		// Mark with filter
		try {
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
		} catch (e) {
			// mark.js error
		}

		// Count match groups
		const groups = getMatchGroups()
		const count = groups.length

		totalMatches.set(count)

		// Set index to 0 if we have matches and index is invalid
		if (
			count > 0 &&
			($currentMatchIndex < 0 || $currentMatchIndex >= count)
		) {
			currentMatchIndex.set(0)
		}
	}

	function closeSearch() {
		if (markInstance) {
			markInstance.unmark()
		}
		currentMatchIndex.set(-1)
		totalMatches.set(0)
		searchOpen.set(false)
		// The $effect on searchOpen will handle removing q and i params
	}

	function handleInputChange(e) {
		localQuery = e.currentTarget.value
		searchQuery.set(localQuery)
		localStorage.setItem("searchQuery", localQuery)

		// Clear old marks whenever query changes
		if (markInstance) {
			markInstance.unmark()
		}

		// Reset counts - search only happens on < or > clicks
		totalMatches.set(0)
		currentMatchIndex.set(-1)
	}

	function handlePrevious() {
		console.log("[SearchBar] Previous clicked")
		console.log("  searchStartPath:", searchStartPath)
		console.log(
			"  current window.location.pathname:",
			window.location.pathname,
		)
		console.log("  current $page.url.pathname:", $page.url.pathname)

		// Perform search first if not done yet
		if (!mainContent?.querySelector("mark")) {
			performSearch(localQuery)
		}

		const groups = getMatchGroups()
		if (groups.length === 0) return

		let newIdx = $currentMatchIndex - 1
		if (newIdx < 0) {
			newIdx = groups.length - 1
		}
		currentMatchIndex.set(newIdx)
		localStorage.setItem("searchIndex", newIdx.toString())

		// Update URL with search terms and index, preserving the path where search started
		const urlParams = new URLSearchParams(window.location.search)
		if (localQuery.trim()) {
			urlParams.set("q", localQuery)
			urlParams.set("i", newIdx.toString())
		} else {
			urlParams.delete("q")
			urlParams.delete("i")
		}

		const newSearch = urlParams.toString()
		const newUrl = newSearch
			? `${searchStartPath}?${newSearch}`
			: searchStartPath
		console.log("  newUrl being set:", newUrl)
		goto(newUrl, {replaceState: true})
	}

	function handleNext() {
		console.log("[SearchBar] Next clicked")
		console.log("  searchStartPath:", searchStartPath)
		console.log(
			"  current window.location.pathname:",
			window.location.pathname,
		)
		console.log("  current $page.url.pathname:", $page.url.pathname)

		// Perform search first if not done yet
		if (!mainContent?.querySelector("mark")) {
			performSearch(localQuery)
		}

		const groups = getMatchGroups()
		if (groups.length === 0) return

		let newIdx = $currentMatchIndex + 1
		if (newIdx >= groups.length) {
			newIdx = 0
		}
		currentMatchIndex.set(newIdx)
		localStorage.setItem("searchIndex", newIdx.toString())

		// Update URL with search terms and index, preserving the path where search started
		const urlParams = new URLSearchParams(window.location.search)
		if (localQuery.trim()) {
			urlParams.set("q", localQuery)
			urlParams.set("i", newIdx.toString())
		} else {
			urlParams.delete("q")
			urlParams.delete("i")
		}

		const newSearch = urlParams.toString()
		const newUrl = newSearch
			? `${searchStartPath}?${newSearch}`
			: searchStartPath
		console.log("  newUrl being set:", newUrl)
		goto(newUrl, {replaceState: true})
	}

	// When index changes, highlight that match and scroll
	$effect(() => {
		const idx = $currentMatchIndex

		// Use requestAnimationFrame to ensure DOM marks are laid out
		requestAnimationFrame(() => {
			// Get fresh groups after layout is stable
			const groups = getMatchGroups()

			// Remove all highlights
			mainContent?.querySelectorAll("mark").forEach((mark) => {
				mark.classList.remove("search-highlight-current")
			})

			// Apply highlight to new index
			if (idx >= 0 && groups.length > 0 && idx < groups.length) {
				const group = groups[idx]
				group.forEach((mark) => {
					mark.classList.add("search-highlight-current")
				})
				// Scroll first mark into view
				if (group[0]) {
					group[0].scrollIntoView({
						behavior: "smooth",
						block: "center",
					})
				}
			}
		})
	})

	// Track when search first opens to capture starting path
	let wasSearchOpen = $state(false)

	$effect(() => {
		// Capture path only on initial search open
		if ($searchOpen && !wasSearchOpen) {
			searchStartPath = $page.url.pathname
			wasSearchOpen = true
			console.log(
				"[SearchBar] Search opened, captured searchStartPath:",
				searchStartPath,
			)
		} else if (!$searchOpen && wasSearchOpen) {
			wasSearchOpen = false
			console.log("[SearchBar] Search closed")
		}
	})

	// When search opens, recalculate marks
	$effect(() => {
		if ($searchOpen && localQuery) {
			performSearch(localQuery)
		}
	})
</script>

{#if $searchOpen}
	<div class="search-bar" transition:slide>
		<button
			class="search-icon-btn"
			onclick={() => closeSearch()}
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
			value={localQuery}
			oninput={handleInputChange}
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
			disabled={!localQuery.trim() || $totalMatches === 0}
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
			disabled={!localQuery.trim() || $totalMatches === 0}
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
