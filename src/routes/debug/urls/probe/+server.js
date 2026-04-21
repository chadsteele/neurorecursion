import {json} from "@sveltejs/kit"

const REQUEST_TIMEOUT_MS = 10000
const MAX_CONCURRENT_PROBES = 8

function normalizeUrls(input) {
	if (!Array.isArray(input)) {
		return []
	}

	const uniqueUrls = new Set()

	for (const value of input) {
		if (typeof value !== "string") continue

		const trimmedValue = value.trim()
		if (!/^https?:\/\//i.test(trimmedValue)) continue

		uniqueUrls.add(trimmedValue)
	}

	return Array.from(uniqueUrls)
}

async function probeUrl(url) {
	const abortController = new AbortController()
	const timeoutHandle = setTimeout(
		() => abortController.abort(),
		REQUEST_TIMEOUT_MS,
	)

	try {
		const response = await fetch(url, {
			method: "HEAD",
			redirect: "manual",
			signal: abortController.signal,
		})

		return {
			url,
			probeState: "complete",
			statusCode: response.status,
			statusText: response.statusText || "",
			redirectLocation: response.headers.get("location"),
		}
	} catch (error) {
		return {
			url,
			probeState: "error",
			statusCode: null,
			statusText:
				error?.name === "AbortError"
					? "Request timed out"
					: error?.message || "Request failed",
			redirectLocation: null,
		}
	} finally {
		clearTimeout(timeoutHandle)
	}
}

export async function POST({request}) {
	const body = await request.json().catch(() => ({}))
	const urls = normalizeUrls(body?.urls)

	if (urls.length === 0) {
		return json({results: []})
	}

	const results = new Array(urls.length)
	let currentIndex = 0

	async function worker() {
		while (currentIndex < urls.length) {
			const index = currentIndex
			currentIndex += 1
			results[index] = await probeUrl(urls[index])
		}
	}

	const workerCount = Math.min(MAX_CONCURRENT_PROBES, urls.length)
	await Promise.all(Array.from({length: workerCount}, () => worker()))

	return json({results})
}
