<script>
	import {onMount} from "svelte"

	let {data} = $props()

	// State management
	let validationStatus = $state({}) // url -> { status, emoji, code, timestamp }
	let isValidating = $state(false)
	let validationProgress = $state({completed: 0, total: 0})
	let allUrls = $state([]) // flat list of all URLs with file context

	const sortedFiles = $derived(
		Object.keys(data.urlsByFile || {}).sort((a, b) => a.localeCompare(b)),
	)

	// Emoji mapping for HTTP status codes
	function getStatusEmoji(status) {
		if (status === null) return "⏳"
		if (status === "loading") return "⏸️"
		if (status >= 200 && status < 300) return "✅"
		if (status === 404) return "❌"
		if (status === 429) return "🚫"
		if (status >= 400 && status < 500) return "⚠️"
		if (status >= 500) return "💥"
		return "❓"
	}

	// Validate a single URL via server endpoint (with caching)
	async function validateUrl(url) {
		try {
			const response = await fetch(
				`/api/validate-url?url=${encodeURIComponent(url)}`,
				{
					method: "GET",
					signal: AbortSignal.timeout(10000),
				},
			)

			const data = await response.json()

			return {
				url,
				status: data.status,
				emoji: getStatusEmoji(data.status),
				error: data.error,
				cached: data.cached,
				timestamp: new Date(),
			}
		} catch (error) {
			// Handle network errors, timeouts, etc.
			const errorCode =
				error.name === "AbortError" ? "TIMEOUT" : error.message
			return {
				url,
				status: null,
				error: errorCode,
				emoji: "⚠️",
				timestamp: new Date(),
			}
		}
	}

	// Validate URLs in concurrent batches with throttling
	async function validateAllUrls(uncachedUrls) {
		if (uncachedUrls.length === 0) {
			isValidating = false
			return
		}

		isValidating = true
		validationProgress.total = uncachedUrls.length
		validationProgress.completed = 0

		const batchSize = 16 // More concurrent requests (proxy handles external throttle)
		const delayBetweenBatches = 100 // Minimal delay since throttle is at proxy level

		for (let i = 0; i < uncachedUrls.length; i += batchSize) {
			const batch = uncachedUrls.slice(i, i + batchSize)

			// Validate batch concurrently
			const results = await Promise.all(
				batch.map((item) => validateUrl(item.url)),
			)

			// Update validation status for each URL
			for (const result of results) {
				validationStatus[result.url] = result
				validationProgress.completed++
			}

			// Minimal delay before next batch
			if (i + batchSize < uncachedUrls.length) {
				await new Promise((resolve) =>
					setTimeout(resolve, delayBetweenBatches),
				)
			}
		}

		isValidating = false
	}

	// Initialize URLs on mount
	onMount(async () => {
		// Flatten URLs from grouped structure, but deduplicate
		const uniqueUrls = new Set()
		for (const file of Object.keys(data.urlsByFile || {})) {
			for (const urlObj of data.urlsByFile[file]) {
				uniqueUrls.add(urlObj.url)
			}
		}

		// Create allUrls with unique URLs only
		for (const url of uniqueUrls) {
			allUrls.push({url, file: "multiple"})
			validationStatus[url] = {
				status: null,
				emoji: "⏳",
				timestamp: null,
			}
		}

		// Fetch entire cache from server
		try {
			const cacheResponse = await fetch(
				"/api/validate-url?action=get-cache",
			)
			const cache = await cacheResponse.json()

			// Apply cached results immediately
			const uncachedUrls = []
			for (const urlItem of allUrls) {
				const cachedEntry = cache[urlItem.url]
				if (cachedEntry) {
					validationStatus[urlItem.url] = {
						status: cachedEntry.status,
						emoji: getStatusEmoji(cachedEntry.status),
						cached: true,
						timestamp: new Date(cachedEntry.timestamp),
					}
				} else {
					uncachedUrls.push(urlItem)
				}
			}

			// Update progress with cached entries
			validationProgress.completed = allUrls.length - uncachedUrls.length
			validationProgress.total = allUrls.length

			// Only validate URLs not in cache
			if (uncachedUrls.length > 0) {
				await validateAllUrls(uncachedUrls)
			} else {
				isValidating = false
			}
		} catch (error) {
			console.error("Failed to load cache:", error)
			// Fallback to validating all URLs
			await validateAllUrls(allUrls)
		}
	})

	function getUrlStatus(url) {
		const status = validationStatus[url]
		return status ? status.emoji : "⏳"
	}

	function getStatusClass(url) {
		const status = validationStatus[url]?.status
		if (status === null || status === "loading") return "pending"
		if (status >= 200 && status < 300) return "success"
		if (status === 404) return "notfound"
		if (status >= 400 && status < 500) return "error"
		if (status >= 500) return "servererror"
		return "unknown"
	}
</script>

<svelte:head>
	<title>External URLs by File</title>
</svelte:head>

<div class="container">
	<h1>🔍 External URLs by Source File</h1>

	<div class="info-box">
		<p>
			<strong>All external URLs found in the source code</strong>,
			organized by the file where they appear.
		</p>
		{#if data.generatedAt}
			<p class="timestamp">
				Generated: {new Date(data.generatedAt).toLocaleString()}
			</p>
		{/if}
	</div>

	<div class="summary">
		<div class="stat">
			<div class="number">{data.totalFiles || 0}</div>
			<div class="label">Files with URLs</div>
		</div>
		<div class="stat">
			<div class="number">{data.totalUrls || 0}</div>
			<div class="label">Total URLs</div>
		</div>
		{#if isValidating}
			<div class="stat validating">
				<div class="progress-info">
					<div class="number">
						{validationProgress.completed}/{validationProgress.total}
					</div>
					<div class="label">Validating...</div>
				</div>
				<div class="progress-bar">
					<div
						class="progress-fill"
						style="width: {(validationProgress.completed /
							validationProgress.total) *
							100}%"
					></div>
				</div>
			</div>
		{/if}
	</div>

	<div class="file-list">
		{#each sortedFiles as file}
			<div class="file-section">
				<div class="file-header">
					<h2>{file}</h2>
					<span class="count"
						>{data.urlsByFile[file].length} URL{data.urlsByFile[
							file
						].length === 1
							? ""
							: "s"}</span
					>
				</div>

				<div class="urls">
					{#each data.urlsByFile[file] as item}
						<div class="url-item {getStatusClass(item.url)}">
							<div class="status-emoji">
								{getUrlStatus(item.url)}
							</div>
							<a
								href={item.url}
								target="_blank"
								rel="noopener noreferrer"
							>
								{item.url}
							</a>

							<div class="status-code">
								HTTP {validationStatus[item.url]?.status}
								{#if validationStatus[item.url]?.cached}
									<span class="cache-badge">💾</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			sans-serif;
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 1.5rem;
		color: #333;
	}

	.info-box {
		background: #f0f7ff;
		border-left: 4px solid #3b82f6;
		padding: 1rem;
		border-radius: 6px;
		margin-bottom: 2rem;
	}

	.info-box p {
		margin: 0.5rem 0;
		color: #1e40af;
		line-height: 1.6;
	}

	.info-box p:first-child {
		margin-top: 0;
	}

	.timestamp {
		font-size: 0.9rem;
		color: #666;
	}

	.summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.stat {
		background: #f5f5f5;
		padding: 1.5rem;
		border-radius: 8px;
		text-align: center;
		border-left: 4px solid #3b82f6;
	}

	.stat.validating {
		background: #fef3c7;
		border-left-color: #f59e0b;
	}

	.progress-info {
		margin-bottom: 1rem;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: #e5e7eb;
		border-radius: 4px;
		overflow: hidden;
		margin-top: 0.5rem;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #3b82f6, #8b5cf6);
		transition: width 0.3s ease;
	}

	.number {
		font-size: 2.5rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
		color: #3b82f6;
	}

	.label {
		color: #666;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.file-list {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.file-section {
		background: #fff;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.file-header {
		background: #f8f9fa;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e5e5;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.file-header h2 {
		margin: 0;
		font-size: 1.1rem;
		color: #333;
		font-family: "Courier New", monospace;
		word-break: break-all;
	}

	.count {
		background: #3b82f6;
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 600;
		flex-shrink: 0;
		margin-left: 1rem;
	}

	.urls {
		padding: 1rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.url-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem;
		border-radius: 6px;
		border-left: 4px solid #e5e5e5;
		background: #fafafa;
		transition: all 0.2s ease;
	}

	.url-item.pending {
		background: #f0f9ff;
		border-left-color: #3b82f6;
	}

	.url-item.success {
		background: #f0fdf4;
		border-left-color: #22c55e;
	}

	.url-item.notfound {
		background: #fef2f2;
		border-left-color: #ef4444;
	}

	.url-item.error {
		background: #fef3c7;
		border-left-color: #f59e0b;
	}

	.url-item.servererror {
		background: #fef2f2;
		border-left-color: #dc2626;
	}

	.url-item.unknown {
		background: #f3f4f6;
		border-left-color: #6b7280;
	}

	.status-emoji {
		font-size: 1.5rem;
		flex-shrink: 0;
		width: 2rem;
		text-align: center;
	}

	.url-item a {
		color: #0066cc;
		text-decoration: none;
		flex: 1;
		font-size: 0.9rem;
		overflow-wrap: break-word;
		word-break: break-all;
	}

	.url-item a:hover {
		text-decoration: underline;
		color: #0052a3;
	}

	.status-code {
		background: white;
		color: #666;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 600;
		flex-shrink: 0;
		border: 1px solid #e5e5e5;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.cache-badge {
		background: #e0f2fe;
		color: #0369a1;
		padding: 0.1rem 0.4rem;
		border-radius: 3px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		h1 {
			font-size: 1.75rem;
		}

		.file-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.count {
			margin-left: 0;
			margin-top: 0.5rem;
		}

		.url-item {
			flex-wrap: wrap;
		}

		.status-code {
			width: 100%;
			margin-top: 0.5rem;
		}
	}
</style>
