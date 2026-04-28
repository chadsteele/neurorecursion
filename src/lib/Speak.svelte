<script>
	import {onMount} from "svelte"

	let {children} = $props()
	let contentEl = $state(null)
	let observer = null
	let isWrapping = false
	const IGNORED_TAGS = new Set(["script", "style", "noscript"])
	const SENTENCE_DELIMITERS = new Set([".", "?", "!"])
	const EQUATION_CHARS = new Set([
		"=",
		"+",
		"-",
		"*",
		"/",
		"\\",
		"×",
		"÷",
		"^",
		"(",
		")",
		"[",
		"]",
	])

	function startObservingContent() {
		if (!observer || !contentEl) return

		observer.observe(contentEl, {
			childList: true,
			subtree: true,
		})
	}

	function isIgnorableElement(element) {
		if (!(element instanceof HTMLElement)) return true

		const tag = element.tagName.toLowerCase()
		if (IGNORED_TAGS.has(tag)) {
			return true
		}

		if (element.hidden) return true
		if (element.getAttribute("aria-hidden") === "true") return true

		return false
	}

	function shouldWrapTextNode(node) {
		if (!(node instanceof Text)) return false

		const text = node.textContent || ""
		if (!text.trim()) return false

		const parent = node.parentElement
		if (!parent) return false
		if (parent.closest("span.speak")) return false

		let current = parent
		while (current && current !== contentEl) {
			if (isIgnorableElement(current)) return false
			current = current.parentElement
		}

		return true
	}

	function getPreviousSignificantChar(text, index) {
		for (
			let currentIndex = index - 1;
			currentIndex >= 0;
			currentIndex -= 1
		) {
			const char = text[currentIndex]
			if (!/\s/.test(char)) return char
		}

		return ""
	}

	function getNextSignificantChar(text, index) {
		for (
			let currentIndex = index + 1;
			currentIndex < text.length;
			currentIndex += 1
		) {
			const char = text[currentIndex]
			if (!/\s/.test(char)) return char
		}

		return ""
	}

	function isEquationChar(char) {
		return EQUATION_CHARS.has(char)
	}

	function isSentenceBoundary(text, index) {
		const char = text[index]
		if (!SENTENCE_DELIMITERS.has(char)) return false

		const nextChar = text[index + 1] || ""
		return !nextChar || /\s/.test(nextChar)
	}

	function isPauseHyphen(text, index) {
		if (text[index] !== "-") return false

		const previousChar = text[index - 1] || ""
		const nextChar = text[index + 1] || ""
		const previousSignificant = getPreviousSignificantChar(text, index)
		const nextSignificant = getNextSignificantChar(text, index)

		if (!previousSignificant || !nextSignificant) return false
		if (!/\s/.test(previousChar) && !/\s/.test(nextChar)) return false
		if (/\d/.test(nextSignificant)) return false
		if (
			isEquationChar(previousSignificant) ||
			isEquationChar(nextSignificant)
		) {
			return false
		}
		if (/\d/.test(previousSignificant) && /\d/.test(nextSignificant)) {
			return false
		}

		return true
	}

	function splitReadableText(text) {
		const segments = []
		let segmentStart = 0

		function pushWrappedSegment(endIndex) {
			if (endIndex <= segmentStart) return

			segments.push({
				text: text.slice(segmentStart, endIndex),
				wrap: true,
			})
			segmentStart = endIndex
		}

		for (let index = 0; index < text.length; index += 1) {
			if (isSentenceBoundary(text, index)) {
				pushWrappedSegment(index + 1)
				continue
			}
		}

		if (segmentStart < text.length) {
			segments.push({
				text: text.slice(segmentStart),
				wrap: true,
			})
		}

		return segments
	}

	function wrapReadableText() {
		if (!contentEl || isWrapping) return

		isWrapping = true
		observer?.disconnect()

		try {
			const walker = document.createTreeWalker(
				contentEl,
				NodeFilter.SHOW_TEXT,
				{
					acceptNode(node) {
						return shouldWrapTextNode(node)
							? NodeFilter.FILTER_ACCEPT
							: NodeFilter.FILTER_REJECT
					},
				},
			)

			const textNodes = []
			let currentNode = walker.nextNode()

			while (currentNode) {
				textNodes.push(currentNode)
				currentNode = walker.nextNode()
			}

			for (const textNode of textNodes) {
				const fragment = document.createDocumentFragment()
				const segments = splitReadableText(textNode.textContent || "")

				for (const segment of segments) {
					if (!segment.text) continue

					if (segment.wrap && segment.text.trim()) {
						const span = document.createElement("span")
						span.className = "speak"
						span.textContent = segment.text
						fragment.appendChild(span)
						continue
					}

					fragment.appendChild(document.createTextNode(segment.text))
				}

				textNode.parentNode?.replaceChild(fragment, textNode)
			}
		} finally {
			startObservingContent()
			isWrapping = false
		}
	}

	onMount(() => {
		if (!contentEl) return

		wrapReadableText()

		observer = new MutationObserver(() => {
			wrapReadableText()
		})

		startObservingContent()

		return () => {
			observer?.disconnect()
		}
	})
</script>

<div class="speak-content" bind:this={contentEl}>
	{@render children?.()}
</div>

<style>
	.speak-content {
		display: contents;
	}
</style>
