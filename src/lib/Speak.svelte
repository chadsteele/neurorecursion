<script>
	import {onMount} from "svelte"

	let {children} = $props()
	let contentEl = $state(null)
	let observer = null
	let isWrapping = false

	function isIgnorableElement(element) {
		if (!(element instanceof HTMLElement)) return true

		const tag = element.tagName.toLowerCase()
		if (
			tag === "script" ||
			tag === "style" ||
			tag === "noscript" ||
			tag === "button"
		) {
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
		if (parent.closest("button")) return false

		let current = parent
		while (current && current !== contentEl) {
			if (isIgnorableElement(current)) return false
			current = current.parentElement
		}

		return true
	}

	function wrapReadableText() {
		if (!contentEl || isWrapping) return

		isWrapping = true

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
				const span = document.createElement("span")
				span.className = "speak"
				span.textContent = textNode.textContent
				textNode.parentNode?.replaceChild(span, textNode)
			}
		} finally {
			isWrapping = false
		}
	}

	onMount(() => {
		if (!contentEl) return

		wrapReadableText()

		observer = new MutationObserver(() => {
			wrapReadableText()
		})

		observer.observe(contentEl, {
			childList: true,
			subtree: true,
		})

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
