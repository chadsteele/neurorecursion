<script>
	import {browser} from "$app/environment"

	const GOOGLE_IMAGES_SEARCH_URL = "https://www.google.com/search?tbm=isch&q="

	let {data} = $props()
	let loadState = $state({})

	function getFullUrl(url) {
		if (!browser || !url) return url

		try {
			return new URL(url, window.location.href).href
		} catch {
			return url
		}
	}

	function markLoaded(url) {
		loadState[url] = "loaded"
	}

	function markFailed(url) {
		loadState[url] = "failed"
	}

	function statusFor(url) {
		return loadState[url] || "pending"
	}

	function getImageId(url) {
		if (!url) return ""

		try {
			const pathname = new URL(url, browser ? window.location.href : "https://example.com")
				.pathname
			const filename = pathname.split("/").pop() || ""
			return filename.replace(/\.[^.]+$/, "")
		} catch {
			const filename = url.split("/").pop() || ""
			return filename.replace(/\.[^.]+$/, "")
		}
	}

	function getGoogleImageSearchHref(url) {
		const imageId = getImageId(url)
		if (!imageId) return GOOGLE_IMAGES_SEARCH_URL

		return `${GOOGLE_IMAGES_SEARCH_URL}${encodeURIComponent(`${imageId} background image`)}`
	}

	const loadedCount = $derived.by(
		() =>
			Object.values(loadState).filter((status) => status === "loaded")
				.length,
	)

	const failedCount = $derived.by(
		() =>
			Object.values(loadState).filter((status) => status === "failed")
				.length,
	)

	const failedImages = $derived.by(() =>
		data.images.filter(
			(image) => loadState[image.resolvedUrl] === "failed",
		),
	)

	const sortedImages = $derived.by(() => {
		const priority = {
			failed: 0,
			pending: 1,
			loaded: 2,
		}

		return [...data.images].sort((left, right) => {
			const leftStatus = statusFor(left.resolvedUrl)
			const rightStatus = statusFor(right.resolvedUrl)

			if (leftStatus !== rightStatus) {
				return priority[leftStatus] - priority[rightStatus]
			}

			return left.resolvedUrl.localeCompare(right.resolvedUrl)
		})
	})
</script>

<svelte:head>
	<title>Debug Images</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="paper container debug-images-page">
	<h1>Debug Images</h1>
	<p class="debug-summary">
		Found {data.imageCount} unique image URLs in the codebase.
	</p>
	<p class="debug-summary secondary">
		Loaded: {loadedCount} | Failed: {failedCount} | Pending:
		{Math.max(data.imageCount - loadedCount - failedCount, 0)}
	</p>

	<section class="failures-panel" aria-live="polite">
		<div class="failures-header">
			<h2>Failures</h2>
			<p>
				{#if failedImages.length > 0}
					{failedImages.length} image{failedImages.length === 1
						? ""
						: "s"}
					failed so far.
				{:else}
					No failures reported yet.
				{/if}
			</p>
		</div>

		{#if failedImages.length > 0}
			<div class="failures-list">
				{#each failedImages as image (image.resolvedUrl)}
					<article class="failure-item">
						<a
							href={getFullUrl(image.resolvedUrl)}
							class="url-value"
							target="_blank"
							rel="noreferrer"
						>
							{getFullUrl(image.resolvedUrl)}
						</a>
						<a
							href={getGoogleImageSearchHref(image.resolvedUrl)}
							class="search-link"
							target="_blank"
							rel="noreferrer"
						>
							Search Google Images
						</a>
						<ul class="occurrence-list compact">
							{#each image.occurrences as occurrence, index (`failure-${image.resolvedUrl}-${occurrence.file}-${occurrence.line}-${index}`)}
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
			</div>
		{/if}
	</section>

	<div class="images-grid">
		{#each sortedImages as image (image.resolvedUrl)}
			<article class={`image-card ${statusFor(image.resolvedUrl)}`}>
				<div class="image-preview-wrap">
					<img
						src={image.resolvedUrl}
						alt={image.resolvedUrl}
						class="image-preview"
						decoding="async"
						onload={() => markLoaded(image.resolvedUrl)}
						onerror={() => markFailed(image.resolvedUrl)}
					/>
				</div>

				<p class="status-label">
					Status: {statusFor(image.resolvedUrl)}
				</p>

				<p class="url-label">Full path</p>
				<a
					href={getFullUrl(image.resolvedUrl)}
					class="url-value"
					target="_blank"
					rel="noreferrer"
				>
					{getFullUrl(image.resolvedUrl)}
				</a>

				<a
					href={getGoogleImageSearchHref(image.resolvedUrl)}
					class="search-link"
					target="_blank"
					rel="noreferrer"
				>
					Search Google Images for "{getImageId(image.resolvedUrl)} background image"
				</a>

				{#if image.rawUrls.length > 1 || image.rawUrls[0] !== image.resolvedUrl}
					<p class="url-label">Matched strings</p>
					<div class="raw-url-list">
						{#each image.rawUrls as rawUrl (rawUrl)}
							<a
								href={getFullUrl(rawUrl)}
								class="raw-url"
								target="_blank"
								rel="noreferrer"
							>
								{rawUrl}
							</a>
						{/each}
					</div>
				{/if}

				<p class="url-label">Found in</p>
				<ul class="occurrence-list">
					{#each image.occurrences as occurrence, index (`${image.resolvedUrl}-${occurrence.file}-${occurrence.line}-${index}`)}
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
</section>

<style>
	.debug-images-page {
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

	.debug-summary.secondary {
		margin-top: 0.35rem;
		color: #9fb4c8;
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

	.failure-item {
		padding: 0.85rem;
		border-radius: 10px;
		background: rgba(86, 18, 24, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.images-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.image-card {
		padding: 1rem;
		border-radius: 14px;
		border: 1px solid rgba(74, 159, 216, 0.18);
		background: rgba(8, 18, 34, 0.78);
	}

	.image-card.loaded {
		border-color: rgba(75, 181, 120, 0.55);
	}

	.image-card.failed {
		border-color: rgba(228, 96, 96, 0.8);
		background: rgba(48, 14, 18, 0.82);
	}

	.image-preview-wrap {
		aspect-ratio: 16 / 9;
		border-radius: 10px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.06);
	}

	.image-preview {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		background: rgba(255, 255, 255, 0.04);
	}

	.status-label,
	.url-label,
	.url-value,
	.search-link,
	.raw-url,
	.occurrence-file,
	.occurrence-type {
		word-break: break-word;
	}

	.status-label {
		margin: 0.85rem 0 0.5rem;
		font-weight: 600;
		text-transform: capitalize;
	}

	.url-label {
		margin: 0.75rem 0 0.2rem;
		color: #8bb6d8;
		font-size: 0.86rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.url-value,
	.search-link,
	.raw-url {
		margin: 0;
		display: block;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
			"Liberation Mono", "Courier New", monospace;
		font-size: 0.82rem;
		color: #dfe9f5;
		text-decoration: none;
	}

	.url-value:hover,
	.search-link:hover,
	.raw-url:hover {
		text-decoration: underline;
	}

	.search-link {
		margin-top: 0.45rem;
		color: #8bb6d8;
	}

	.raw-url-list {
		display: grid;
		gap: 0.35rem;
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

		.occurrence-list li {
			flex-direction: column;
		}

		.occurrence-type {
			white-space: normal;
		}
	}
</style>
