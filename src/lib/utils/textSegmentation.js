const SENTENCE_DELIMITERS = new Set([".", "?", "!"])
const NON_BOUNDARY_ABBREVIATIONS = new Set([
	"dr",
	"mr",
	"mrs",
	"ms",
	"prof",
	"rev",
	"sr",
	"jr",
	"st",
	"vs",
	"etc",
])
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

function getPreviousSignificantChar(text, index) {
	for (let currentIndex = index - 1; currentIndex >= 0; currentIndex -= 1) {
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

function getWordBeforeIndex(text, index) {
	let endIndex = index

	while (endIndex > 0 && /\s/.test(text[endIndex - 1])) {
		endIndex -= 1
	}

	let startIndex = endIndex
	while (startIndex > 0 && /[\p{L}]/u.test(text[startIndex - 1])) {
		startIndex -= 1
	}

	return text.slice(startIndex, endIndex).toLowerCase()
}

function getWordAfterIndex(text, index) {
	let startIndex = index + 1

	while (startIndex < text.length && /\s/.test(text[startIndex])) {
		startIndex += 1
	}

	let endIndex = startIndex
	while (endIndex < text.length && /[\p{L}'-]/u.test(text[endIndex])) {
		endIndex += 1
	}

	return text.slice(startIndex, endIndex)
}

function isLikelyInitialBoundary(text, index) {
	const currentWord = text.slice(index - 1, index)
	const nextWord = getWordAfterIndex(text, index)

	if (!/^[A-Z]$/.test(currentWord)) return false
	if (!nextWord) return true

	return /^[A-Z][\p{L}'-]*$/u.test(nextWord)
}

export function isSentenceBoundary(text, index) {
	const char = text[index]
	if (!SENTENCE_DELIMITERS.has(char)) return false

	const nextChar = text[index + 1] || ""
	if (char === "." && nextChar && !/\s/.test(nextChar)) return false
	if (
		char === "." &&
		NON_BOUNDARY_ABBREVIATIONS.has(getWordBeforeIndex(text, index)) &&
		getNextSignificantChar(text, index)
	) {
		return false
	}
	if (char === "." && isLikelyInitialBoundary(text, index)) {
		return false
	}

	return !nextChar || /\s/.test(nextChar)
}

function hasSpeakableWord(text) {
	return /[\p{L}\p{N}]/u.test(text)
}

export function splitReadableText(text) {
	const segments = []
	let segmentStart = 0

	function pushWrappedSegment(endIndex) {
		if (endIndex <= segmentStart) return

		const segmentText = text.slice(segmentStart, endIndex)
		segments.push({
			text: segmentText,
			wrap: hasSpeakableWord(segmentText),
		})
		segmentStart = endIndex
	}

	for (let index = 0; index < text.length; index += 1) {
		if (isSentenceBoundary(text, index)) {
			pushWrappedSegment(index + 1)
		}
	}

	if (segmentStart < text.length) {
		const segmentText = text.slice(segmentStart)
		segments.push({
			text: segmentText,
			wrap: hasSpeakableWord(segmentText),
		})
	}

	return segments
}

export function splitIntoSentences(text) {
	const normalizedText = (text || "").trim()
	if (!normalizedText) return []

	return splitReadableText(normalizedText)
		.map((segment) => segment.text.trim())
		.filter(Boolean)
}

export function isPauseHyphen(text, index) {
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
