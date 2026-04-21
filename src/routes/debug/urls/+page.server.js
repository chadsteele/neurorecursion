import fs from "fs/promises"
import path from "path"

export const prerender = true

const EXTERNAL_URL_REGEX = /(["'`])(https?:\/\/[^\s"'`<>{}]+)\1/gi
const ASSET_EXTENSIONS =
	/\.(?:png|jpe?g|gif|webp|svg|mp4|webm|mp3|wav|pdf|zip)(?:\?[^\s"'`]*)?$/i

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

function shouldIncludeUrl(rawUrl) {
	if (!rawUrl || hasTemplateInterpolation(rawUrl)) {
		return false
	}

	if (!/^https?:\/\//i.test(rawUrl)) {
		return false
	}

	if (ASSET_EXTENSIONS.test(rawUrl)) {
		return false
	}

	return true
}

function addMatch(results, rootDir, filePath, content, rawUrl, matchIndex) {
	if (!shouldIncludeUrl(rawUrl)) return

	const relativeFile = path
		.relative(rootDir, filePath)
		.split(path.sep)
		.join("/")
	const line = getLineNumber(content, matchIndex)
	const key = `${rawUrl}::${relativeFile}::${line}`

	if (results.seen.has(key)) {
		return
	}

	results.seen.add(key)

	if (!results.byUrl.has(rawUrl)) {
		results.byUrl.set(rawUrl, {
			url: rawUrl,
			rawUrls: new Set(),
			occurrences: [],
		})
	}

	const entry = results.byUrl.get(rawUrl)
	entry.rawUrls.add(rawUrl)
	entry.occurrences.push({
		file: relativeFile,
		line,
		sourceType: "external-url",
	})
}

function extractExternalUrls(content, filePath, rootDir, results) {
	for (const match of content.matchAll(EXTERNAL_URL_REGEX)) {
		addMatch(
			results,
			rootDir,
			filePath,
			content,
			match[2],
			match.index ?? 0,
		)
	}
}

async function collectExternalUrlReferences(rootDir) {
	const files = await collectFiles(rootDir, rootDir)
	const results = {
		byUrl: new Map(),
		seen: new Set(),
	}

	for (const filePath of files) {
		const content = await fs.readFile(filePath, "utf8")
		extractExternalUrls(content, filePath, rootDir, results)
	}

	return Array.from(results.byUrl.values())
		.map((entry) => ({
			url: entry.url,
			rawUrls: Array.from(entry.rawUrls).sort(),
			occurrences: entry.occurrences.sort((left, right) => {
				if (left.file !== right.file) {
					return left.file.localeCompare(right.file)
				}
				return left.line - right.line
			}),
		}))
		.sort((left, right) => left.url.localeCompare(right.url))
}

export async function load() {
	const rootDir = process.cwd()
	const sourceDir = path.join(rootDir, "src")
	const urls = await collectExternalUrlReferences(sourceDir)

	return {
		urls,
		urlCount: urls.length,
	}
}
