<script>
	import {browser} from "$app/environment"
	import {onMount} from "svelte"

	const CONFIRMATION_STORAGE_KEY = "debug-urls-manual-confirmations-v1"
	const CONFIRMATION_TTL_MS = 90 * 24 * 60 * 60 * 1000
	const LOAD_TIMEOUT_MS = 12000
	const STATUS_CLASS_ORDER = ["500s", "400s", "300s", "200s", "100s"]

	let {data} = $props()
	let loadState = $state({})
	let manualConfirmations = $state({})
	let urlEntries = $state([])

	function createUrlEntries(urls) {
		return urls.map((entry) => ({
			...entry,
			probeState: "unchecked",
			statusCode: null,
			statusText: "",
			redirectLocation: null,
		}))
	}

	const initialUrlEntries = $derived.by(() => createUrlEntries(data.urls))
	const visibleUrlEntries = $derived.by(() =>
		urlEntries.length > 0 ? urlEntries : initialUrlEntries,
	)
	let timeoutHandles = new Map()

	function pruneConfirmations(records, now = Date.now()) {
		const nextRecords = {}

		for (const [url, confirmedAt] of Object.entries(records || {})) {
			const timestamp = new Date(confirmedAt).getTime()

			if (Number.isNaN(timestamp)) continue
			if (now - timestamp > CONFIRMATION_TTL_MS) continue

			nextRecords[url] = new Date(timestamp).toISOString()
		}

		return nextRecords
	}

	function persistConfirmations(records) {
		if (!browser) return

		window.localStorage.setItem(
			CONFIRMATION_STORAGE_KEY,
			JSON.stringify(records),
		)
	}

	function loadManualConfirmations() {
		if (!browser) return

		try {
			const storedValue = window.localStorage.getItem(
				CONFIRMATION_STORAGE_KEY,
			)
			const parsedValue = storedValue ? JSON.parse(storedValue) : {}
			manualConfirmations = pruneConfirmations(parsedValue)
			persistConfirmations(manualConfirmations)
		} catch {
			manualConfirmations = {}
			persistConfirmations(manualConfirmations)
		}
	}

	function isManuallyConfirmed(url) {
		return Boolean(manualConfirmations[url])
	}

	function setManualConfirmation(url, checked) {
		const nextRecords = {...manualConfirmations}

		if (checked) {
			nextRecords[url] = new Date().toISOString()
		} else {
			delete nextRecords[url]
		}

		manualConfirmations = pruneConfirmations(nextRecords)
		persistConfirmations(manualConfirmations)

		if (!checked) {
			void probeUncheckedUrls()
		}
	}

	function formatConfirmationTimestamp(confirmedAt) {
		if (!confirmedAt) return ""

		return new Date(confirmedAt).toLocaleString()
	}

	function getStatusClassLabel(statusCode) {
		if (statusCode >= 500) return "500s"
		if (statusCode >= 400) return "400s"
		if (statusCode >= 300) return "300s"
		if (statusCode >= 200) return "200s"
		if (statusCode >= 100) return "100s"
		return "Other"
	}

	function formatHeadStatus(entry) {
		if (entry.probeState === "unchecked") {
			return "Not checked yet"
		}

		if (entry.probeState === "probing") {
			return "Checking..."
		}

		if (entry.probeState === "error") {
			return entry.statusText || "Request failed"
		}

		if (typeof entry.statusCode === "number") {
			return entry.statusText
				? `${entry.statusCode} (${entry.statusText})`
				: `${entry.statusCode}`
		}

		return "Not checked"
	}

	function needsServerProbe(entry) {
		return !isManuallyConfirmed(entry.url) && entry.probeState === "unchecked"
	}

	function mergeProbeResults(results) {
		const resultsByUrl = new Map(
			(results || []).map((result) => [result.url, result]),
		)

		urlEntries = urlEntries.map((entry) => {
			const result = resultsByUrl.get(entry.url)

			if (!result) {
				return entry
			}

			return {
				...entry,
				probeState: result.probeState,
				statusCode: result.statusCode,
				statusText: result.statusText || "",
				redirectLocation: result.redirectLocation || null,
			}
		})
	}

	async function probeUncheckedUrls() {
		if (!browser) return

		const urlsToProbe = urlEntries
			.filter((entry) => needsServerProbe(entry))
			.map((entry) => entry.url)

		if (urlsToProbe.length === 0) {
			return
		}

		const pendingUrls = new Set(urlsToProbe)
		urlEntries = urlEntries.map((entry) =>
			pendingUrls.has(entry.url)
				? {
					...entry,
					probeState: "probing",
					statusText: "Checking...",
					redirectLocation: null,
				}
				: entry,
		)

		try {
			const response = await window.fetch("/debug/urls/probe", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({urls: urlsToProbe}),
			})

			if (!response.ok) {
				throw new Error(`Probe request failed with ${response.status}`)
			}

			const payload = await response.json()
			mergeProbeResults(payload.results)
		} catch (error) {
			urlEntries = urlEntries.map((entry) =>
				pendingUrls.has(entry.url)
					? {
						...entry,
						probeState: "error",
						statusCode: null,
						statusText: error?.message || "Probe request failed",
						redirectLocation: null,
					}
					: entry,
			)
		}
	}

	function getReplacementSearchQuery(url) {
		try {
			const {hostname} = new URL(url)
			const normalizedHost = hostname.replace(/^www\./i, "")
			const hostParts = normalizedHost.split(".").filter(Boolean)

			if (hostParts.length > 1) {
				hostParts.pop()
			}

			const query = hostParts.join(" ").replace(/[-_]+/g, " ").trim()
			return query || normalizedHost.replace(/[-_]+/g, " ")
		} catch {
			return url
				.replace(/^https?:\/\//i, "")
				.replace(/^www\./i, "")
				.replace(/\.[a-z]{2,}(\/.*)?$/i, "")
				.replace(/[-_/]+/g, " ")
				.trim()
		}
	}

	function getReplacementSearchHref(url) {
		return `https://www.google.com/search?q=${encodeURIComponent(getReplacementSearchQuery(url))}`
	}

	onMount(() => {
		urlEntries = initialUrlEntries.map((entry) => ({...entry}))
		loadManualConfirmations()
		void probeUncheckedUrls()
	})

	function shouldRenderIframe(entry) {
		return entry.probeState === "complete" && entry.statusCode >= 300
	}

	function trackFrame(_, url) {
		scheduleTimeout(url)

		return {
			destroy() {
				clearTimeoutFor(url)
			},
		}
	}

	function scheduleTimeout(url) {
		if (!browser || timeoutHandles.has(url)) return

		const timeoutHandle = window.setTimeout(() => {
			if (statusFor(url) === "idle") {
				loadState[url] = "failed"
			}
			timeoutHandles.delete(url)
		}, LOAD_TIMEOUT_MS)

		timeoutHandles.set(url, timeoutHandle)
	}

	function clearTimeoutFor(url) {
		if (!browser) return

		const timeoutHandle = timeoutHandles.get(url)
		if (timeoutHandle) {
			window.clearTimeout(timeoutHandle)
			timeoutHandles.delete(url)
		}
	}

	function markLoaded(url) {
		clearTimeoutFor(url)
		loadState[url] = "loaded"
	}

	function markFailed(url) {
		clearTimeoutFor(url)
		loadState[url] = "failed"
	}

	function statusFor(url) {
		return loadState[url] || "idle"
	}

	function getFailureGroup(entry) {
		if (entry.probeState === "error") {
			return "Request errors"
		}

		const statusClass = Math.floor(entry.statusCode / 100) * 100
		return `${statusClass}s`
	}

	const failedUrls = $derived.by(() =>
		visibleUrlEntries.filter(
			(entry) =>
				entry.probeState === "error" ||
				(entry.probeState === "complete" && entry.statusCode >= 300) ||
				loadState[entry.url] === "failed",
		),
	)

	const activeFailedUrls = $derived.by(() =>
		failedUrls.filter((entry) => !isManuallyConfirmed(entry.url)),
	)

	const failureGroups = $derived.by(() => {
		const grouped = new Map()

		for (const entry of activeFailedUrls) {
			const label = getFailureGroup(entry)
			if (!grouped.has(label)) {
				grouped.set(label, [])
			}

			grouped.get(label).push(entry)
		}

		const order = new Map([
			["500s", 0],
			["400s", 1],
			["300s", 2],
			["Request errors", 3],
		])

		return Array.from(grouped.entries())
			.map(([label, entries]) => ({label, entries}))
			.sort(
				(left, right) =>
					(order.get(left.label) ?? Number.MAX_SAFE_INTEGER) -
					(order.get(right.label) ?? Number.MAX_SAFE_INTEGER),
			)
	})

	const sortedUrls = $derived.by(() => {
		const iframePriority = {
			failed: 0,
			loaded: 1,
			idle: 2,
		}
		const probePriority = {
			complete: 0,
			error: 1,
			probing: 2,
			unchecked: 3,
		}

		return [...visibleUrlEntries].sort((left, right) => {
			const leftStatus = statusFor(left.url)
			const rightStatus = statusFor(right.url)
			const leftCode =
				left.probeState === "complete" &&
				typeof left.statusCode === "number"
					? left.statusCode
					: Number.NEGATIVE_INFINITY
			const rightCode =
				right.probeState === "complete" &&
				typeof right.statusCode === "number"
					? right.statusCode
					: Number.NEGATIVE_INFINITY

			if (leftCode !== rightCode) {
				return rightCode - leftCode
			}

			if (left.probeState !== right.probeState) {
				return probePriority[left.probeState] - probePriority[right.probeState]
			}

			if (leftStatus !== rightStatus) {
				return iframePriority[leftStatus] - iframePriority[rightStatus]
			}

			return left.url.localeCompare(right.url)
		})
	})

	const renderedUrls = $derived.by(() =>
		sortedUrls.filter(
			(entry) =>
				entry.probeState !== "complete" || entry.statusCode !== 200,
		),
	)

	const activeRenderedUrls = $derived.by(() =>
		renderedUrls.filter((entry) => !isManuallyConfirmed(entry.url)),
	)

	const confirmedUrls = $derived.by(() =>
		renderedUrls
			.filter((entry) => isManuallyConfirmed(entry.url))
			.sort((left, right) => {
				const leftTimestamp = new Date(
					manualConfirmations[left.url],
				).getTime()
				const rightTimestamp = new Date(
					manualConfirmations[right.url],
				).getTime()

				return rightTimestamp - leftTimestamp
			}),
	)

	const successfulUrls = $derived.by(() =>
		sortedUrls.filter(
			(entry) =>
				entry.probeState === "complete" && entry.statusCode === 200,
		),
	)

	const statusSummaryText = $derived.by(() => {
		const parts = []
		const activeEntries = visibleUrlEntries.filter(
			(entry) => !isManuallyConfirmed(entry.url),
		)
		const pendingCount = activeEntries.filter(
			(entry) =>
				entry.probeState === "unchecked" || entry.probeState === "probing",
		).length
		const requestErrors = activeEntries.filter(
			(entry) => entry.probeState === "error",
		).length
		const countsByClass = new Map()

		for (const entry of activeEntries) {
			if (entry.probeState !== "complete") continue
			const label = getStatusClassLabel(entry.statusCode)
			countsByClass.set(label, (countsByClass.get(label) || 0) + 1)
		}

		if (pendingCount > 0) {
			parts.push(`Pending checks: ${pendingCount}`)
		}

		for (const label of STATUS_CLASS_ORDER) {
			const count = countsByClass.get(label)
			if (count) {
				parts.push(`${label}: ${count}`)
			}
		}

		if (requestErrors > 0) {
			parts.push(`Request errors: ${requestErrors}`)
		}

		return parts.join(" | ") || "Waiting for browser checks."
	})
</script>

<svelte:head>
	<title>Debug URLs</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="paper container debug-urls-page">
	<h1>Debug URLs</h1>
	<p class="debug-summary">
		Found {data.urlCount} unique external URLs in the codebase.
	</p>
	<p class="debug-summary secondary">
		{statusSummaryText}
	</p>
	<p class="debug-summary note">
		The page renders all discovered URLs first, filters out manually
		confirmed entries in the browser, and only then asks the server to HEAD
		check the remaining URLs. Iframes are only rendered for 300+ responses.
	</p>

	<section class="failures-panel" aria-live="polite">
		<div class="failures-header">
			<h2>Failures</h2>
			<p>
				{#if activeFailedUrls.length > 0}
					{activeFailedUrls.length} URL{activeFailedUrls.length === 1
						? ""
						: "s"}
					with 300+ responses, request errors, or iframe failures.
				{:else}
					No failures reported yet.
				{/if}
			</p>
		</div>

		{#if activeFailedUrls.length > 0}
			<div class="failures-list">
				{#each failureGroups as group (group.label)}
					<section class="failure-group">
						<div class="failure-group-header">
							<h3>{group.label}</h3>
							<p>
								{group.entries.length} URL{group.entries
									.length === 1
									? ""
									: "s"}
							</p>
						</div>

						{#each group.entries as entry (entry.url)}
							<article class="failure-item">
								<label class="confirmation-toggle">
									<input
										type="checkbox"
										checked={isManuallyConfirmed(entry.url)}
										onchange={(event) =>
											setManualConfirmation(
												entry.url,
												event.currentTarget.checked,
											)}
									/>
									<span>Manually confirmed</span>
								</label>
								<p class="status-chip">
									HEAD status:
									{formatHeadStatus(entry)}
								</p>
								<a
									href={entry.url}
									class="url-value"
									target="_blank"
									rel="noreferrer"
								>
									{entry.url}
								</a>
								<div class="url-actions">
									<a
										href={getReplacementSearchHref(
											entry.url,
										)}
										class="search-link"
										target="_blank"
										rel="noreferrer"
									>
										Search replacement
									</a>
								</div>
								{#if entry.redirectLocation}
									<p class="redirect-label">
										Redirects to: {entry.redirectLocation}
									</p>
								{/if}
								<ul class="occurrence-list compact">
									{#each entry.occurrences as occurrence, index (`failure-${group.label}-${entry.url}-${occurrence.file}-${occurrence.line}-${index}`)}
										<li>
											<span class="occurrence-file">
												{occurrence.file}:{occurrence.line}
											</span>
											<span class="occurrence-type">
												{occurrence.sourceType}
											</span>
										</li>
									{/each}
								</ul>
							</article>
						{/each}
					</section>
				{/each}
			</div>
		{/if}
	</section>

	<div class="urls-grid">
		{#each activeRenderedUrls as entry (entry.url)}
			<article
				class={`url-card ${statusFor(entry.url)} ${shouldRenderIframe(entry) ? "needs-review" : "ok"}`}
			>
				{#if shouldRenderIframe(entry)}
					<div class="frame-wrap">
						<iframe
							use:trackFrame={entry.url}
							src={entry.url}
							title={entry.url}
							class="url-preview"
							loading="lazy"
							sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
							onload={() => markLoaded(entry.url)}
							onerror={() => markFailed(entry.url)}
						></iframe>
					</div>
				{/if}

				<p class="status-label">
					HEAD status: {formatHeadStatus(entry)}
				</p>

				{#if shouldRenderIframe(entry)}
					<p class="iframe-label">
						Iframe: {statusFor(entry.url)}
					</p>
				{/if}

				<label class="confirmation-toggle card-confirmation-toggle">
					<input
						type="checkbox"
						checked={isManuallyConfirmed(entry.url)}
						onchange={(event) =>
							setManualConfirmation(
								entry.url,
								event.currentTarget.checked,
							)}
					/>
					<span>Manually confirmed</span>
				</label>

				<p class="url-label">External URL</p>
				<a
					href={entry.url}
					class="url-value"
					target="_blank"
					rel="noreferrer"
				>
					{entry.url}
				</a>
				<div class="url-actions">
					<a
						href={getReplacementSearchHref(entry.url)}
						class="search-link"
						target="_blank"
						rel="noreferrer"
					>
						Search replacement
					</a>
				</div>

				{#if entry.redirectLocation}
					<p class="redirect-label">
						Redirects to: {entry.redirectLocation}
					</p>
				{/if}

				<p class="url-label">Found in</p>
				<ul class="occurrence-list">
					{#each entry.occurrences as occurrence, index (`${entry.url}-${occurrence.file}-${occurrence.line}-${index}`)}
						<li>
							<span class="occurrence-file"
								>{occurrence.file}:{occurrence.line}</span
							>
							<span class="occurrence-type"
								>{occurrence.sourceType}</span
							>
						</li>
					{/each}
				</ul>
			</article>
		{/each}
	</div>

	{#if confirmedUrls.length > 0}
		<section class="confirmed-list-panel">
			<div class="confirmed-list-header">
				<h2>Manually Confirmed</h2>
				<p>
					{confirmedUrls.length} URL{confirmedUrls.length === 1
						? ""
						: "s"}
				</p>
			</div>

			<div class="confirmed-url-list">
				{#each confirmedUrls as entry (entry.url)}
					<article class="confirmed-url-item">
						<div class="confirmed-url-meta">
							<label class="confirmation-toggle confirmed-toggle">
								<input
									type="checkbox"
									checked={isManuallyConfirmed(entry.url)}
									onchange={(event) =>
										setManualConfirmation(
											entry.url,
											event.currentTarget.checked,
										)}
								/>
								<span>Manually confirmed</span>
							</label>
							<p class="confirmation-timestamp">
								Confirmed: {formatConfirmationTimestamp(
									manualConfirmations[entry.url],
								)}
							</p>
						</div>
						<p class="status-label confirmed-status-label">
							HEAD status: {formatHeadStatus(entry)}
						</p>
						<a
							href={entry.url}
							class="url-value"
							target="_blank"
							rel="noreferrer"
						>
							{entry.url}
						</a>
						<div class="url-actions">
							<a
								href={getReplacementSearchHref(entry.url)}
								class="search-link"
								target="_blank"
								rel="noreferrer"
							>
								Search replacement
							</a>
						</div>
					</article>
				{/each}
			</div>
		</section>
	{/if}

	{#if successfulUrls.length > 0}
		<section class="success-list-panel">
			<div class="success-list-header">
				<h2>200 URLs</h2>
				<p>
					{successfulUrls.length} URL{successfulUrls.length === 1
						? ""
						: "s"}
				</p>
			</div>

			<div class="success-url-list">
				{#each successfulUrls as entry (entry.url)}
					<a
						href={entry.url}
						class="success-url-link"
						target="_blank"
						rel="noreferrer"
					>
						{entry.url}
					</a>
				{/each}
			</div>
		</section>
	{/if}
</section>

<style>
	.debug-urls-page {
		padding-top: 2rem;
		padding-bottom: 4rem;
	}

	h1 {
		margin-top: 0;
		margin-bottom: 0.5rem;
	}

	.debug-summary {
		margin: 0;
		color: #d8e6f5;
	}

	.debug-summary.secondary,
	.debug-summary.note {
		margin-top: 0.35rem;
	}

	.debug-summary.secondary {
		color: #9fb4c8;
	}

	.debug-summary.note {
		color: #c0cddd;
		font-size: 0.92rem;
	}

	.failures-panel {
		margin-top: 1.5rem;
		padding: 1rem;
		border-radius: 14px;
		border: 1px solid rgba(228, 96, 96, 0.4);
		background: rgba(38, 10, 14, 0.78);
	}

	.failures-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.failures-header h2,
	.failures-header p {
		margin: 0;
	}

	.failures-header h2 {
		font-size: 1.05rem;
		color: #ffd4d4;
	}

	.failures-header p {
		color: #f0b2b2;
	}

	.failures-list {
		display: grid;
		gap: 0.75rem;
		margin-top: 0.9rem;
	}

	.failure-group {
		display: grid;
		gap: 0.75rem;
	}

	.failure-group-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		padding-bottom: 0.2rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.failure-group-header h3,
	.failure-group-header p {
		margin: 0;
	}

	.failure-group-header h3 {
		color: #ffd4d4;
		font-size: 0.96rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.failure-group-header p {
		color: #f0b2b2;
		font-size: 0.84rem;
	}

	.failure-item {
		padding: 0.85rem;
		border-radius: 10px;
		background: rgba(86, 18, 24, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.confirmation-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: #f7d6d6;
		font-size: 0.84rem;
		cursor: pointer;
	}

	.card-confirmation-toggle {
		margin-top: 0.75rem;
		color: #e7e0c0;
	}

	.confirmation-toggle input {
		accent-color: #d5b464;
	}

	.urls-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.url-card {
		padding: 1rem;
		border-radius: 14px;
		border: 1px solid rgba(74, 159, 216, 0.18);
		background: rgba(8, 18, 34, 0.78);
	}

	.url-card.loaded {
		border-color: rgba(75, 181, 120, 0.55);
	}

	.url-card.ok {
		border-color: rgba(75, 181, 120, 0.35);
	}

	.url-card.needs-review {
		border-color: rgba(232, 179, 92, 0.55);
		background: rgba(48, 36, 14, 0.8);
	}

	.url-card.failed {
		border-color: rgba(228, 96, 96, 0.8);
		background: rgba(48, 14, 18, 0.82);
	}

	.confirmed-list-panel {
		margin-top: 1.5rem;
		padding: 1rem;
		border-radius: 14px;
		border: 1px solid rgba(213, 180, 100, 0.34);
		background: rgba(43, 33, 12, 0.72);
	}

	.confirmed-list-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.confirmed-list-header h2,
	.confirmed-list-header p {
		margin: 0;
	}

	.confirmed-list-header h2 {
		font-size: 1.05rem;
		color: #f0ddae;
	}

	.confirmed-list-header p {
		color: #dbc990;
	}

	.confirmed-url-list {
		display: grid;
		gap: 0.75rem;
		margin-top: 0.9rem;
	}

	.confirmed-url-item {
		padding-top: 0.6rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.confirmed-url-meta {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.confirmed-toggle {
		color: #f0ddae;
	}

	.confirmation-timestamp {
		margin: 0;
		color: #dbc990;
		font-size: 0.82rem;
	}

	.confirmed-status-label {
		margin-top: 0.6rem;
	}

	.success-list-panel {
		margin-top: 1.5rem;
		padding: 1rem;
		border-radius: 14px;
		border: 1px solid rgba(75, 181, 120, 0.3);
		background: rgba(10, 29, 20, 0.72);
	}

	.success-list-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.success-list-header h2,
	.success-list-header p {
		margin: 0;
	}

	.success-list-header h2 {
		font-size: 1.05rem;
		color: #caefda;
	}

	.success-list-header p {
		color: #a9d9bd;
	}

	.success-url-list {
		display: grid;
		gap: 0.45rem;
		margin-top: 0.9rem;
	}

	.success-url-link {
		display: block;
		padding-top: 0.45rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
			"Liberation Mono", "Courier New", monospace;
		font-size: 0.82rem;
		color: #dff5e8;
		text-decoration: none;
		word-break: break-word;
	}

	.success-url-link:hover {
		text-decoration: underline;
	}

	.frame-wrap {
		aspect-ratio: 16 / 10;
		border-radius: 10px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.06);
	}

	.url-preview {
		display: block;
		width: 100%;
		height: 100%;
		border: 0;
		background: rgba(255, 255, 255, 0.04);
	}

	.status-label,
	.iframe-label,
	.status-chip,
	.redirect-label,
	.url-label,
	.url-value,
	.occurrence-file,
	.occurrence-type {
		word-break: break-word;
	}

	.status-label {
		margin: 0.85rem 0 0.5rem;
		font-weight: 600;
	}

	.iframe-label,
	.redirect-label {
		margin: 0.35rem 0 0;
		color: #c9d6e4;
		font-size: 0.82rem;
	}

	.status-chip {
		display: inline-block;
		margin: 0 0 0.6rem;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.08);
		color: #f3e5c2;
		font-size: 0.76rem;
		letter-spacing: 0.03em;
		text-transform: uppercase;
	}

	.url-label {
		margin: 0.75rem 0 0.2rem;
		color: #8bb6d8;
		font-size: 0.86rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.url-value {
		margin: 0;
		display: block;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
			"Liberation Mono", "Courier New", monospace;
		font-size: 0.82rem;
		color: #dfe9f5;
		text-decoration: none;
	}

	.url-value:hover {
		text-decoration: underline;
	}

	.url-actions {
		margin-top: 0.45rem;
	}

	.search-link {
		display: inline-flex;
		align-items: center;
		padding: 0.35rem 0.65rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.14);
		background: rgba(255, 255, 255, 0.06);
		color: #f6d99c;
		font-size: 0.8rem;
		text-decoration: none;
	}

	.search-link:hover {
		background: rgba(255, 255, 255, 0.12);
		text-decoration: none;
	}

	.occurrence-list {
		list-style: none;
		padding: 0;
		margin: 0.5rem 0 0;
		display: grid;
		gap: 0.45rem;
	}

	.occurrence-list.compact {
		margin-top: 0.65rem;
	}

	.occurrence-list.compact li {
		padding-top: 0.35rem;
	}

	.occurrence-list li {
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;
		padding-top: 0.45rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.occurrence-file {
		color: #dfe9f5;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
			"Liberation Mono", "Courier New", monospace;
		font-size: 0.8rem;
	}

	.occurrence-type {
		color: #8bb6d8;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}

	@media (max-width: 700px) {
		.failures-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.success-list-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.confirmed-list-header,
		.confirmed-url-meta {
			flex-direction: column;
			align-items: flex-start;
		}

		.occurrence-list li {
			flex-direction: column;
		}

		.occurrence-type {
			white-space: normal;
		}
	}
</style>
