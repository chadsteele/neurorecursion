<script>
	import {onMount} from "svelte"
	import {Play, Pause, ChevronLeft, ChevronRight, Trash2} from "lucide-svelte"

	let {
		voiceName = "",
		lang = "en-US",
		rate = 0.96,
		pitch = 1.05,
		volume = 1,
	} = $props()

	let speechAvailable = $state(false)
	let voices = $state([])
	let isReading = $state(false)
	let isPaused = $state(false)
	let currentSpan = $state(null)
	let currentSegments = $state([])
	let currentSentenceIndex = $state(0)
	let position = $state({x: 0, y: 0})
	let isDragging = $state(false)
	let dragOffset = $state({x: 0, y: 0})
	let readerEl = $state(null)
	let isDeleted = $state(false)
	let trashHovering = $state(false)
	let speakTimeout = null
	let activeSpeechToken = 0

	const VIEWPORT_PADDING_PX = 8
	const SIDE_REVEAL_REM = 3.1
	const SENTENCE_PAUSE_MS = 220
	const HYPHEN_PAUSE_MS = SENTENCE_PAUSE_MS
	const SPAN_PAUSE_MS = 420
	const FEMALE_VOICE_HINTS = ["moira", "zira", "aria", "jenny", "female"]
	const READER_POSITION_STORAGE_KEY = "reader-floating-position"
	const READER_BASE_LEFT_PX = 50
	const READER_BASE_TOP_PX = 100

	function loadVoices() {
		if (typeof window === "undefined" || !window.speechSynthesis) return
		voices = window.speechSynthesis.getVoices() || []
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
		const normalizedText = (text || "").trim()
		if (!normalizedText) return []

		const sentenceParts = normalizedText
			.split(/(?<=[.!?])\s+/)
			.map((sentence) => sentence.trim())
			.filter(Boolean)

		const segments = []

		for (const sentence of sentenceParts) {
			const hyphenParts = sentence
				.split(/\s+-\s+/)
				.map((part) => part.trim())
				.filter(Boolean)

			hyphenParts.forEach((part, index) => {
				const isLastPartInSentence = index === hyphenParts.length - 1
				segments.push({
					text: part,
					pauseAfter: isLastPartInSentence
						? SENTENCE_PAUSE_MS
						: HYPHEN_PAUSE_MS,
				})
			})
		}

		return segments
	}

	function clearSpeakTimeout() {
		if (speakTimeout) {
			clearTimeout(speakTimeout)
			speakTimeout = null
		}
	}

	function cancelBrowserSpeech() {
		clearSpeakTimeout()

		if (typeof window !== "undefined" && window.speechSynthesis) {
			window.speechSynthesis.cancel()
		}

		activeSpeechToken += 1
	}

	function stopReading({clearHighlight = false} = {}) {
		cancelBrowserSpeech()
		currentSegments = []
		currentSentenceIndex = 0
		isReading = false
		isPaused = false

		if (clearHighlight) {
			currentSpan = null
			highlightSpan(null)
		}
	}

	function remToPx(rem) {
		if (typeof window === "undefined") return rem * 16
		const rootSize =
			parseFloat(getComputedStyle(document.documentElement).fontSize) ||
			16
		return rem * rootSize
	}

	function clampDragPosition(nextX, nextY) {
		if (typeof window === "undefined" || !readerEl) {
			return {x: nextX, y: nextY}
		}

		const rect = readerEl.getBoundingClientRect()
		const horizontalSideSpace = remToPx(SIDE_REVEAL_REM)

		const minX =
			VIEWPORT_PADDING_PX + horizontalSideSpace - READER_BASE_LEFT_PX
		const maxX =
			window.innerWidth -
			rect.width -
			VIEWPORT_PADDING_PX -
			horizontalSideSpace -
			READER_BASE_LEFT_PX
		const minY = VIEWPORT_PADDING_PX - READER_BASE_TOP_PX
		const maxY =
			window.innerHeight -
			rect.height -
			VIEWPORT_PADDING_PX -
			READER_BASE_TOP_PX

		return {
			x: Math.min(Math.max(nextX, minX), Math.max(minX, maxX)),
			y: Math.min(Math.max(nextY, minY), Math.max(minY, maxY)),
		}
	}

	function syncReaderPositionToViewport({persist = false} = {}) {
		if (typeof window === "undefined" || !readerEl || isDeleted) return

		const clampedPosition = clampDragPosition(position.x, position.y)
		const hasChanged =
			clampedPosition.x !== position.x || clampedPosition.y !== position.y

		if (!hasChanged) return

		position = clampedPosition

		if (persist) {
			saveReaderPosition(clampedPosition)
		}
	}

	function saveReaderPosition(nextPosition) {
		if (typeof window === "undefined") return

		window.localStorage.setItem(
			READER_POSITION_STORAGE_KEY,
			JSON.stringify(nextPosition),
		)
	}

	function restoreReaderPosition() {
		if (typeof window === "undefined") return

		const savedPosition = window.localStorage.getItem(
			READER_POSITION_STORAGE_KEY,
		)
		if (!savedPosition) return

		try {
			const parsed = JSON.parse(savedPosition)
			if (
				typeof parsed?.x !== "number" ||
				typeof parsed?.y !== "number"
			) {
				return
			}

			requestAnimationFrame(() => {
				position = {x: parsed.x, y: parsed.y}
				syncReaderPositionToViewport({persist: true})
			})
		} catch {
			window.localStorage.removeItem(READER_POSITION_STORAGE_KEY)
		}
	}

	function handleViewportChange() {
		syncReaderPositionToViewport({persist: true})
	}

	function findAllSpeakSpans() {
		return Array.from(document.querySelectorAll("span.speak")).filter(
			(span) => !span.closest("button"),
		)
	}

	function findFirstVisibleSpeak() {
		const spans = findAllSpeakSpans()
		for (const span of spans) {
			const rect = span.getBoundingClientRect()
			if (rect.top < window.innerHeight && rect.bottom > 0) {
				return span
			}
		}
		return spans[0] || null
	}

	function findNextSpeak(current) {
		const spans = findAllSpeakSpans()
		const idx = spans.indexOf(current)
		return idx >= 0 && idx < spans.length - 1 ? spans[idx + 1] : null
	}

	function findPrevSpeak(current) {
		const spans = findAllSpeakSpans()
		const idx = spans.indexOf(current)
		return idx > 0 ? spans[idx - 1] : null
	}

	function highlightSpan(span) {
		findAllSpeakSpans().forEach((candidate) => {
			candidate.classList.remove("reader-current")
		})

		if (span) {
			span.classList.add("reader-current")
			span.focus()
		}
	}

	function ensureSpanInView(span) {
		if (!span) return

		span.scrollIntoView({
			behavior: "smooth",
			block: "center",
			inline: "nearest",
		})
	}

	function speakCurrentSentence(token = activeSpeechToken) {
		if (
			!speechAvailable ||
			token !== activeSpeechToken ||
			!currentSegments.length ||
			currentSentenceIndex >= currentSegments.length
		) {
			return
		}

		const segment = currentSegments[currentSentenceIndex]
		const utterance = new SpeechSynthesisUtterance(segment.text)
		utterance.lang = lang
		utterance.rate = rate
		utterance.pitch = pitch
		utterance.volume = volume

		const selectedVoice = pickVoice()
		if (selectedVoice) {
			utterance.voice = selectedVoice
		}

		utterance.onend = () => {
			if (token !== activeSpeechToken || isPaused) return

			currentSentenceIndex += 1

			if (currentSentenceIndex >= currentSegments.length) {
				const nextSpan = findNextSpeak(currentSpan)
				if (nextSpan) {
					speakTimeout = setTimeout(() => {
						speakTimeout = null
						if (token === activeSpeechToken && !isPaused) {
							startReadingFromSpan(nextSpan)
						}
					}, SPAN_PAUSE_MS)
				} else {
					stopReading({clearHighlight: true})
				}
				return
			}

			speakTimeout = setTimeout(() => {
				speakTimeout = null
				if (token === activeSpeechToken && !isPaused) {
					speakCurrentSentence(token)
				}
			}, segment.pauseAfter)
		}

		utterance.onerror = () => {
			if (token !== activeSpeechToken) return
			stopReading({clearHighlight: true})
		}

		window.speechSynthesis.speak(utterance)
	}

	function startReadingFromSpan(span) {
		if (!speechAvailable) return
		if (!span) {
			stopReading({clearHighlight: true})
			return
		}

		cancelBrowserSpeech()

		currentSpan = span
		ensureSpanInView(span)
		highlightSpan(span)

		currentSegments = splitIntoSentences(span.textContent || "")
		currentSentenceIndex = 0

		if (!currentSegments.length) {
			const nextSpan = findNextSpeak(span)
			if (nextSpan) {
				startReadingFromSpan(nextSpan)
			} else {
				stopReading({clearHighlight: true})
			}
			return
		}

		isReading = true
		isPaused = false
		speakCurrentSentence(activeSpeechToken)
	}

	function pauseReading() {
		if (!speechAvailable || !isReading || isPaused) return

		if (speakTimeout) {
			clearSpeakTimeout()
			isPaused = true
			return
		}

		if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
			window.speechSynthesis.pause()
		}

		isPaused = true
	}

	function resumeReading() {
		if (!speechAvailable || !isReading || !isPaused) return

		ensureSpanInView(currentSpan)
		isPaused = false

		if (window.speechSynthesis.paused) {
			window.speechSynthesis.resume()
			return
		}

		speakCurrentSentence(activeSpeechToken)
	}

	function togglePlay() {
		if (isReading) {
			if (isPaused) {
				resumeReading()
			} else {
				pauseReading()
			}
			return
		}

		const firstVisible = findFirstVisibleSpeak()
		if (firstVisible) {
			startReadingFromSpan(firstVisible)
		}
	}

	function gotoPrev() {
		const prevSpan = findPrevSpeak(currentSpan)
		if (prevSpan) {
			startReadingFromSpan(prevSpan)
		}
	}

	function gotoNext() {
		const nextSpan = findNextSpeak(currentSpan)
		if (nextSpan) {
			startReadingFromSpan(nextSpan)
		}
	}

	function handleMouseDown(e) {
		isDragging = true
		dragOffset = {
			x: e.clientX - position.x,
			y: e.clientY - position.y,
		}
	}

	function handleMouseMove(e) {
		if (isDragging) {
			const nextX = e.clientX - dragOffset.x
			const nextY = e.clientY - dragOffset.y
			position = clampDragPosition(nextX, nextY)
		}
	}

	function handleMouseUp(e) {
		if (isDragging && isMouseOverTrash(e)) {
			isDeleted = true
			stopReading({clearHighlight: true})
		} else if (isDragging) {
			saveReaderPosition(position)
		}

		isDragging = false
		trashHovering = false
	}

	function isMouseOverTrash(e) {
		const trashCenter = {
			x: window.innerWidth / 2,
			y: window.innerHeight / 2,
		}

		const distance = Math.sqrt(
			Math.pow(e.clientX - trashCenter.x, 2) +
				Math.pow(e.clientY - trashCenter.y, 2),
		)

		const trashRadiusPx =
			(Math.min(window.innerWidth, window.innerHeight) * 0.33) / 2

		return distance < trashRadiusPx
	}

	function handleMouseMoveTrash(e) {
		if (isDragging) {
			trashHovering = isMouseOverTrash(e)
		}
	}

	function handleScroll() {
		if (isReading && !isPaused) return

		const firstVisible = findFirstVisibleSpeak()
		if (firstVisible && firstVisible !== currentSpan) {
			currentSpan = firstVisible
			highlightSpan(firstVisible)
		}
	}

	onMount(() => {
		speechAvailable =
			typeof window !== "undefined" &&
			"speechSynthesis" in window &&
			typeof SpeechSynthesisUtterance !== "undefined"

		if (!speechAvailable) return

		loadVoices()
		restoreReaderPosition()
		window.speechSynthesis.onvoiceschanged = loadVoices

		window.addEventListener("mousemove", handleMouseMove)
		window.addEventListener("mousemove", handleMouseMoveTrash)
		window.addEventListener("mouseup", handleMouseUp)
		window.addEventListener("scroll", handleScroll)
		window.addEventListener("resize", handleViewportChange)
		window.addEventListener("orientationchange", handleViewportChange)

		return () => {
			window.removeEventListener("mousemove", handleMouseMove)
			window.removeEventListener("mousemove", handleMouseMoveTrash)
			window.removeEventListener("mouseup", handleMouseUp)
			window.removeEventListener("scroll", handleScroll)
			window.removeEventListener("resize", handleViewportChange)
			window.removeEventListener(
				"orientationchange",
				handleViewportChange,
			)
			stopReading({clearHighlight: true})
			window.speechSynthesis.onvoiceschanged = null
		}
	})
</script>

{#if speechAvailable && !isDeleted}
	{#if isDragging}
		<div class="trash-overlay" class:trash-hovering={trashHovering}>
			<Trash2 strokeWidth={1.5} />
		</div>
	{/if}

	<div
		class="reader-container"
		class:controls-expanded={isReading && !isPaused}
		role="button"
		tabindex="0"
		bind:this={readerEl}
		style="transform: translate({position.x}px, {position.y}px)"
		onmousedown={handleMouseDown}
	>
		{#if isReading}
			<button
				class="reader-btn side-btn prev-btn"
				onclick={gotoPrev}
				title="Previous span"
				aria-label="Previous"
			>
				<ChevronLeft size={18} strokeWidth={2} />
			</button>
		{/if}

		<button
			class="reader-btn play-btn"
			onclick={togglePlay}
			title={isPaused
				? "Resume reading"
				: isReading
					? "Pause reading"
					: "Start reading"}
			aria-label={isPaused ? "Resume" : isReading ? "Pause" : "Play"}
			aria-pressed={isReading && !isPaused}
		>
			{#if isReading && !isPaused}
				<Pause size={20} strokeWidth={1.5} />
			{:else}
				<Play size={20} strokeWidth={1.5} />
			{/if}
		</button>

		{#if isReading}
			<button
				class="reader-btn side-btn next-btn"
				onclick={gotoNext}
				title="Next span"
				aria-label="Next"
			>
				<ChevronRight size={18} strokeWidth={2} />
			</button>
		{/if}
	</div>
{/if}

<style>
	.reader-container {
		position: fixed;
		top: 100px;
		left: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		cursor: grab;
		user-select: none;
		padding: 0.6rem;
		background: rgba(12, 18, 32, 0.6);
		border-radius: 2rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(8px);
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.3),
			0 0 0 1px rgba(255, 255, 255, 0.1);
	}

	.reader-container:active {
		cursor: grabbing;
	}

	.reader-btn {
		appearance: none;
		width: 2.5rem;
		height: 2.5rem;
		min-width: 2.5rem;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.25);
		background: rgba(28, 48, 88, 0.6);
		color: #d9ecff;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition:
			background 0.2s ease,
			border-color 0.2s ease;
		padding: 0;
		flex-shrink: 0;
	}

	.reader-btn:hover {
		background: rgba(48, 68, 128, 0.8);
		border-color: rgba(255, 255, 255, 0.4);
	}

	.play-btn {
		position: relative;
		z-index: 3;
		width: 2.75rem;
		height: 2.75rem;
		min-width: 2.75rem;
		background: rgba(74, 159, 216, 0.7);
		border-color: rgba(121, 176, 255, 0.4);
		transition:
			background 0.2s ease,
			border-color 0.2s ease,
			box-shadow 0.2s ease,
			transform 0.15s ease;
	}

	.play-btn:hover {
		background: rgba(94, 179, 236, 0.9);
		border-color: rgba(121, 176, 255, 0.6);
		box-shadow: 0 0 12px rgba(74, 159, 216, 0.4);
		transform: scale(1.05);
	}

	.play-btn:active {
		transform: scale(0.95);
	}

	.side-btn {
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: 1;
		opacity: 0;
		pointer-events: none;
		transform: translate(-50%, -50%);
		transition:
			transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
			opacity 0.2s ease;
	}

	.reader-container.controls-expanded .side-btn {
		opacity: 1;
		pointer-events: auto;
	}

	.reader-container.controls-expanded .prev-btn {
		transform: translate(calc(-50% - 3.1rem), -50%);
	}

	.reader-container.controls-expanded .next-btn {
		transform: translate(calc(-50% + 3.1rem), -50%);
	}

	:global(span.reader-current) {
		/* font-style: italic; */
		/* font-weight: 900; */
		color: white;
		text-shadow:
			0 0 8px rgba(255, 255, 255, 0.9),
			0 0 18px rgba(255, 255, 255, 0.55);
		/* text-decoration-color: rgba(74, 159, 216, 0.7);
		text-decoration-line: underline; */
	}

	.trash-overlay {
		position: fixed;
		top: 50%;
		left: 50%;

		transform: translate(-50%, -50%);
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
		width: min(33dvw, 33dvh);
		height: min(33dvw, 33dvh);
		border-radius: 50%;
		color: rgba(255, 100, 100, 0.4);
		transition: color 0.2s ease;
		pointer-events: none;
		padding: 50px;
	}

	.trash-overlay :global(svg) {
		width: min(33dvw, 33dvh);
		height: min(33dvw, 33dvh);
		max-width: 300px;
		max-height: 300px;
		background-color: rgba(255, 255, 255, 0.15);
		border-radius: 50%;
		padding: 50px;
	}

	.trash-overlay.trash-hovering {
		color: rgba(255, 100, 100, 0.9);
		text-shadow: 0 0 20px rgba(255, 100, 100, 0.5);
	}
</style>
