/**
 * Search utilities for finding and highlighting text in the DOM
 */

const HIGHLIGHT_CLASS = "search-highlight"
const CURRENT_HIGHLIGHT_CLASS = "search-highlight-current"

/**
 * Find all text nodes containing the search query in a container
 * Returns array of {element, textNode, startOffset, endOffset, text}
 */
export function findAllMatches(container, query) {
	if (!query || !container) return []

	const query_lower = query.toLowerCase()
	const matches = []
	const walker = document.createTreeWalker(
		container,
		NodeFilter.SHOW_TEXT,
		null,
		false,
	)

	let textNode
	while ((textNode = walker.nextNode())) {
		// Verify text node is still attached to DOM
		if (!textNode.parentElement) continue

		const text_lower = textNode.textContent.toLowerCase()
		let startIndex = 0

		while (true) {
			const index = text_lower.indexOf(query_lower, startIndex)
			if (index === -1) break

			matches.push({
				textNode,
				startOffset: index,
				endOffset: index + query.length,
				text: textNode.textContent.substring(
					index,
					index + query.length,
				),
				originalText: textNode.textContent,
			})

			startIndex = index + 1
		}
	}

	return matches
}

/**
 * Highlight a specific match in the matches array
 * Wraps the match text in a span with the highlight class
 */
export function highlightMatch(match, isCurrent = false) {
	if (!match || !match.textNode) return null

	const textNode = match.textNode
	const {startOffset, endOffset} = match

	// Check if text node is still in the DOM
	if (!textNode.parentElement) {
		return null
	}

	// Check if already highlighted
	if (textNode.parentElement.classList.contains(HIGHLIGHT_CLASS)) {
		return textNode.parentElement
	}

	const span = document.createElement("span")
	span.className = isCurrent ? CURRENT_HIGHLIGHT_CLASS : HIGHLIGHT_CLASS
	span.textContent = textNode.textContent.substring(startOffset, endOffset)

	const before = textNode.textContent.substring(0, startOffset)
	const after = textNode.textContent.substring(endOffset)

	try {
		if (before) {
			textNode.parentElement.insertBefore(
				document.createTextNode(before),
				textNode,
			)
		}

		textNode.parentElement.insertBefore(span, textNode)

		if (after) {
			textNode.parentElement.insertBefore(
				document.createTextNode(after),
				textNode,
			)
		}

		textNode.parentElement.removeChild(textNode)
	} catch (e) {
		// Text node was removed from DOM, return silently
		return null
	}

	return span
}

/**
 * Clear all highlights from a container
 */
export function clearHighlights(container) {
	if (!container) return

	const highlights = container.querySelectorAll(
		`.${HIGHLIGHT_CLASS}, .${CURRENT_HIGHLIGHT_CLASS}`,
	)
	highlights.forEach((el) => {
		const parent = el.parentElement
		if (!parent) return // Skip if element is detached

		const text = el.textContent
		const textNode = document.createTextNode(text)
		try {
			parent.replaceChild(textNode, el)
			parent.normalize() // Merge adjacent text nodes
		} catch (e) {
			// Silently skip if replacement fails
		}
	})
}

/**
 * Scroll an element into view, positioned in the top half of viewport
 */
export function scrollToMatch(element) {
	if (!element) return

	const rect = element.getBoundingClientRect()
	const viewportHeight = window.innerHeight

	// If already in top half, no need to scroll
	if (rect.top >= 0 && rect.top <= viewportHeight / 2) {
		return
	}

	// Scroll to position element in top third of viewport
	const scrollAmount = rect.top - viewportHeight / 3
	window.scrollBy({
		top: scrollAmount,
		behavior: "smooth",
	})
}

/**
 * Get the first visible element (or first element in document)
 */
export function getFirstVisibleMatch(matches) {
	if (!matches.length) return null

	for (const match of matches) {
		const rect = match.textNode.parentElement.getBoundingClientRect()
		if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
			return match
		}
	}

	// No visible match, return first
	return matches[0]
}
