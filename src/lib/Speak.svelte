<script>
	import {onMount, setContext, getContext} from "svelte"
	import {isPauseHyphen, splitReadableText} from "$lib/utils/textSegmentation"

	let {children, on = undefined, off = undefined, force = false} = $props()

	// Supported call styles:
	// - <Speak>, <Speak on>, <Speak off>
	// When both on and off are present, default to on.
	const isLocalOn = on === true ? true : off === true ? false : true

	const parentForcedOn = getContext("speak:forcedOn") ?? false
	const parentForcedOff = getContext("speak:forcedOff") ?? false

	// Innermost force wins: force-on clears inherited forced-off and vice versa
	setContext(
		"speak:forcedOn",
		isLocalOn && force
			? true
			: !isLocalOn && force
				? false
				: parentForcedOn,
	)
	setContext(
		"speak:forcedOff",
		!isLocalOn && force
			? true
			: isLocalOn && force
				? false
				: parentForcedOff,
	)

	// Active if a parent forced it on, or mode is "on" and no parent forced it off
	const isActive = parentForcedOn || (isLocalOn && !parentForcedOff)
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
