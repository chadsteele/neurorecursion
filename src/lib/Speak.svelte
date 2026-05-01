<script>
	import {onMount, setContext, getContext} from "svelte"
	import {isPauseHyphen, splitReadableText} from "$lib/utils/textSegmentation"

	let {children, on = undefined, off = undefined, force = false} = $props()

	// Supported call styles:
	// - <Speak>, <Speak on>, <Speak off>
	// When both on and off are present, default to on.

	const isLocalOn = $derived(() =>
		on === true ? true : off === true ? false : true,
	)
	const parentForcedOn = $derived(() => getContext("speak:forcedOn") ?? false)
	const parentForcedOff = $derived(
		() => getContext("speak:forcedOff") ?? false,
	)

	$effect(() => {
		// Innermost force wins: force-on clears inherited forced-off and vice versa
		setContext(
			"speak:forcedOn",
			isLocalOn
				? force
					? true
					: parentForcedOn
				: force
					? false
					: parentForcedOn,
		)
		setContext(
			"speak:forcedOff",
			!isLocalOn
				? force
					? true
					: parentForcedOff
				: force
					? false
					: parentForcedOff,
		)
	})

	const isActive = $derived(
		() => parentForcedOn || (isLocalOn && !parentForcedOff),
	)
	let contentEl = $state(null)
	let observer = null
	let isWrapping = false
	/**
	 * Acronyms whose display form should be replaced with a more speakable
	 * alternative. Each entry wraps the matched text in a <span data-speak="...">.
	 * Reader.svelte's getSpokenText() reads data-speak instead of textContent.
	 */
	const ACRONYM_MAP = new Map([
		["aka", "also known as"],
		["iow", "in other words"],
		["lol", "laughing out loud"],
		["tl;dr", "too long, didn't read"],
		["fyi", "for your information"],
		["afaik", "as far as I know"],
		["imho", "in my humble opinion"],
		["imo", "in my opinion"],
		["asap", "as soon as possible"],
		["eta", "estimated time of arrival"],
		["btw", "by the way"],
		["diy", "do it yourself"],
		["rsvp", "please respond"],
		["i.e.", "that is"],
		["e.g.", "for example"],
		["tm", "trademark"],
		["etc.", "et cetera"],
		["etc", "et cetera"],
		["vs.", "versus"],
		["vs", "versus"],
		["(r)", "registered"],
		["®", "registered trademark"],
		["(c)", "copyright"],
		["©", "copyright"],
		["tba", "to be announced"],
		["tbd", "to be determined"],
		["faq", "frequently asked questions"],
		["n/a", "not applicable"],
		["wrt", "with regard to"],
		["approx", "approximately"],
		["est", "established"],
		["inc", "incorporated"],
		["ltd", "limited"],
		["sm", "service mark"],
		["tm", "trademark"],
		["et.al.", "and others"],
		["et al.", "and others"],
		["♾️", "infinity"],
		["∞", "infinity"],
	])

	// Built from ACRONYM_MAP keys — order matters (longer matches first).
	const ACRONYM_RE = new RegExp(
		`(?<![a-zA-Z])(${[...ACRONYM_MAP.keys()]
			.sort((a, b) => b.length - a.length)
			.map((k) => k.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&"))
			.join("|")})(?![a-zA-Z])`,
		"gi",
	)

	const IGNORED_TAGS = new Set(["script", "style", "noscript"])
	const HIDDEN_CLASS_NAMES = new Set([
		// NOTE: "silence" is intentionally NOT here — silenced elements are visible
		// and must not be skipped by isIgnorableElement. They are excluded from
		// wrapping via the data-speak attribute guard in shouldWrapTextNode.
		"hidden",
		"invisible",
		"sr-only",
		"visually-hidden",
		"d-none",
	])

	// Inline phrasing elements whose text should NOT get their own speak span.
	// They will be absorbed into the surrounding sentence span so that emphasis
	// words flow without prosodic pauses before and after them.
	const INLINE_PHRASING_TAGS = new Set([
		"strong",
		"b",
		"em",
		"i",
		"mark",
		"u",
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
		if (element.inert) return true

		const ariaHidden = element.getAttribute("aria-hidden")
		if (
			typeof ariaHidden === "string" &&
			ariaHidden.toLowerCase() === "true"
		) {
			return true
		}

		for (const className of HIDDEN_CLASS_NAMES) {
			if (element.classList.contains(className)) return true
		}

		const computed = getComputedStyle(element)
		if (
			computed.display === "none" ||
			computed.visibility === "hidden" ||
			computed.visibility === "collapse" ||
			computed.contentVisibility === "hidden"
		) {
			return true
		}

		return false
	}

	function shouldWrapTextNode(node) {
		if (!(node instanceof Text)) return false

		const text = node.textContent || ""
		if (!text.trim()) return false

		const parent = node.parentElement
		if (!parent) return false
		if (parent.closest("span.speak")) return false
		// Do not wrap the display text of an acronym span — the data-speak
		// attribute already carries the spoken form for Reader.svelte.
		if (parent.closest("[data-speak]")) return false

		// Do not wrap text owned by a nested <Speak> instance.
		const nearestSpeakRoot = parent.closest("[data-speak-root]")
		if (nearestSpeakRoot && nearestSpeakRoot !== contentEl) return false

		let current = parent
		while (current && current !== contentEl) {
			if (isIgnorableElement(current)) return false
			current = current.parentElement
		}

		return true
	}

	/**
	 * After text nodes are wrapped in span.speak elements, inline phrasing
	 * elements (strong, em, etc.) sit unwrapped between adjacent spans. This
	 * function merges consecutive speak spans that are separated only by inline
	 * phrasing elements (and optional whitespace), provided the first span does
	 * not end at a sentence boundary. The inline elements are moved inside the
	 * merged span so getSpokenText() in Reader.svelte reads them naturally.
	 */
	function mergeSpeakSpansAcrossInlines() {
		if (!contentEl) return

		// Re-query each pass because we mutate the DOM.
		let changed = true
		while (changed) {
			changed = false
			const spans = Array.from(contentEl.querySelectorAll("span.speak"))

			for (let i = 0; i < spans.length - 1; i++) {
				const a = spans[i]
				const b = spans[i + 1]

				// Don't merge across sentence boundaries.
				const aText = (a.textContent || "").trimEnd()
				const lastChar = aText[aText.length - 1] || ""
				if (lastChar === "." || lastChar === "?" || lastChar === "!")
					continue

				// Find the lowest common ancestor (LCA) of a and b.
				const aAncestors = []
				let node = a.parentElement
				while (node) {
					aAncestors.push(node)
					node = node.parentElement
				}
				let cursor = b.parentElement
				let lca = null
				while (cursor) {
					if (aAncestors.includes(cursor)) {
						lca = cursor
						break
					}
					cursor = cursor.parentElement
				}
				if (!lca) continue

				// Path from a to LCA must pass only through inline elements.
				let pathOk = true
				node = a.parentElement
				while (node && node !== lca) {
					const t = node.tagName?.toLowerCase()
					if (!INLINE_PHRASING_TAGS.has(t) && t !== "span") {
						pathOk = false
						break
					}
					node = node.parentElement
				}
				if (!pathOk) continue

				// Path from b to LCA must pass only through inline elements.
				node = b.parentElement
				while (node && node !== lca) {
					const t = node.tagName?.toLowerCase()
					if (!INLINE_PHRASING_TAGS.has(t) && t !== "span") {
						pathOk = false
						break
					}
					node = node.parentElement
				}
				if (!pathOk) continue

				// Find the child of LCA that contains a (aRoot) and b (bRoot).
				let aRoot = a
				while (aRoot.parentElement !== lca) aRoot = aRoot.parentElement
				let bRoot = b
				while (bRoot.parentElement !== lca) bRoot = bRoot.parentElement
				if (aRoot === bRoot) continue

				// Collect siblings between aRoot and bRoot.
				const between = []
				node = aRoot.nextSibling
				while (node && node !== bRoot) {
					between.push(node)
					node = node.nextSibling
				}
				if (!node) continue // bRoot is not after aRoot

				// Everything between them must be inline phrasing or whitespace.
				const allAbsorbable = between.every(
					(n) =>
						(n instanceof Text && !(n.textContent || "").trim()) ||
						(n instanceof Element &&
							INLINE_PHRASING_TAGS.has(n.tagName.toLowerCase())),
				)
				if (!allAbsorbable) continue

				// Build a new merged span at the LCA level.
				const merged = document.createElement("span")
				merged.className = "speak"
				lca.insertBefore(merged, aRoot)
				merged.appendChild(aRoot)
				for (const n of between) merged.appendChild(n)
				merged.appendChild(bRoot)

				// Unwrap any nested speak spans now inside the merged span.
				for (const nested of Array.from(
					merged.querySelectorAll("span.speak"),
				)) {
					while (nested.firstChild)
						nested.parentNode.insertBefore(
							nested.firstChild,
							nested,
						)
					nested.remove()
				}

				changed = true
				break
			}
		}
	}

	function annotateImages() {
		if (!contentEl) return

		for (const img of contentEl.querySelectorAll("img")) {
			if (!(img instanceof HTMLElement)) continue
			if (img.hasAttribute("data-speak")) continue

			const alt = img.getAttribute("alt")?.trim()
			if (!alt) continue

			img.setAttribute("data-speak", alt)
			img.setAttribute("data-speak-segment", "true")
			img.classList.add("speak")
		}
	}

	function annotateEquations() {
		if (!contentEl) return

		const equations = contentEl.querySelectorAll("div.equation")

		for (const equation of equations) {
			if (!(equation instanceof HTMLElement)) continue

			const valueEl = equation.querySelector("div.value")
			const fraction = equation.querySelector("div.fraction")
			if (!valueEl || !fraction) continue

			const numeratorEl = fraction.querySelector("div.numerator")
			const denominatorEl = fraction.querySelector("div.denominator")
			if (!numeratorEl || !denominatorEl) continue

			const valueText =
				(valueEl.textContent || "")
					.replace(/=/g, " equals ")
					.replace(/\s+/g, " ")
					.trim() || ""
			const numeratorText = numeratorEl.textContent?.trim() || ""
			const denominatorText = denominatorEl.textContent?.trim() || ""
			if (!valueText || !numeratorText || !denominatorText) continue

			// Mark the whole equation as one speak segment so it is read and
			// highlighted fluidly as: "Infinity equals dharma over karma".
			equation.classList.add("speak")
			equation.setAttribute("data-speak-segment", "true")
			equation.setAttribute(
				"data-speak",
				`${valueText} ${numeratorText} over ${denominatorText}`,
			)
		}
	}

	function appendEquationOperatorHints() {
		if (!contentEl) return

		const speakSpans = contentEl.querySelectorAll("span.speak")
		const operatorLabels = {
			"/": "divided by",
			"*": "times",
			"+": "plus",
			"-": "minus",
		}

		for (const speakSpan of speakSpans) {
			if (!(speakSpan instanceof HTMLElement)) continue
			if (speakSpan.querySelector('[data-speak-operator-hint="true"]')) {
				continue
			}

			const text = speakSpan.textContent || ""
			if (!text.includes("=")) continue
			if (
				!["/", "*", "+", "-"].some((operator) =>
					text.includes(operator),
				)
			) {
				continue
			}

			const childNodes = Array.from(speakSpan.childNodes)

			for (const childNode of childNodes) {
				if (!(childNode instanceof Text)) continue

				const nodeText = childNode.textContent || ""
				if (!/[/*+\-]/.test(nodeText)) continue

				const fragment = document.createDocumentFragment()
				let currentText = ""

				for (const char of nodeText) {
					if (char in operatorLabels) {
						if (currentText) {
							fragment.appendChild(
								document.createTextNode(currentText),
							)
							currentText = ""
						}
						const opSpan = document.createElement("span")
						opSpan.setAttribute("data-speak", operatorLabels[char])
						opSpan.setAttribute("data-speak-operator-hint", "true")
						opSpan.textContent = char
						fragment.appendChild(opSpan)
					} else {
						currentText += char
					}
				}

				if (currentText) {
					fragment.appendChild(document.createTextNode(currentText))
				}

				childNode.parentNode?.replaceChild(fragment, childNode)
			}
		}
	}

	/**
	 * Replaces known acronyms in text nodes with <span data-speak="spoken form">
	 * so the display text is preserved visually while getSpokenText() in
	 * Reader.svelte reads the spoken alternative.
	 */
	function expandAcronyms() {
		if (!contentEl) return

		const walker = document.createTreeWalker(
			contentEl,
			NodeFilter.SHOW_TEXT,
			{
				acceptNode(node) {
					if (node.parentElement?.closest("[data-speak]")) {
						return NodeFilter.FILTER_REJECT
					}
					const text = node.textContent || ""
					ACRONYM_RE.lastIndex = 0
					const hasMatch = ACRONYM_RE.test(text)
					ACRONYM_RE.lastIndex = 0
					return hasMatch
						? NodeFilter.FILTER_ACCEPT
						: NodeFilter.FILTER_REJECT
				},
			},
		)

		const textNodes = []
		let node = walker.nextNode()
		while (node) {
			textNodes.push(node)
			node = walker.nextNode()
		}

		for (const textNode of textNodes) {
			const text = textNode.textContent || ""
			ACRONYM_RE.lastIndex = 0

			const fragment = document.createDocumentFragment()
			let lastIndex = 0
			let match

			while ((match = ACRONYM_RE.exec(text)) !== null) {
				if (match.index > lastIndex) {
					fragment.appendChild(
						document.createTextNode(
							text.slice(lastIndex, match.index),
						),
					)
				}

				const spoken =
					ACRONYM_MAP.get(match[0].toLowerCase()) ?? match[0]
				const span = document.createElement("span")
				span.setAttribute("data-speak", spoken)
				span.textContent = match[0]
				fragment.appendChild(span)

				lastIndex = match.index + match[0].length
			}

			if (lastIndex < text.length) {
				fragment.appendChild(
					document.createTextNode(text.slice(lastIndex)),
				)
			}

			textNode.parentNode?.replaceChild(fragment, textNode)
		}
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

			mergeSpeakSpansAcrossInlines()
			annotateImages()
			annotateEquations()
			appendEquationOperatorHints()
			expandAcronyms()
		} finally {
			startObservingContent()
			isWrapping = false
		}
	}

	onMount(() => {
		if (!contentEl || !isActive) return

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

<div class="speak-content" data-speak-root bind:this={contentEl}>
	{@render children?.()}
</div>

<style>
	.speak-content {
		display: contents;
	}

	:global(.hidden) {
		display: none;
	}
</style>
