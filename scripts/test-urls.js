import fs from "fs"
import path from "path"
import https from "https"
import http from "http"
import {fileURLToPath} from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const SRC_DIR = path.join(__dirname, "../src")
const URL_PATTERN = /https?:\/\/[^\s"'`<>]+/g
const TIMEOUT = 10000 // 10 seconds

// Track results
const results = {
	success: [],
	failed: [],
	duplicates: new Set(),
	total: 0,
}

// Recursively read all files in src directory
function getAllFiles(dir) {
	let files = []
	const items = fs.readdirSync(dir)

	for (const item of items) {
		const fullPath = path.join(dir, item)
		const stat = fs.statSync(fullPath)

		if (stat.isDirectory()) {
			files = files.concat(getAllFiles(fullPath))
		} else {
			files.push(fullPath)
		}
	}

	return files
}

// Extract URLs from file content
function extractUrls(content) {
	const matches = content.match(URL_PATTERN) || []
	// Remove duplicates and trailing punctuation that might be part of the sentence
	return [...new Set(matches.map((url) => url.replace(/[.,;:!?)\]}]+$/, "")))]
}

// Test a single URL
function testUrl(url) {
	return new Promise((resolve) => {
		const protocol = url.startsWith("https") ? https : http

		const request = protocol.request(
			url,
			{
				method: "HEAD",
				timeout: TIMEOUT,
			},
			(res) => {
				resolve({
					url,
					status: res.statusCode,
					success:
						res.statusCode === 200 ||
						res.statusCode === 301 ||
						res.statusCode === 302,
				})
			},
		)

		request.on("error", (error) => {
			resolve({
				url,
				status: null,
				error: error.message,
				success: false,
			})
		})

		request.on("timeout", () => {
			request.destroy()
			resolve({
				url,
				status: null,
				error: "Timeout",
				success: false,
			})
		})

		request.end()
	})
}

// Main execution
async function main() {
	console.log("🔍 Scanning for URLs in src/...\n")

	const files = getAllFiles(SRC_DIR)
	const urlsToTest = new Map() // Use Map to track unique URLs

	// Extract all URLs from all files
	for (const file of files) {
		try {
			const content = fs.readFileSync(file, "utf8")
			const urls = extractUrls(content)

			for (const url of urls) {
				if (!urlsToTest.has(url)) {
					urlsToTest.set(url, [])
				}
				urlsToTest.get(url).push(path.relative(SRC_DIR, file))
			}
		} catch (error) {
			console.error(`Error reading ${file}:`, error.message)
		}
	}

	if (urlsToTest.size === 0) {
		console.log("❌ No URLs found in src/ directory")
		return
	}

	console.log(`📋 Found ${urlsToTest.size} unique URL(s) to test`)
	console.log("🚀 Running tests concurrently...\n")

	let passCount = 0
	let failCount = 0
	const testedUrls = []
	const failures = []

	// Test all URLs concurrently
	const testPromises = Array.from(urlsToTest.entries()).map(([url]) =>
		testUrl(url).then((result) => {
			const files = urlsToTest.get(result.url)

			if (result.status !== 404) {
				passCount++
				results.success.push(result.url)
			} else {
				failCount++
				const status = "❌"
				const statusText = result.status || "ERROR"
				const errorMsg = result.error ? ` - ${result.error}` : ""
				const fileList =
					files.length > 1 ? `\n   Found in: ${files.join(", ")}` : ""

				console.log(`${status} ${result.url}`)
				console.log(`   Status: ${statusText}${errorMsg}${fileList}\n`)

				results.failed.push({
					url: result.url,
					status: result.status,
					error: result.error,
					files,
				})
				failures.push(result)
			}

			testedUrls.push(result)
			return result
		}),
	)

	// Wait for all tests to complete
	await Promise.all(testPromises)

	// Summary
	console.log("═".repeat(80))
	console.log("SUMMARY")
	console.log("═".repeat(80))
	console.log(`Total URLs tested: ${passCount + failCount}`)
	console.log(`✅ Passing: ${passCount}`)
	console.log(`❌ Failing: ${failCount}`)

	if (failCount > 0) {
		process.exit(1)
	} else {
		console.log("\n✨ All URLs are healthy!")
		process.exit(0)
	}
}

main().catch((error) => {
	console.error("Fatal error:", error)
	process.exit(1)
})
