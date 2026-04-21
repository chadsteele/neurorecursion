import fs from "fs/promises"
import path from "path"

export const prerender = true

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|svg)(\?[^\s"'`)]*)?$/i
const CSS_URL_REGEX =
	/url\((['"]?)([^)'"\s]+\.(?:png|jpe?g|gif|webp|svg)(?:\?[^)'"\s]*)?)\1\)/gi
const STRING_URL_REGEX =
	/(["'`])((?:https?:\/\/|\/|\.{1,2}\/)[^\s"'`)]*\.(?:png|jpe?g|gif|webp|svg)(?:\?[^\s"'`)]*)?)\1/gi

const INCLUDED_EXTENSIONS = new Set([
	".css",
	".html",
	".js",
	".json",
	".md",
	".svelte",
	".toml",
	".ts",
])

const EXCLUDED_DIRS = new Set([
	".git",
	".netlify",
	".svelte-kit",
	"build",
	"dist",
	"node_modules",
])

async function collectFiles(dirPath, rootDir, files = []) {
	const entries = await fs.readdir(dirPath, {withFileTypes: true})

	for (const entry of entries) {
		if (entry.name.startsWith(".") && !entry.name.endsWith(".md")) {
			if (entry.isDirectory()) continue
		}

		if (entry.isDirectory() && EXCLUDED_DIRS.has(entry.name)) {
			continue
		}

		const fullPath = path.join(dirPath, entry.name)

		if (entry.isDirectory()) {
			await collectFiles(fullPath, rootDir, files)
			continue
		}

		if (!INCLUDED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
			continue
		}

		files.push(fullPath)
	}

	return files
}

function getLineNumber(content, index) {
	let line = 1
	for (let idx = 0; idx < index; idx += 1) {
		if (content[idx] === "\n") {
			line += 1
		}
	}
	return line
}

function hasTemplateInterpolation(rawUrl) {
	return rawUrl.includes("${")
}

function normalizeUrl(rawUrl, filePath, rootDir) {
	if (
		!rawUrl ||
		hasTemplateInterpolation(rawUrl) ||
		!IMAGE_EXTENSIONS.test(rawUrl)
	) {
		return null
	}

	if (rawUrl.startsWith("static/")) {
		return `/${rawUrl.slice("static/".length)}`
	}

	if (/^https?:\/\//i.test(rawUrl) || rawUrl.startsWith("/")) {
		return rawUrl
	}

	if (/^\.{1,2}\//.test(rawUrl)) {
		const absolutePath = path.resolve(path.dirname(filePath), rawUrl)
		const staticSegment = `${path.sep}static${path.sep}`
		const staticIndex = absolutePath.lastIndexOf(staticSegment)

		if (staticIndex !== -1) {
			return `/${absolutePath
				.slice(staticIndex + staticSegment.length)
				.split(path.sep)
				.join("/")}`
		}
	}

	return rawUrl
}

function addMatch(
	results,
	rootDir,
	filePath,
	content,
	rawUrl,
	matchIndex,
	sourceType,
) {
	const resolvedUrl = normalizeUrl(rawUrl, filePath, rootDir)
	if (!resolvedUrl) return

	const relativeFile = path
		.relative(rootDir, filePath)
		.split(path.sep)
		.join("/")
	const line = getLineNumber(content, matchIndex)
	const key = `${resolvedUrl}::${relativeFile}::${line}`

	if (results.seen.has(key)) {
		return
	}

	results.seen.add(key)

	if (!results.byUrl.has(resolvedUrl)) {
		results.byUrl.set(resolvedUrl, {
			resolvedUrl,
			rawUrls: new Set(),
			occurrences: [],
		})
	}

	const entry = results.byUrl.get(resolvedUrl)
	entry.rawUrls.add(rawUrl)
	entry.occurrences.push({
		file: relativeFile,
		line,
		sourceType,
	})
}

function extractImageUrls(content, filePath, rootDir, results) {
	for (const match of content.matchAll(CSS_URL_REGEX)) {
		addMatch(
			results,
			rootDir,
			filePath,
			content,
			match[2],
			match.index ?? 0,
			"css-url",
		)
	}

	for (const match of content.matchAll(STRING_URL_REGEX)) {
		addMatch(
			results,
			rootDir,
			filePath,
			content,
			match[2],
			match.index ?? 0,
			"string",
		)
	}
}

async function collectImageReferences(rootDir) {
	const files = await collectFiles(rootDir, rootDir)
	const results = {
		byUrl: new Map(),
		seen: new Set(),
	}

	for (const filePath of files) {
		const content = await fs.readFile(filePath, "utf8")
		extractImageUrls(content, filePath, rootDir, results)
	}

	return Array.from(results.byUrl.values())
		.map((entry) => ({
			resolvedUrl: entry.resolvedUrl,
			rawUrls: Array.from(entry.rawUrls).sort(),
			occurrences: entry.occurrences.sort((left, right) => {
				if (left.file !== right.file) {
					return left.file.localeCompare(right.file)
				}
				return left.line - right.line
			}),
		}))
		.sort((left, right) =>
			left.resolvedUrl.localeCompare(right.resolvedUrl),
		)
}

export async function load() {
	const rootDir = process.cwd()
	const images = await collectImageReferences(rootDir)

	return {
		images,
		imageCount: images.length,
	}
}
