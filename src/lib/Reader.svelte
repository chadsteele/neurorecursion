<script>
	import {onMount} from "svelte"
	import {Play, Pause, ChevronLeft, ChevronRight, Trash2} from "lucide-svelte"
	import {splitIntoSentences as splitTextIntoSentences} from "$lib/utils/textSegmentation"

	let {
		voiceName = "",
		lang = "en-US",
		rate = 1.0,
		pitch = 1.05,
		volume = 1,
	} = $props()

	let ttsAvailable = $state(false)
	let speechAvailable = $state(false)
	let voices = $state([])
	let activeEngine = $state("webspeech")
	let isReading = $state(false)
	let isPaused = $state(false)
	let currentSpan = $state(null)
	let currentSegments = $state([])
	let currentSentenceIndex = $state(0)
	let position = $state({x: 0, y: 0})
	let isDragging = $state(false)
	let dragOffset = $state({x: 0, y: 0})
	let readerEl = $state(null)
	let hasSpeakSpans = $state(false)
	let isDeleted = $state(false)
	let trashHovering = $state(false)
	let speakTimeout = null
	let activeSpeechToken = 0
	let piperApi = null
	let piperLoadAttempted = false
	let piperLoadFailed = false
	let piperVoiceId = $state("")
	let piperSessionByVoice = new Map()
	let piperSessionInitPromise = new Map()
	let piperNextSegmentText = ""
	let piperNextSegmentPromise = null // Promise<Blob>
	let currentAudio = null
	let currentAudioUrl = ""
	let isGeneratingPiper = $state(false)
	let disableAutoScrollWhilePlaying = false
	let isProgrammaticScroll = false
	let programmaticScrollResetTimer = null
	let navigationDebounceTimer = null
	let pausedSpanAtPause = null
	let currentAudioSpan = null
	let lastTouchPos = {x: 0, y: 0}
	let touchStartPos = {x: 0, y: 0}
	let touchDragPending = false
	let activeButtonFeedback = $state("")
	let speakSpanObserver = null
	let buttonFeedbackTimer = null
	let showVolumeWarning = $state(false)
	let isSliding = $state(false)
	let showThoughtBubble = $state(false)
	let isIntroVisible = $state(false)
	let initialReaderTarget = $state(null)
	let hasRunIntro = $state(false)

	const VIEWPORT_PADDING_PX = 8
	const SIDE_REVEAL_REM = 3.1
	const SENTENCE_PAUSE_MS = 220
	const SPAN_PAUSE_MS = 420
	const NAVIGATION_READ_DEBOUNCE_MS = 700
	const PIPER_SEGMENT_PAUSE_MS = 0
	const PIPER_SPAN_PAUSE_MS = 100
	const PIPER_RATE_MULTIPLIER = 1.0
	const FEMALE_VOICE_HINTS = ["moira", "zira", "aria", "jenny", "female"]
	const READER_POSITION_STORAGE_KEY = "reader-floating-position"
	const READER_SPEED_STORAGE_KEY = "reader-playback-speed"
	const READER_BASE_LEFT_PX = 50
	const READER_BASE_TOP_PX = 100
	const TOUCH_DRAG_THRESHOLD_PX = 10
	const MIN_SPEED = 0.5
	const MAX_SPEED = 2.0
	const DEFAULT_SPEED = 1.0
	const SPEED_STEP = 0.1
	const BUTTON_FEEDBACK_MS = 220
	const DEFAULT_PIPER_VOICE_ID = "en_US-libritts_r-medium"
	const PIPER_WASM_PATHS = {
		onnxWasm: "/piper/onnx/",
		piperData: "/piper/phonemize/piper_phonemize.data",
		piperWasm: "/piper/phonemize/piper_phonemize.wasm",
	}
	const PIPER_PREFERRED_VOICE_IDS = [
		"en_US-libritts_r-high",
		"en_US-libritts_r-medium",
		"en_US-lessac-high",
		"en_US-lessac-medium",
		"en_US-ryan-high",
		"en_US-ryan-medium",
		"en_US-hfc_female-medium",
	]

	function getViewportRect() {
		if (typeof window === "undefined") {
			return {left: 0, top: 0, width: 0, height: 0}
		}

		if (window.visualViewport) {
			return {
				left: window.visualViewport.offsetLeft,
				top: window.visualViewport.offsetTop,
				width: window.visualViewport.width,
				height: window.visualViewport.height,
			}
		}

		return {
			left: 0,
			top: 0,
			width: window.innerWidth,
			height: window.innerHeight,
		}
	}

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

	function ts() {
		return `+${performance.now().toFixed(0)}ms`
	}

	function clampSpeed(nextRate) {
		const rounded = Math.round(nextRate * 10) / 10
		return Math.min(MAX_SPEED, Math.max(MIN_SPEED, rounded))
	}

	function applyCurrentAudioRate() {
		if (!currentAudio) return
		currentAudio.playbackRate = Math.min(
			Math.max(rate * PIPER_RATE_MULTIPLIER, MIN_SPEED),
			MAX_SPEED,
		)
	}

	function adjustSpeed(delta) {
		rate = clampSpeed(rate + delta)
		saveReaderSpeed(rate)
		applyCurrentAudioRate()
	}

	function resetSpeed() {
		rate = DEFAULT_SPEED
		saveReaderSpeed(rate)
		applyCurrentAudioRate()
	}

	function formatSpeedLabel(nextRate) {
		return Number(nextRate).toFixed(1)
	}

	function saveReaderSpeed(nextRate) {
		if (typeof window === "undefined") return

		window.localStorage.setItem(
			READER_SPEED_STORAGE_KEY,
			String(clampSpeed(nextRate)),
		)
	}

	function restoreReaderSpeed() {
		if (typeof window === "undefined") return

		const savedRate = window.localStorage.getItem(READER_SPEED_STORAGE_KEY)
		if (savedRate == null) return

		const parsedRate = Number(savedRate)
		if (Number.isNaN(parsedRate)) {
			window.localStorage.removeItem(READER_SPEED_STORAGE_KEY)
			return
		}

		rate = clampSpeed(parsedRate)
	}

	function splitIntoSentences(text) {
		return splitTextIntoSentences(text).map((text) => ({
			text,
			pauseAfter: SENTENCE_PAUSE_MS,
		}))
	}

	function clearSpeakTimeout() {
		if (speakTimeout) {
			clearTimeout(speakTimeout)
			speakTimeout = null
		}
	}

	function triggerButtonFeedback(buttonId) {
		activeButtonFeedback = buttonId

		if (buttonFeedbackTimer) {
			clearTimeout(buttonFeedbackTimer)
		}

		buttonFeedbackTimer = setTimeout(() => {
			activeButtonFeedback = ""
			buttonFeedbackTimer = null
		}, BUTTON_FEEDBACK_MS)
	}

	function isDocumentHidden() {
		if (typeof document === "undefined") return false
		return document.visibilityState === "hidden"
	}

	function scheduleContinuation(token, pauseAfter, continuation) {
		const shouldRunImmediately = pauseAfter <= 0 || isDocumentHidden()

		if (shouldRunImmediately) {
			speakTimeout = null
			queueMicrotask(() => {
				if (token !== activeSpeechToken || isPaused) return
				continuation()
			})
			return
		}

		speakTimeout = setTimeout(() => {
			speakTimeout = null
			if (token !== activeSpeechToken || isPaused) return
			continuation()
		}, pauseAfter)
	}

	function cleanupCurrentAudio() {
		if (currentAudio) {
			currentAudio.pause()
			currentAudio.src = ""
			currentAudio = null
		}

		currentAudioSpan = null

		if (currentAudioUrl) {
			URL.revokeObjectURL(currentAudioUrl)
			currentAudioUrl = ""
		}
	}

	function cancelAllSpeechEngines() {
		clearSpeakTimeout()
		cleanupCurrentAudio()
		isGeneratingPiper = false

		if (typeof window !== "undefined" && window.speechSynthesis) {
			window.speechSynthesis.cancel()
		}

		activeSpeechToken += 1
	}

	function clearNavigationDebounce() {
		if (navigationDebounceTimer) {
			clearTimeout(navigationDebounceTimer)
			navigationDebounceTimer = null
		}
	}

	function getPageOgImage() {
		if (typeof document === "undefined") return ""
		const meta = document.querySelector('meta[property="og:image"]')
		return meta?.getAttribute("content") || ""
	}

	function updateMediaSession(playbackState = "playing") {
		if (typeof navigator === "undefined" || !("mediaSession" in navigator))
			return

		const title =
			typeof document !== "undefined" ? document.title : "Neuro Recursion"
		const artwork = getPageOgImage()

		navigator.mediaSession.metadata = new MediaMetadata({
			title,
			artist: "Neuro Recursion Institute",
			album: "Clinical Trials",
			...(artwork ? {artwork: [{src: artwork, sizes: "512x512"}]} : {}),
		})

		navigator.mediaSession.playbackState = playbackState
	}

	function stopReading({clearHighlight = false} = {}) {
		clearNavigationDebounce()
		cancelAllSpeechEngines()
		piperNextSegmentText = ""
		piperNextSegmentPromise = null
		currentSegments = []
		currentSentenceIndex = 0
		isReading = false
		isPaused = false

		if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
			navigator.mediaSession.playbackState = "none"
		}

		if (clearHighlight) {
			currentSpan = null
			highlightSpan(null)
		}
	}

	function mapLangToPiperPrefix(langCode) {
		return (langCode || "en-US").replace("-", "_").toLowerCase()
	}

	function selectPiperVoiceId(availableVoiceIds) {
		if (voiceName && availableVoiceIds.includes(voiceName)) {
			return voiceName
		}

		for (const preferredVoiceId of PIPER_PREFERRED_VOICE_IDS) {
			if (availableVoiceIds.includes(preferredVoiceId)) {
				return preferredVoiceId
			}
		}

		const preferredPrefix = mapLangToPiperPrefix(lang)
		const langMatch = availableVoiceIds.find((voiceId) =>
			voiceId.toLowerCase().startsWith(preferredPrefix),
		)
		if (langMatch) return langMatch

		if (availableVoiceIds.includes(DEFAULT_PIPER_VOICE_ID)) {
			return DEFAULT_PIPER_VOICE_ID
		}

		return availableVoiceIds[0] || DEFAULT_PIPER_VOICE_ID
	}

	async function ensurePiperReady() {
		if (typeof window === "undefined") return false
		if (piperLoadAttempted) return !piperLoadFailed && Boolean(piperApi)

		piperLoadAttempted = true

		try {
			const module = await import("@realtimex/piper-tts-web")
			piperApi = module

			const voicesResult = await piperApi.voices?.()

			// voices() returns an array of objects; extract the string ID from
			// whichever property holds it (key > id > name)
			const extractId = (v) => {
				if (typeof v === "string") return v
				return v?.key ?? v?.id ?? v?.name ?? null
			}

			const availableVoiceIds = Array.isArray(voicesResult)
				? voicesResult.map(extractId).filter(Boolean)
				: voicesResult && typeof voicesResult === "object"
					? Object.keys(voicesResult)
					: []

			piperVoiceId = selectPiperVoiceId(availableVoiceIds)
			return true
		} catch (err) {
			console.error("[Reader] Piper load FAILED:", err)
			piperLoadFailed = true
			piperApi = null
			return false
		}
	}

	async function getPiperSessionForVoice(voiceId) {
		if (!piperApi?.TtsSession || !voiceId) return null

		if (piperSessionByVoice.has(voiceId)) {
			return piperSessionByVoice.get(voiceId)
		}

		if (piperSessionInitPromise.has(voiceId)) {
			return piperSessionInitPromise.get(voiceId)
		}

		// Force single-threading on the ort instance Piper uses internally.
		try {
			const ortEnv =
				piperApi?.env?.wasm ??
				piperApi?.ort?.env?.wasm ??
				globalThis?.ort?.env?.wasm
			if (ortEnv) ortEnv.numThreads = 1
		} catch {
			// best-effort
		}

		const promise = piperApi.TtsSession.create({
			voiceId,
			allowLocalModels: true,
			fallbackStrategy: "local",
			wasmPaths: PIPER_WASM_PATHS,
		}).then((session) => {
			piperSessionByVoice.set(voiceId, session)
			piperSessionInitPromise.delete(voiceId)
			return session
		})

		piperSessionInitPromise.set(voiceId, promise)
		return promise
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
		const viewport = getViewportRect()
		const horizontalSideSpace = remToPx(SIDE_REVEAL_REM)
		const verticalControlsSpace = remToPx(SIDE_REVEAL_REM)

		const minX =
			viewport.left +
			VIEWPORT_PADDING_PX +
			horizontalSideSpace -
			READER_BASE_LEFT_PX
		const maxX =
			viewport.left +
			viewport.width -
			rect.width -
			VIEWPORT_PADDING_PX -
			horizontalSideSpace -
			READER_BASE_LEFT_PX
		const minY = viewport.top + VIEWPORT_PADDING_PX - READER_BASE_TOP_PX
		const maxY =
			viewport.top +
			viewport.height -
			rect.height -
			VIEWPORT_PADDING_PX -
			verticalControlsSpace -
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

		if (!savedPosition) {
			initialReaderTarget = {x: 0, y: 0}
			return
		}

		try {
			const parsed = JSON.parse(savedPosition)
			if (
				typeof parsed?.x !== "number" ||
				typeof parsed?.y !== "number"
			) {
				return
			}

			initialReaderTarget = {x: parsed.x, y: parsed.y}
		} catch {
			window.localStorage.removeItem(READER_POSITION_STORAGE_KEY)
			initialReaderTarget = {x: 0, y: 0}
		}
	}

	function getFurthestCornerFrom(target) {
		const viewport = getViewportRect()
		const readerWidth = readerEl?.offsetWidth ?? 60
		const readerHeight = readerEl?.offsetHeight ?? 60

		const minX = viewport.left + VIEWPORT_PADDING_PX - READER_BASE_LEFT_PX
		const maxX =
			viewport.left +
			viewport.width -
			readerWidth -
			VIEWPORT_PADDING_PX -
			READER_BASE_LEFT_PX
		const minY = viewport.top + VIEWPORT_PADDING_PX - READER_BASE_TOP_PX
		const maxY =
			viewport.top +
			viewport.height -
			readerHeight -
			VIEWPORT_PADDING_PX -
			READER_BASE_TOP_PX

		const oppositeX = target.x < (minX + maxX) / 2 ? maxX : minX
		const oppositeY = target.y < (minY + maxY) / 2 ? maxY : minY

		return clampDragPosition(oppositeX, oppositeY)
	}

	$effect(() => {
		if (typeof window === "undefined") return
		if (!readerEl || !ttsAvailable || !hasSpeakSpans) return
		if (!initialReaderTarget || hasRunIntro) return

		hasRunIntro = true

		const target = clampDragPosition(
			initialReaderTarget.x,
			initialReaderTarget.y,
		)
		const start = getFurthestCornerFrom(target)

		showThoughtBubble = false
		isSliding = false
		position = start
		isIntroVisible = true

		requestAnimationFrame(() => {
			// Ensure the start position is painted before enabling transition.
			requestAnimationFrame(() => {
				isSliding = true
				position = target
				saveReaderPosition(target)

				setTimeout(() => {
					isSliding = false
					showThoughtBubble = true
					setTimeout(() => {
						showThoughtBubble = false
					}, 4000)
				}, 900)
			})
		})
	})

	function handleViewportChange() {
		syncReaderPositionToViewport({persist: true})
	}

	const SPEAK_SEGMENT_SELECTOR = 'span.speak, [data-speak-segment="true"]'

	function findAllSpeakSpans() {
		return Array.from(
			document.querySelectorAll(SPEAK_SEGMENT_SELECTOR),
		).filter((span) => {
			if (span.closest("button")) return false

			// If this element is inside another explicit speak segment,
			// keep only the outer segment to avoid duplicate reads/highlights.
			const parentSegment = span.parentElement?.closest(
				'[data-speak-segment="true"]',
			)
			if (parentSegment && parentSegment !== span) return false

			return true
		})
	}

	function refreshSpeakSpanPresence() {
		hasSpeakSpans = findAllSpeakSpans().length > 0

		if (!hasSpeakSpans && isReading) {
			stopReading({clearHighlight: true})
		}
	}

	function isSpanInView(span) {
		if (!span) return false
		const rect = span.getBoundingClientRect()
		return rect.top < window.innerHeight && rect.bottom > 0
	}

	function findFirstVisibleSpeak() {
		const spans = findAllSpeakSpans()
		if (!spans.length) return null

		const viewportHeight = window.innerHeight || 0
		const viewportWidth = window.innerWidth || 0
		const targetY = viewportHeight * 0.4
		let bestFullyVisible = null
		let bestPartiallyVisible = null

		for (let index = 0; index < spans.length; index += 1) {
			const span = spans[index]
			const rect = span.getBoundingClientRect()

			const visibleTop = Math.max(rect.top, 0)
			const visibleBottom = Math.min(rect.bottom, viewportHeight)
			const visibleHeight = visibleBottom - visibleTop

			const visibleLeft = Math.max(rect.left, 0)
			const visibleRight = Math.min(rect.right, viewportWidth)
			const visibleWidth = visibleRight - visibleLeft

			if (visibleHeight <= 0 || visibleWidth <= 0) continue

			const centerY = rect.top + rect.height / 2
			const candidate = {
				span,
				distanceToTarget: Math.abs(centerY - targetY),
				visibleHeight,
				index,
			}

			const isFullyVisible =
				rect.top >= 0 &&
				rect.bottom <= viewportHeight &&
				rect.left >= 0 &&
				rect.right <= viewportWidth

			const isBetterCandidate = (currentBest, next) => {
				if (!currentBest) return true
				if (next.distanceToTarget !== currentBest.distanceToTarget) {
					return next.distanceToTarget < currentBest.distanceToTarget
				}
				if (next.visibleHeight !== currentBest.visibleHeight) {
					return next.visibleHeight > currentBest.visibleHeight
				}
				return next.index < currentBest.index
			}

			if (isFullyVisible) {
				if (isBetterCandidate(bestFullyVisible, candidate)) {
					bestFullyVisible = candidate
				}
				continue
			}

			if (isBetterCandidate(bestPartiallyVisible, candidate)) {
				bestPartiallyVisible = candidate
			}
		}

		return bestFullyVisible?.span || bestPartiallyVisible?.span || spans[0]
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
		const currentHighlighted = document.querySelector(".reader-current")
		if (currentHighlighted && currentHighlighted !== span) {
			currentHighlighted.classList.remove("reader-current")
		}

		if (span) {
			span.classList.add("reader-current")
			return
		}
	}

	function ensureSpanInView(span) {
		if (!span) return
		if (isReading && !isPaused && disableAutoScrollWhilePlaying) return

		isProgrammaticScroll = true
		if (programmaticScrollResetTimer) {
			clearTimeout(programmaticScrollResetTimer)
		}
		programmaticScrollResetTimer = setTimeout(() => {
			isProgrammaticScroll = false
			programmaticScrollResetTimer = null
		}, 1200)

		span.scrollIntoView({
			behavior: "smooth",
			block: "center",
			inline: "nearest",
		})
	}

	function handleUserScrollIntent() {
		if (!isReading || isPaused) return
		if (isProgrammaticScroll) return
		disableAutoScrollWhilePlaying = true
	}

	function handleScrollKeydown(e) {
		if (!isReading || isPaused) return
		if (isProgrammaticScroll) return

		const key = e.key
		if (
			key === "PageUp" ||
			key === "PageDown" ||
			key === "Home" ||
			key === "End"
		) {
			disableAutoScrollWhilePlaying = true
		}
	}

	function isEditableTarget(target) {
		if (!(target instanceof HTMLElement)) return false
		if (target.isContentEditable) return true
		const tag = target.tagName
		return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
	}

	function handleReaderHotkeys(e) {
		if (!ttsAvailable) return
		if (isEditableTarget(e.target)) return

		if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
			e.preventDefault()
			gotoPrev()
			return
		}

		if (e.key === "ArrowRight" || e.key === "ArrowDown") {
			e.preventDefault()
			gotoNext()
			return
		}

		if (e.key === " ") {
			e.preventDefault()
			togglePlay()
		}
	}

	function setCurrentSpanSelection(span) {
		if (!span) return
		currentSpan = span
		highlightSpan(span)
		ensureSpanInView(span)
	}

	function handleNavigatedSelection(span, shouldResumeReading) {
		// 1) interrupt playback/piper work right away
		// 2) invalidate token via cancelAllSpeechEngines()
		// 3) drop stale prefetch references so old results are ignored
		clearNavigationDebounce()
		cancelAllSpeechEngines()
		piperNextSegmentText = ""
		piperNextSegmentPromise = null

		if (!shouldResumeReading) return

		navigationDebounceTimer = setTimeout(() => {
			navigationDebounceTimer = null
			if (currentSpan === span && !isPaused) {
				beginReadingCurrentSpan()
			}
		}, NAVIGATION_READ_DEBOUNCE_MS)
	}

	function getAdjacentSpanFromHighlight(direction) {
		const spans = findAllSpeakSpans()
		if (!spans.length) return null

		const highlighted = document.querySelector(".reader-current")
		let index = spans.indexOf(highlighted)

		if (index === -1) {
			index = spans.indexOf(currentSpan)
		}

		if (index === -1) {
			const firstVisible = findFirstVisibleSpeak()
			index = spans.indexOf(firstVisible)
		}

		if (index === -1) return null

		const nextIndex = index + direction
		if (nextIndex < 0 || nextIndex >= spans.length) return null

		return spans[nextIndex]
	}

	/**
	 * Returns the text to be spoken for an element, respecting data-speak overrides.
	 * Elements with a data-speak attribute substitute their attribute value for their
	 * inner text, allowing display text (e.g. "aka") to differ from spoken text
	 * (e.g. "also known as").
	 */
	/**
	 * Title abbreviations that cause Piper to insert a prosodic pause at the
	 * period even though they are not sentence boundaries. Replacing them with
	 * their full spoken forms before synthesis eliminates the pause.
	 * Keys must be lowercase; the regex built below is case-insensitive.
	 */
	const TITLE_ABBREV_MAP = /** @type {Record<string,string>} */ ({
		"dr.": "Doctor",
		"mr.": "Mister",
		"mrs.": "Missus",
		"ms.": "Miss",
		"prof.": "Professor",
		"rev.": "Reverend",
		"sr.": "Senior",
		"jr.": "Junior",
		"st.": "Saint",
		"vs.": "versus",
		"gov.": "Governor",
		"gen.": "General",
		"sgt.": "Sergeant",
		"capt.": "Captain",
		"lt.": "Lieutenant",
		"col.": "Colonel",
		"cmdr.": "Commander",
		"atty.": "Attorney",
		"rep.": "Representative",
		"sen.": "Senator",
		"dept.": "Department",
		"corp.": "Corporation",
		"inc.": "Incorporated",
		"est.": "Established",
		"approx.": "approximately",
	})

	const TITLE_ABBREV_RE = new RegExp(
		`(?<![\\w])(${Object.keys(TITLE_ABBREV_MAP)
			.sort((a, b) => b.length - a.length)
			.map((k) => k.replace(/\./g, "\\."))
			.join("|")})(?=\\s|$)`,
		"gi",
	)

	/**
	 * Expands title abbreviations (Dr., Mr., etc.) in raw spoken text so that
	 * Piper does not insert a prosodic pause at the period.
	 */
	function expandTitleAbbreviations(text) {
		return text.replace(TITLE_ABBREV_RE, (match) => {
			return TITLE_ABBREV_MAP[match.toLowerCase()] ?? match
		})
	}

	/**
	 * Returns the text to be spoken for an element.
	 * If the element itself has a data-speak attribute, that value is returned
	 * directly (short-circuits recursion). Otherwise, child nodes are walked:
	 * text nodes contribute their textContent; element nodes recurse.
	 * Title abbreviations are expanded to avoid Piper prosodic pauses.
	 * Note: SSML inline emphasis tags are intentionally not emitted here —
	 * Piper inserts a prosodic boundary pause at every element edge, which
	 * makes emphasized words sound more awkward, not less.
	 */
	function getSpokenText(el) {
		// Short-circuit: the element itself declares what to speak.
		const selfOverride = el.getAttribute?.("data-speak")
		if (selfOverride !== null && selfOverride !== undefined) {
			return expandTitleAbbreviations(selfOverride)
		}

		let result = ""
		for (const node of el.childNodes) {
			if (node.nodeType === Node.TEXT_NODE) {
				result += node.textContent ?? ""
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				result += getSpokenText(node)
			}
		}
		return expandTitleAbbreviations(result)
	}

	function beginReadingCurrentSpan() {
		if (!ttsAvailable || !currentSpan) return
		clearNavigationDebounce()

		cancelAllSpeechEngines()

		const span = currentSpan
		currentSegments = splitIntoSentences(getSpokenText(span))
		currentSentenceIndex = 0

		// Preserve an in-flight prefetch if it already matches the first segment
		// of this span (fired by the previous span's cross-span lookahead).
		const incomingFirstText = currentSegments[0]?.text ?? ""
		if (piperNextSegmentText !== incomingFirstText) {
			piperNextSegmentText = ""
			piperNextSegmentPromise = null
		}

		if (!currentSegments.length) {
			const nextSpan = findNextSpeak(span)
			if (nextSpan) {
				setCurrentSpanSelection(nextSpan)
				beginReadingCurrentSpan()
			} else {
				stopReading({clearHighlight: true})
			}
			return
		}

		isReading = true
		isPaused = false

		updateMediaSession("playing")

		if (activeEngine === "piper") {
			void (async () => {
				try {
					const preferredVoice =
						piperVoiceId || DEFAULT_PIPER_VOICE_ID
					const session =
						await getPiperSessionForVoice(preferredVoice)
					const firstText = currentSegments[0]?.text
					if (
						session &&
						firstText &&
						piperNextSegmentText !== firstText
					) {
						piperNextSegmentText = firstText
						piperNextSegmentPromise = session.predict(firstText)
					}
				} catch {
					// Best-effort warmup only.
				}
			})()
		}

		speakCurrentSentence(activeSpeechToken)
	}

	function scheduleNextSegment(token, pauseAfter) {
		scheduleContinuation(token, pauseAfter, () => {
			speakCurrentSentence(token)
		})
	}

	async function speakCurrentSentenceWithPiper(segment, token) {
		if (!piperApi) return false

		isGeneratingPiper = true
		let wavBlob = null

		const voiceCandidates = [piperVoiceId]
		if (
			piperVoiceId !== DEFAULT_PIPER_VOICE_ID &&
			!voiceCandidates.includes(DEFAULT_PIPER_VOICE_ID)
		) {
			voiceCandidates.push(DEFAULT_PIPER_VOICE_ID)
		}

		for (const candidateVoiceId of voiceCandidates) {
			if (!candidateVoiceId) continue

			try {
				const session = await getPiperSessionForVoice(candidateVoiceId)
				if (!session) throw new Error("Piper session unavailable")

				if (
					piperNextSegmentText === segment.text &&
					piperNextSegmentPromise
				) {
					wavBlob = await piperNextSegmentPromise
				} else {
					wavBlob = await session.predict(segment.text)
				}

				piperNextSegmentText = ""
				piperNextSegmentPromise = null

				// Determine the next text to synthesize:
				// — next sentence within this span, or
				// — first sentence of the next span (cross-span lookahead)
				let nextTextToPrefetch = null
				const nextInSpan = currentSegments[currentSentenceIndex + 1]
				if (nextInSpan?.text) {
					nextTextToPrefetch = nextInSpan.text
				} else {
					const nextSpan = findNextSpeak(currentSpan)
					if (nextSpan) {
						const nextSpanSegs = splitIntoSentences(
							getSpokenText(nextSpan),
						)
						nextTextToPrefetch = nextSpanSegs[0]?.text ?? null
					}
				}

				// Start synthesis immediately — the session is now free,
				// and audio playback happens in parallel while it runs.
				if (nextTextToPrefetch && token === activeSpeechToken) {
					piperNextSegmentText = nextTextToPrefetch
					piperNextSegmentPromise =
						session.predict(nextTextToPrefetch)
				}

				piperVoiceId = candidateVoiceId
				break
			} catch (err) {
				console.error(
					`[Reader] ${ts()} predict FAILED for voice: ${candidateVoiceId}`,
					err,
				)
				wavBlob = null
			}
		}

		isGeneratingPiper = false

		if (!wavBlob) return false
		if (token !== activeSpeechToken) return true

		cleanupCurrentAudio()
		currentAudioSpan = currentSpan
		currentAudioUrl = URL.createObjectURL(wavBlob)
		currentAudio = new Audio(currentAudioUrl)
		currentAudio.volume = Math.min(Math.max(volume, 0), 1)
		applyCurrentAudioRate()

		if (!isPaused) {
			try {
				await currentAudio.play()
			} catch {
				return false
			}
		}

		if (isPaused) return true

		await new Promise((resolve) => {
			const onDone = () => {
				currentAudio?.removeEventListener("ended", onDone)
				currentAudio?.removeEventListener("error", onDone)
				resolve()
			}

			currentAudio?.addEventListener("ended", onDone, {once: true})
			currentAudio?.addEventListener("error", onDone, {once: true})
		})

		return true
	}

	function speakCurrentSentence(token = activeSpeechToken) {
		if (
			!ttsAvailable ||
			token !== activeSpeechToken ||
			!currentSegments.length ||
			currentSentenceIndex >= currentSegments.length
		) {
			return
		}

		const segment = currentSegments[currentSentenceIndex]
		if (activeEngine === "piper") {
			void (async () => {
				const ok = await speakCurrentSentenceWithPiper(segment, token)

				if (token !== activeSpeechToken || isPaused) return

				if (!ok) {
					console.warn(
						"[Reader] Piper failed, falling back. speechAvailable:",
						speechAvailable,
					)
					activeEngine = speechAvailable ? "webspeech" : "piper"
					if (activeEngine === "webspeech") {
						speakCurrentSentence(token)
						return
					}

					stopReading({clearHighlight: true})
					return
				}

				currentSentenceIndex += 1

				if (currentSentenceIndex >= currentSegments.length) {
					cleanupCurrentAudio()
					const nextSpan = findNextSpeak(currentSpan)
					if (nextSpan) {
						const nextSpanPause =
							activeEngine === "piper"
								? PIPER_SPAN_PAUSE_MS
								: SPAN_PAUSE_MS
						scheduleContinuation(token, nextSpanPause, () => {
							startReadingFromSpan(nextSpan)
						})
					} else {
						stopReading({clearHighlight: true})
					}
					return
				}

				scheduleNextSegment(token, PIPER_SEGMENT_PAUSE_MS)
			})()
			return
		}

		if (!speechAvailable) {
			stopReading({clearHighlight: true})
			return
		}

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
					scheduleContinuation(token, SPAN_PAUSE_MS, () => {
						startReadingFromSpan(nextSpan)
					})
				} else {
					stopReading({clearHighlight: true})
				}
				return
			}

			scheduleNextSegment(token, segment.pauseAfter)
		}

		utterance.onerror = () => {
			if (token !== activeSpeechToken) return
			stopReading({clearHighlight: true})
		}

		window.speechSynthesis.speak(utterance)
	}

	function startReadingFromSpan(span) {
		if (!ttsAvailable) return
		if (!span) {
			stopReading({clearHighlight: true})
			return
		}
		setCurrentSpanSelection(span)
		beginReadingCurrentSpan()
	}

	function pauseReading() {
		if (!ttsAvailable || !isReading || isPaused) return
		disableAutoScrollWhilePlaying = false
		pausedSpanAtPause = currentSpan
		updateMediaSession("paused")

		if (speakTimeout) {
			clearSpeakTimeout()
			isPaused = true
			return
		}

		if (activeEngine === "piper") {
			if (currentAudio && !currentAudio.paused) {
				currentAudio.pause()
			}
			isPaused = true
			return
		}

		if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
			window.speechSynthesis.pause()
		}

		isPaused = true
	}

	function resumeReading() {
		if (!ttsAvailable || !isReading || !isPaused) return
		isPaused = false
		pausedSpanAtPause = null
		updateMediaSession("playing")

		if (!isSpanInView(currentSpan)) {
			const visible = findFirstVisibleSpeak()
			if (visible) {
				startReadingFromSpan(visible)
				return
			}
		}

		ensureSpanInView(currentSpan)

		if (activeEngine === "piper") {
			if (currentAudio && currentAudio.paused) {
				if (currentAudioSpan && currentAudioSpan !== currentSpan) {
					startReadingFromSpan(currentSpan)
					return
				}
				void currentAudio.play().catch(() => {
					activeEngine = speechAvailable ? "webspeech" : "piper"
					if (activeEngine === "webspeech") {
						speakCurrentSentence(activeSpeechToken)
					}
				})
				return
			}

			if (!isGeneratingPiper) {
				speakCurrentSentence(activeSpeechToken)
			}
			return
		}

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

		if (volume < 0.05) {
			showVolumeWarning = true
			return
		}

		const firstVisible = findFirstVisibleSpeak()
		if (firstVisible) {
			startReadingFromSpan(firstVisible)
		}
	}

	function gotoPrev() {
		triggerButtonFeedback("prev")
		disableAutoScrollWhilePlaying = false
		const prevSpan = getAdjacentSpanFromHighlight(-1)
		if (!prevSpan) return

		const shouldResumeReading = isReading && !isPaused

		// Pure, immediate UI selection path.
		setCurrentSpanSelection(prevSpan)

		// Separate processing pipeline path.
		handleNavigatedSelection(prevSpan, shouldResumeReading)
	}

	function gotoNext() {
		triggerButtonFeedback("next")
		disableAutoScrollWhilePlaying = false
		const nextSpan = getAdjacentSpanFromHighlight(1)
		if (!nextSpan) return

		const shouldResumeReading = isReading && !isPaused

		// Pure, immediate UI selection path.
		setCurrentSpanSelection(nextSpan)

		// Separate processing pipeline path.
		handleNavigatedSelection(nextSpan, shouldResumeReading)
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
		if (isDragging && isPointOverTrash(e.clientX, e.clientY)) {
			isDeleted = true
			stopReading({clearHighlight: true})
		} else if (isDragging) {
			saveReaderPosition(position)
		}

		isDragging = false
		trashHovering = false
	}

	function isPointOverTrash(x, y) {
		const trashCenter = {
			x: window.innerWidth / 2,
			y: window.innerHeight / 2,
		}

		const distance = Math.sqrt(
			Math.pow(x - trashCenter.x, 2) + Math.pow(y - trashCenter.y, 2),
		)

		const trashRadiusPx =
			(Math.min(window.innerWidth, window.innerHeight) * 0.33) / 2

		return distance < trashRadiusPx
	}

	function handleMouseMoveTrash(e) {
		if (isDragging) {
			trashHovering = isPointOverTrash(e.clientX, e.clientY)
		}
	}

	function handleTouchStart(e) {
		if (e.touches.length !== 1) return
		const touch = e.touches[0]
		isDragging = false
		touchDragPending = true
		lastTouchPos = {x: touch.clientX, y: touch.clientY}
		touchStartPos = {x: touch.clientX, y: touch.clientY}
		dragOffset = {
			x: touch.clientX - position.x,
			y: touch.clientY - position.y,
		}
	}

	function handleTouchMove(e) {
		if (!isDragging && touchDragPending) {
			const touch = e.touches[0]
			const dx = touch.clientX - touchStartPos.x
			const dy = touch.clientY - touchStartPos.y
			const movedDistance = Math.hypot(dx, dy)

			if (movedDistance < TOUCH_DRAG_THRESHOLD_PX) {
				handleUserScrollIntent()
				return
			}

			isDragging = true
		}

		if (!isDragging) {
			handleUserScrollIntent()
			return
		}
		e.preventDefault()
		const touch = e.touches[0]
		lastTouchPos = {x: touch.clientX, y: touch.clientY}
		const nextX = touch.clientX - dragOffset.x
		const nextY = touch.clientY - dragOffset.y
		position = clampDragPosition(nextX, nextY)
		trashHovering = isPointOverTrash(touch.clientX, touch.clientY)
	}

	function handleTouchEnd() {
		touchDragPending = false
		if (isDragging) {
			if (isPointOverTrash(lastTouchPos.x, lastTouchPos.y)) {
				isDeleted = true
				stopReading({clearHighlight: true})
			} else {
				saveReaderPosition(position)
			}
		}
		isDragging = false
		trashHovering = false
	}

	function handleScroll() {
		if (isReading && !isPaused) {
			return
		}

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

		if (speechAvailable) {
			loadVoices()
			window.speechSynthesis.onvoiceschanged = loadVoices
		}

		void (async () => {
			const piperReady = await ensurePiperReady()
			ttsAvailable = piperReady || speechAvailable
			activeEngine = piperReady ? "piper" : "webspeech"
		})()

		refreshSpeakSpanPresence()
		speakSpanObserver = new MutationObserver(() => {
			refreshSpeakSpanPresence()
		})
		speakSpanObserver.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ["class"],
		})

		restoreReaderPosition()
		restoreReaderSpeed()

		// Register persistent Media Session action handlers for lock screen / background controls
		if ("mediaSession" in navigator) {
			navigator.mediaSession.setActionHandler("play", () => {
				if (isPaused) resumeReading()
				else if (!isReading) startReadingFromSpan(currentSpan)
			})
			navigator.mediaSession.setActionHandler("pause", () => {
				pauseReading()
			})
			navigator.mediaSession.setActionHandler("previoustrack", () => {
				const prev = findPrevSpeak(currentSpan)
				if (prev) startReadingFromSpan(prev)
			})
			navigator.mediaSession.setActionHandler("nexttrack", () => {
				const next = findNextSpeak(currentSpan)
				if (next) startReadingFromSpan(next)
			})
		}

		window.addEventListener("mousemove", handleMouseMove)
		window.addEventListener("mousemove", handleMouseMoveTrash)
		window.addEventListener("mouseup", handleMouseUp)
		window.addEventListener("touchmove", handleTouchMove, {passive: false})
		window.addEventListener("touchend", handleTouchEnd)
		window.addEventListener("scroll", handleScroll)
		window.addEventListener("wheel", handleUserScrollIntent, {
			passive: true,
		})
		window.addEventListener("keydown", handleScrollKeydown)
		window.addEventListener("keydown", handleReaderHotkeys)
		window.addEventListener("resize", handleViewportChange)
		window.addEventListener("orientationchange", handleViewportChange)

		if (window.visualViewport) {
			window.visualViewport.addEventListener(
				"resize",
				handleViewportChange,
			)
			window.visualViewport.addEventListener(
				"scroll",
				handleViewportChange,
			)
		}

		return () => {
			clearNavigationDebounce()
			speakSpanObserver?.disconnect()
			speakSpanObserver = null
			window.removeEventListener("mousemove", handleMouseMove)
			window.removeEventListener("mousemove", handleMouseMoveTrash)
			window.removeEventListener("mouseup", handleMouseUp)
			window.removeEventListener("touchmove", handleTouchMove)
			window.removeEventListener("touchend", handleTouchEnd)
			window.removeEventListener("scroll", handleScroll)
			window.removeEventListener("wheel", handleUserScrollIntent)
			window.removeEventListener("keydown", handleScrollKeydown)
			window.removeEventListener("keydown", handleReaderHotkeys)
			window.removeEventListener("resize", handleViewportChange)
			window.removeEventListener(
				"orientationchange",
				handleViewportChange,
			)
			if (window.visualViewport) {
				window.visualViewport.removeEventListener(
					"resize",
					handleViewportChange,
				)
				window.visualViewport.removeEventListener(
					"scroll",
					handleViewportChange,
				)
			}
			if (programmaticScrollResetTimer) {
				clearTimeout(programmaticScrollResetTimer)
				programmaticScrollResetTimer = null
			}
			if (buttonFeedbackTimer) {
				clearTimeout(buttonFeedbackTimer)
				buttonFeedbackTimer = null
			}
			stopReading({clearHighlight: true})
			if (speechAvailable && window.speechSynthesis) {
				window.speechSynthesis.onvoiceschanged = null
			}
		}
	})
</script>

{#if ttsAvailable && !isDeleted && hasSpeakSpans}
	{#if showVolumeWarning}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_interactive_supports_focus -->
		<div
			class="volume-warning-backdrop"
			role="dialog"
			aria-modal="true"
			aria-label="Volume too low"
			tabindex="-1"
			onclick={() => (showVolumeWarning = false)}
		>
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<div class="volume-warning-box">
				<p>Your volume appears to be off or very low.</p>
				<p>Please turn up your device volume to hear the audio.</p>
				<button
					class="volume-warning-ok"
					onclick={() => {
						showVolumeWarning = false
						const firstVisible = findFirstVisibleSpeak()
						if (firstVisible) startReadingFromSpan(firstVisible)
					}}>Play anyway</button
				>
				<button
					class="volume-warning-dismiss"
					onclick={() => (showVolumeWarning = false)}>Dismiss</button
				>
			</div>
		</div>
	{/if}
	{#if isDragging}
		<div class="trash-overlay" class:trash-hovering={trashHovering}>
			<Trash2 strokeWidth={1.5} />
		</div>
	{/if}

	<div
		class="reader-container"
		class:controls-expanded={isReading && !isPaused}
		class:sliding-in={isSliding}
		class:intro-hidden={!isIntroVisible}
		role="button"
		tabindex="0"
		bind:this={readerEl}
		style="transform: translate({position.x}px, {position.y}px)"
		onmousedown={handleMouseDown}
		ontouchstart={handleTouchStart}
	>
		{#if showThoughtBubble}
			<div class="thought-bubble">I can read it for you</div>
		{/if}
		{#if isReading}
			<button
				class="reader-btn side-btn prev-btn"
				class:bounce-left={activeButtonFeedback === "prev"}
				onclick={gotoPrev}
				title="Previous span"
				aria-label="Previous"
			>
				<span class="reader-btn-content">
					<ChevronLeft size={18} strokeWidth={2} />
				</span>
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
				<Pause
					size={20}
					strokeWidth={1.5}
					class={isGeneratingPiper ? "spin-wait" : ""}
				/>
			{:else}
				<Play size={20} strokeWidth={1.5} />
			{/if}
		</button>

		{#if isReading}
			<button
				class="reader-btn side-btn next-btn"
				class:bounce-right={activeButtonFeedback === "next"}
				onclick={gotoNext}
				title="Next span"
				aria-label="Next"
			>
				<span class="reader-btn-content">
					<ChevronRight size={18} strokeWidth={2} />
				</span>
			</button>
		{/if}

		<button
			class="reader-btn side-btn speed-btn speed-down-btn"
			class:bounce-left={activeButtonFeedback === "speed-down"}
			onclick={() => {
				triggerButtonFeedback("speed-down")
				adjustSpeed(-SPEED_STEP)
			}}
			title="Decrease speed"
			aria-label="Decrease speed"
		>
			<span class="reader-btn-content">-</span>
		</button>

		<button
			class="reader-btn side-btn speed-btn speed-reset-btn"
			onclick={resetSpeed}
			title="Reset speed"
			aria-label="Reset speed"
		>
			<span class="reader-btn-content">{formatSpeedLabel(rate)}</span>
		</button>

		<button
			class="reader-btn side-btn speed-btn speed-up-btn"
			class:bounce-right={activeButtonFeedback === "speed-up"}
			onclick={() => {
				triggerButtonFeedback("speed-up")
				adjustSpeed(SPEED_STEP)
			}}
			title="Increase speed"
			aria-label="Increase speed"
		>
			<span class="reader-btn-content">+</span>
		</button>
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

	.reader-container.sliding-in {
		transition: transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.reader-container.intro-hidden {
		opacity: 0;
		pointer-events: none;
	}

	.thought-bubble {
		position: absolute;
		bottom: calc(100% + 0.6rem);
		left: 50%;
		transform: translateX(-50%);
		font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande",
			"Lucida Sans", Arial, sans-serif;
		white-space: nowrap;
		background: var(--button-bg, #fff);
		color: var(--text-primary, #111);
		border: 1px solid var(--border-color, #ccc);
		border-radius: 1rem;
		padding: 0.45rem 0.9rem;
		font-size: 0.8rem;
		box-shadow: 0 4px 12px var(--shadow-medium, rgba(0, 0, 0, 0.15));
		animation:
			bubble-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both,
			bubble-out 0.3s ease-in 3.7s both;
		pointer-events: none;
		z-index: 10;
	}

	.thought-bubble::after {
		content: "";
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 6px solid transparent;
		border-top-color: var(--border-color, #ccc);
	}

	.thought-bubble::before {
		content: "";
		position: absolute;
		top: calc(100% - 1px);
		left: 50%;
		transform: translateX(-50%);
		border: 6px solid transparent;
		border-top-color: var(--button-bg, #fff);
		z-index: 1;
	}

	@keyframes bubble-in {
		from {
			opacity: 0;
			transform: translateX(-50%) scale(0.7);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) scale(1);
		}
	}

	@keyframes bubble-out {
		from {
			opacity: 1;
			transform: translateX(-50%) scale(1);
		}
		to {
			opacity: 0;
			transform: translateX(-50%) scale(0.7);
		}
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

	.reader-btn-content {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
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

	.play-btn :global(svg.spin-wait) {
		animation: spin-wait 0.9s linear infinite;
	}

	@keyframes spin-wait {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
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

	.reader-btn.bounce-left .reader-btn-content {
		animation: bounce-left 0.22s ease-out;
	}

	.reader-btn.bounce-right .reader-btn-content {
		animation: bounce-right 0.22s ease-out;
	}

	@keyframes bounce-left {
		0% {
			transform: translateX(0);
		}

		35% {
			transform: translateX(-0.26rem);
		}

		70% {
			transform: translateX(0.12rem);
		}

		100% {
			transform: translateX(0);
		}
	}

	@keyframes bounce-right {
		0% {
			transform: translateX(0);
		}

		35% {
			transform: translateX(0.26rem);
		}

		70% {
			transform: translateX(-0.12rem);
		}

		100% {
			transform: translateX(0);
		}
	}

	.speed-btn {
		font-weight: 700;
		font-size: 0.8rem;
		line-height: 1;
		width: 2.1rem;
		height: 2.1rem;
		min-width: 2.1rem;
		background: rgba(128, 128, 128, 0.14);
		border-color: rgba(128, 128, 128, 0.22);
	}

	.speed-reset-btn {
		min-width: 2.5rem;
		width: auto;
		padding: 0 0.45rem;
		font-size: 0.72rem;
		background: transparent;
		border-color: transparent;
	}

	.speed-reset-btn:hover {
		background: transparent;
		border-color: transparent;
	}

	.reader-container.controls-expanded .speed-down-btn {
		transform: translate(calc(-50% - 2.3rem), calc(-50% + 2.5rem));
	}

	.reader-container.controls-expanded .speed-reset-btn {
		transform: translate(-50%, calc(-50% + 2.5rem));
	}

	.reader-container.controls-expanded .speed-up-btn {
		transform: translate(calc(-50% + 2.3rem), calc(-50% + 2.5rem));
	}

	:global(.reader-current) {
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
		--trash-size: min(33dvw, 33dvh);
		position: fixed;
		top: 50%;
		left: 50%;

		transform: translate(-50%, -50%);
		z-index: 2001;
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--trash-size);
		height: var(--trash-size);
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		color: rgba(255, 100, 100, 0.4);
		transition: color 0.2s ease;
		pointer-events: none;
		padding: 50px;
	}

	.volume-warning-backdrop {
		position: fixed;
		inset: 0;
		z-index: 2000;
		background: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(4px);
	}

	.volume-warning-box {
		background: var(--button-bg, #fff);
		color: var(--text-primary, #111);
		border: 1px solid var(--border-color, #ccc);
		border-radius: 1rem;
		padding: 1.5rem 2rem;
		max-width: 22rem;
		text-align: center;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.volume-warning-box p {
		margin: 0;
		line-height: 1.5;
	}

	.volume-warning-ok,
	.volume-warning-dismiss {
		appearance: none;
		border-radius: 2rem;
		padding: 0.5rem 1.25rem;
		cursor: pointer;
		font-size: 0.9rem;
		transition: background 0.2s ease;
	}

	.volume-warning-ok {
		background: var(--button-hover-bg, #333);
		color: var(--text-primary, #111);
		border: 1px solid var(--border-hover, #999);
	}

	.volume-warning-dismiss {
		background: transparent;
		color: var(--text-muted, #666);
		border: 1px solid var(--border-color, #ccc);
	}

	.trash-overlay :global(svg) {
		width: var(--trash-size);
		height: var(--trash-size);
		aspect-ratio: 1 / 1;
		max-width: 300px;
		max-height: 300px;
		display: block;
		box-sizing: border-box;
		background-color: rgba(255, 255, 255, 0.15);
		border-radius: 50%;
		padding: 50px;
	}

	.trash-overlay.trash-hovering {
		color: rgba(255, 100, 100, 0.9);
		text-shadow: 0 0 20px rgba(255, 100, 100, 0.5);
	}
</style>
