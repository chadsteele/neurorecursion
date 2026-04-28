<script module>
	const speakRegistry = new WeakMap()
	let globallyPaused = false

	function forEachSpeakController(callback) {
		if (typeof document === "undefined") return

		const wrappers = Array.from(document.querySelectorAll(".speak-wrapper"))
		for (const wrapper of wrappers) {
			const controller = speakRegistry.get(wrapper)
			if (!controller) continue
			callback(controller)
		}
	}

	function registerSpeakInstance(element, controller) {
		speakRegistry.set(element, controller)
	}

	function unregisterSpeakInstance(element) {
		speakRegistry.delete(element)
	}

	function pauseAllSpeakInstances() {
		globallyPaused = true
		forEachSpeakController((controller) => controller.pause?.())
	}

	function resumeAllSpeakInstances() {
		globallyPaused = false
		forEachSpeakController((controller) => controller.resume?.())
	}

	function isSpeakGloballyPaused() {
		return globallyPaused
	}

	function startNextSpeakInstance(currentElement) {
		if (typeof document === "undefined" || !currentElement) return
		if (globallyPaused) return

		const wrappers = Array.from(document.querySelectorAll(".speak-wrapper"))
		const currentIndex = wrappers.indexOf(currentElement)
		if (currentIndex === -1) return

		for (let i = currentIndex + 1; i < wrappers.length; i += 1) {
			const nextElement = wrappers[i]
			const controller = speakRegistry.get(nextElement)
			if (!controller) continue
			if (!controller.canStart()) continue

			controller.start()
			break
		}
	}
</script>

<script>
	import {onMount} from "svelte"
	import {Pause, Play} from "lucide-svelte"

	let {
		label = "Speak content",
		children,
		voiceName = "",
		lang = "en-US",
		rate = 0.96,
		pitch = 1.05,
		volume = 1,
	} = $props()
	let contentEl
	let speechAvailable = $state(false)
	let voices = $state([])
	let speakTimeout = null
	let speechQueue = $state([])
	let currentIndex = $state(0)
	let isSpeaking = $state(false)
	let isPaused = $state(false)
	let wrapperEl

	const SENTENCE_PAUSE_MS = 220
	const PARAGRAPH_PAUSE_MS = 420
	const HEADING_PAUSE_MS = 650

	const FEMALE_VOICE_HINTS = [
		// "samantha",
		// "victoria",
		// "ava",
		// "karen",
		// "allison",
		"moira",
		"zira",
		"aria",
		"jenny",
		"female",
	]

	function loadVoices() {
		if (typeof window === "undefined" || !window.speechSynthesis) return
		voices = window.speechSynthesis.getVoices() || []
	}

	function clearSpeechState() {
		if (speakTimeout) {
			clearTimeout(speakTimeout)
			speakTimeout = null
		}

		speechQueue = []
		currentIndex = 0
		isSpeaking = false
		isPaused = false

		if (typeof window !== "undefined" && window.speechSynthesis) {
			window.speechSynthesis.cancel()
		}
	}

	function pickVoice() {
		if (!voices.length) return null

		if (voiceName) {
			const exact = voices.find(
				(voice) => voice.name.toLowerCase() === voiceName.toLowerCase(),
			)
			if (exact) return exact
		}

		const preferredLangPrefix = (lang || "en").toLowerCase().split("-")[0]
		const sameLang = voices.filter((voice) =>
			voice.lang.toLowerCase().startsWith(preferredLangPrefix),
		)

		const femalePreferred = sameLang.find((voice) =>
			FEMALE_VOICE_HINTS.some((hint) =>
				voice.name.toLowerCase().includes(hint),
			),
		)
		if (femalePreferred) return femalePreferred

		return sameLang[0] || voices[0]
	}

	function splitIntoSentences(text) {
		return (text || "")
			.trim()
			.split(/(?<=[.!?])\s+/)
			.map((sentence) => sentence.trim())
			.filter(Boolean)
	}

	function isIgnorableElement(element) {
		if (!(element instanceof HTMLElement)) return true

		const tag = element.tagName.toLowerCase()
		if (tag === "script" || tag === "style" || tag === "noscript")
			return true
		if (element.hidden) return true
		if (element.getAttribute("aria-hidden") === "true") return true

		return false
	}

	function hasMeaningfulText(element) {
		return Boolean((element.textContent || "").trim())
	}

	function hasMeaningfulDirectText(element) {
		return Array.from(element.childNodes).some((node) => {
			return (
				node.nodeType === Node.TEXT_NODE &&
				Boolean((node.textContent || "").trim())
			)
		})
	}

	function isHeadingElement(element) {
		return /^H[1-6]$/.test(element.tagName)
	}

	function isLikelyBlockElement(element) {
		if (typeof window === "undefined") return false

		const display = window.getComputedStyle(element).display
		return (
			display === "block" ||
			display === "list-item" ||
			display === "table" ||
			display === "flex" ||
			display === "grid" ||
			display === "flow-root"
		)
	}

	function collectReadableBlocks() {
		if (!contentEl) return []

		const elements = Array.from(contentEl.querySelectorAll("*")).filter(
			(element) => {
				if (isIgnorableElement(element)) return false
				if (!hasMeaningfulText(element)) return false

				if (isHeadingElement(element)) return true
				if (isLikelyBlockElement(element)) return true

				return (
					hasMeaningfulDirectText(element) &&
					element.parentElement === contentEl
				)
			},
		)

		return elements
	}

	function getOwnedTextForBlock(block, blockSet) {
		const chunks = []

		function visit(node) {
			if (node.nodeType === Node.TEXT_NODE) {
				const text = (node.textContent || "")
					.replace(/\s+/g, " ")
					.trim()
				if (text) chunks.push(text)
				return
			}

			if (node.nodeType !== Node.ELEMENT_NODE) return

			const element = node
			if (!(element instanceof HTMLElement)) return
			if (isIgnorableElement(element)) return

			if (element !== block && blockSet.has(element)) {
				return
			}

			Array.from(element.childNodes).forEach(visit)
		}

		Array.from(block.childNodes).forEach(visit)
		return chunks.join(" ").replace(/\s+/g, " ").trim()
	}

	function buildSpeechQueue() {
		if (!contentEl) return []

		const blocks = collectReadableBlocks()
		if (!blocks.length) {
			return splitIntoSentences(contentEl.textContent || "").map(
				(sentence, index, sentences) => ({
					text: sentence,
					pauseAfter:
						index < sentences.length - 1
							? SENTENCE_PAUSE_MS
							: PARAGRAPH_PAUSE_MS,
				}),
			)
		}

		const queue = []
		const blockSet = new Set(blocks)

		for (const block of blocks) {
			const text = getOwnedTextForBlock(block, blockSet)
			if (!text) continue

			const sentences = splitIntoSentences(text)
			const blockPause = isHeadingElement(block)
				? HEADING_PAUSE_MS
				: PARAGRAPH_PAUSE_MS

			sentences.forEach((sentence, index) => {
				queue.push({
					text: sentence,
					pauseAfter:
						index < sentences.length - 1
							? SENTENCE_PAUSE_MS
							: blockPause,
				})
			})
		}

		return queue
	}

	function finishSpeech(shouldContinue = false) {
		if (speakTimeout) {
			clearTimeout(speakTimeout)
			speakTimeout = null
		}

		speechQueue = []
		currentIndex = 0
		isSpeaking = false
		isPaused = false

		if (shouldContinue) {
			startNextSpeakInstance(wrapperEl)
		}
	}

	function speakCurrentSegment() {
		if (
			!speechAvailable ||
			!speechQueue.length ||
			currentIndex >= speechQueue.length
		) {
			finishSpeech()
			return
		}

		const segment = speechQueue[currentIndex]
		const msg = new SpeechSynthesisUtterance(segment.text)
		msg.lang = lang
		msg.rate = rate
		msg.pitch = pitch
		msg.volume = volume

		const selectedVoice = pickVoice()
		if (selectedVoice) {
			msg.voice = selectedVoice
		}

		msg.onend = () => {
			if (isPaused) return

			currentIndex += 1

			if (currentIndex >= speechQueue.length) {
				finishSpeech(true)
				return
			}

			speakTimeout = setTimeout(() => {
				speakTimeout = null
				if (!isPaused) {
					speakCurrentSegment()
				}
			}, segment.pauseAfter)
		}

		msg.onerror = () => {
			finishSpeech()
		}

		window.speechSynthesis.speak(msg)
	}

	onMount(() => {
		speechAvailable =
			typeof window !== "undefined" &&
			"speechSynthesis" in window &&
			typeof SpeechSynthesisUtterance !== "undefined"

		if (!speechAvailable) return

		loadVoices()
		window.speechSynthesis.onvoiceschanged = loadVoices

		if (wrapperEl) {
			registerSpeakInstance(wrapperEl, {
				start: startSpeech,
				canStart: () => speechAvailable && !isSpeaking,
				pause: pauseSpeech,
				resume: resumeSpeech,
			})
		}

		return () => {
			if (wrapperEl) {
				unregisterSpeakInstance(wrapperEl)
			}

			clearSpeechState()

			if (window.speechSynthesis) {
				window.speechSynthesis.onvoiceschanged = null
			}
		}
	})

	function pauseSpeech() {
		if (!speechAvailable || !isSpeaking || isPaused) return

		if (speakTimeout) {
			clearTimeout(speakTimeout)
			speakTimeout = null
			isPaused = true
			return
		}

		if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
			window.speechSynthesis.pause()
			isPaused = true
		}
	}

	function resumeSpeech() {
		if (!speechAvailable || !isSpeaking || !isPaused) return

		isPaused = false

		if (window.speechSynthesis.paused) {
			window.speechSynthesis.resume()
			return
		}

		speakCurrentSegment()
	}

	function pauseAllSpeaks() {
		pauseAllSpeakInstances()
	}

	function resumeAllSpeaks() {
		resumeAllSpeakInstances()
	}

	function startSpeech() {
		if (!speechAvailable || !contentEl) return

		const queue = buildSpeechQueue()
		if (!queue.length) return

		clearSpeechState()
		speechQueue = queue
		currentIndex = 0
		isSpeaking = true
		speakCurrentSegment()
	}

	function toggleSpeech() {
		if (isSpeaking) {
			if (isPaused) {
				resumeAllSpeaks()
				return
			}

			pauseAllSpeaks()
			return
		}

		if (isSpeakGloballyPaused()) {
			resumeAllSpeaks()
			return
		}

		startSpeech()
	}

	const buttonLabel = $derived.by(() => {
		if (isPaused) return `Resume ${label.toLowerCase()}`
		if (isSpeaking) return `Pause ${label.toLowerCase()}`
		return label
	})
</script>

<div class="speak-wrapper" bind:this={wrapperEl}>
	{#if speechAvailable}
		<button
			type="button"
			class="speak-button"
			onclick={toggleSpeech}
			aria-label={buttonLabel}
			title={buttonLabel}
			aria-pressed={isSpeaking && !isPaused}
		>
			{#if isSpeaking && !isPaused}
				<Pause size={18} strokeWidth={1.8} aria-hidden="true" />
			{:else}
				<Play size={18} strokeWidth={1.8} aria-hidden="true" />
			{/if}
		</button>
	{/if}

	<div class="speak-content" bind:this={contentEl}>
		{@render children?.()}
	</div>
</div>

<style>
	.speak-wrapper {
		position: relative;
	}

	.speak-button {
		appearance: none;
		position: absolute;
		top: 0.6rem;
		right: 0.6rem;
		z-index: 10;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0;
		line-height: 0;
		font-size: 0;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.25);
		background: rgba(12, 18, 32, 0.75);
		color: #d9ecff;
		cursor: pointer;
		backdrop-filter: blur(6px);
		transition:
			transform 0.2s ease,
			background 0.2s ease;
	}

	.speak-button:hover {
		transform: translateY(-1px);
		background: rgba(28, 48, 88, 0.85);
	}

	.speak-button:focus-visible {
		outline: none;
		box-shadow: 0 0 0 3px rgba(121, 176, 255, 0.4);
	}

	:global(.speak-button svg) {
		display: block;
		flex-shrink: 0;
		width: 1.1rem;
		height: 1.1rem;
		stroke: currentColor;
	}
</style>
