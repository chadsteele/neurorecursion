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

	const SEMANTIC_BLOCK_SELECTOR =
		"h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption, dd, dt"
	const READABLE_BLOCK_SELECTOR = `${SEMANTIC_BLOCK_SELECTOR}, div`

	const SENTENCE_PAUSE_MS = 220
	const PARAGRAPH_PAUSE_MS = 420
	const HEADING_PAUSE_MS = 650

	const FEMALE_VOICE_HINTS = [
		"samantha",
		"victoria",
		"ava",
		"karen",
		"allison",
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

	function getReadableBlocks() {
		if (!contentEl) return []

		return Array.from(
			contentEl.querySelectorAll(READABLE_BLOCK_SELECTOR),
		).filter((block) => {
			const text = (block.textContent || "").trim()
			if (!text) return false

			if (!block.matches("div")) return true

			return !Array.from(block.children).some((child) => {
				if (!(child instanceof HTMLElement)) return false
				if (!child.matches(READABLE_BLOCK_SELECTOR)) return false

				return Boolean((child.textContent || "").trim())
			})
		})
	}

	function buildSpeechQueue() {
		if (!contentEl) return []

		const blocks = getReadableBlocks()
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

		for (const block of blocks) {
			const text = (block.textContent || "").trim()
			if (!text) continue

			const sentences = splitIntoSentences(text)
			const blockPause = block.matches("h1, h2, h3, h4, h5, h6")
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

	function finishSpeech() {
		if (speakTimeout) {
			clearTimeout(speakTimeout)
			speakTimeout = null
		}

		speechQueue = []
		currentIndex = 0
		isSpeaking = false
		isPaused = false
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
				finishSpeech()
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

		return () => {
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
				resumeSpeech()
				return
			}

			pauseSpeech()
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

<div class="speak-wrapper">
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
