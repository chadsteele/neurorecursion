<script>
	let {
		title = "",
		description = "",
		imageUrl = "/logo.png",
		url = "",
		onClose = () => {},
	} = $props()

	// Convert \n to <br/> tags for HTML rendering
	function formatDescription(text) {
		return text.replace(/\n/g, "<br/>")
	}

	let copied = $state(false)
	let copyTimeout

	// Construct asset URL if needed
	function getAssetImageUrl(imageUrl) {
		if (!imageUrl) return ""
		if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
			let temp = imageUrl.replace("/src/", "/og/")
			return temp
		}

		if (imageUrl.startsWith("/")) {
			return imageUrl
		}

		// If it's just a filename, construct the full asset URL
		return `https://cri-cdn.netlify.app/og/neurorecursion.com/${imageUrl.replace(/^\/+/, "")}`
	}

	const assetImageUrl = $derived(getAssetImageUrl(imageUrl))

	function getImageUrlCandidates(url) {
		if (!url) return []

		const candidates = [url]
		if (url.includes("/og/")) {
			candidates.push(url.replace("/og/", "/src/"))
		}
		if (url.endsWith(".avif")) {
			candidates.push(url.replace(/\.avif$/, ".png"))
		}

		const expandedCandidates = []
		for (const candidate of candidates) {
			expandedCandidates.push(candidate)
			if (candidate.includes("/og/")) {
				expandedCandidates.push(candidate.replace("/og/", "/src/"))
			}
			if (candidate.endsWith(".avif")) {
				expandedCandidates.push(candidate.replace(/\.avif$/, ".png"))
			}
		}

		return [...new Set(expandedCandidates)]
	}

	async function fetchFirstAvailableImage(url) {
		const candidates = getImageUrlCandidates(url)
		for (const candidate of candidates) {
			try {
				const response = await fetch(candidate, {
					mode: "cors",
					credentials: "omit",
				})
				if (response.ok) {
					return {
						blob: await response.blob(),
						resolvedUrl: candidate,
					}
				}
			} catch {
				// Continue through fallback candidates.
			}
		}

		return {
			blob: null,
			resolvedUrl: "",
		}
	}

	function setCopiedState() {
		copied = true
		clearTimeout(copyTimeout)
		copyTimeout = setTimeout(() => {
			copied = false
		}, 2000)
	}

	function legacyCopyRichContent(htmlContent, plainText) {
		const container = document.createElement("div")
		container.contentEditable = "true"
		container.style.position = "fixed"
		container.style.left = "-99999px"
		container.style.top = "0"
		container.style.opacity = "0"
		container.style.pointerEvents = "none"
		container.innerHTML = htmlContent

		document.body.appendChild(container)

		const selection = window.getSelection()
		const range = document.createRange()
		range.selectNodeContents(container)

		selection?.removeAllRanges()
		selection?.addRange(range)

		let copiedWithLegacyPath = false
		const onCopy = (event) => {
			if (!event.clipboardData) return
			event.preventDefault()
			event.clipboardData.setData("text/html", htmlContent)
			event.clipboardData.setData("text/plain", plainText)
			copiedWithLegacyPath = true
		}

		document.addEventListener("copy", onCopy, {once: true})
		document.execCommand("copy")

		selection?.removeAllRanges()
		document.body.removeChild(container)

		return copiedWithLegacyPath
	}

	async function toPngBlob(sourceBlob) {
		if (!sourceBlob) return null
		if (sourceBlob.type === "image/png") return sourceBlob

		const bitmap = await createImageBitmap(sourceBlob)
		const canvas = document.createElement("canvas")
		canvas.width = bitmap.width
		canvas.height = bitmap.height

		const context = canvas.getContext("2d")
		if (!context) {
			throw new Error(
				"Could not create canvas context for PNG conversion",
			)
		}

		context.drawImage(bitmap, 0, 0)

		return await new Promise((resolve, reject) => {
			canvas.toBlob((blob) => {
				if (blob) resolve(blob)
				else reject(new Error("PNG conversion failed"))
			}, "image/png")
		})
	}

	async function copyToClipboard() {
		try {
			const plainText = url
				? `${title}\n\n${description}\n\n${url}`
				: `${title}\n\n${description}`

			// Fetch image, convert to PNG (better paste support), and encode for HTML
			let imageBase64 = ""
			let imageBlob = null
			let resolvedImageUrl = assetImageUrl
			if (assetImageUrl) {
				try {
					const {blob: fetchedBlob, resolvedUrl} =
						await fetchFirstAvailableImage(assetImageUrl)
					if (!fetchedBlob) {
						throw new Error(
							"No usable image found at any fallback URL",
						)
					}
					resolvedImageUrl = resolvedUrl
					imageBlob = await toPngBlob(fetchedBlob)
					const reader = new FileReader()
					imageBase64 = await new Promise((resolve, reject) => {
						reader.onloadend = () => resolve(reader.result)
						reader.onerror = () => reject(reader.error)
						reader.readAsDataURL(imageBlob)
					})
				} catch (err) {
					console.error("Failed to fetch image:", err)
				}
			}

			const imageHtml = imageBase64
				? `<img src="${imageBase64}" alt="" style="width: 100%; max-height: 300px; object-fit: cover; display: block;" />`
				: resolvedImageUrl
					? `<img src="${resolvedImageUrl}" alt="" style="width: 100%; max-height: 300px; object-fit: cover; display: block;" />`
					: ""
			const urlHtml = url
				? `<p style="margin: 0; font-size: 12px; color: #0a66c2;"><a href="${url}" style="color: #0a66c2; text-decoration: none;">${url}</a></p>`
				: ""
			const formattedDescription = formatDescription(description)

			const htmlContent = `
<div style="font-family: Arial, sans-serif; max-width: 500px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
	${imageHtml}
	<div style="padding: 16px; background: #f0f2f5;">
		<h2 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1c1e21;">${title}</h2>
		<p style="margin: 0 0 8px 0; font-size: 14px; color: #65676b; line-height: 1.4;">${formattedDescription}</p>
		${urlHtml}
	</div>
</div>
			`.trim()

			const copiedWithLegacyPath = legacyCopyRichContent(
				htmlContent,
				plainText,
			)
			if (copiedWithLegacyPath) {
				setCopiedState()
				return
			}

			const htmlBlob = new Blob([htmlContent], {type: "text/html"})
			const textBlob = new Blob([plainText], {type: "text/plain"})

			const clipboardData = {
				"text/html": htmlBlob,
				"text/plain": textBlob,
			}

			// Add PNG image data for editors that accept image clipboard types
			if (imageBlob) {
				clipboardData["image/png"] = imageBlob
			}

			const data = [new ClipboardItem(clipboardData)]

			await navigator.clipboard.write(data)
			setCopiedState()
		} catch (err) {
			console.error("Failed to copy to clipboard:", err)
			// Fallback to plain text
			try {
				const plainText = url
					? `${title}\n\n${description}\n\n${url}`
					: `${title}\n\n${description}`
				await navigator.clipboard.writeText(plainText)
				setCopiedState()
			} catch (fallbackErr) {
				console.error("Fallback copy also failed:", fallbackErr)
			}
		}
	}

	function handleClose() {
		onClose()
	}

	function handleBackdropKeydown(event) {
		if (event.key === "Escape") {
			handleClose()
		}
	}
</script>

<div
	class="modal-overlay"
	role="presentation"
	onclick={handleClose}
	onkeydown={handleBackdropKeydown}
	aria-label="Close modal by clicking outside"
>
	<div
		class="modal-content"
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-labelledby="share-modal-title"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
	>
		<!-- Instructions Heading -->

		<!-- Preview Card -->
		<div class="share-card">
			<img
				src={assetImageUrl || imageUrl}
				alt={title}
				class="share-image"
			/>

			<div class="share-text">
				<h2 class="share-title">{title}</h2>
				<p class="share-description">
					{@html formatDescription(description)}
				</p>
				{#if url}
					<p class="share-url">{url}</p>
				{/if}
			</div>
		</div>

		<div class="modal-header">
			<h1 class="modal-title" id="share-modal-title">
				Copy to clipboard to email and/or share on the platform of your
				choice
			</h1>
		</div>

		<!-- Action Buttons -->
		<div class="button-group">
			<button
				class="btn btn-copy"
				onclick={copyToClipboard}
				aria-label="Copy content to clipboard"
			>
				{copied ? "✓ Copied!" : "Copy"}
			</button>
			<button
				class="btn btn-close"
				onclick={handleClose}
				aria-label="Close share modal">Close</button
			>
		</div>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		border-radius: 8px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
		max-width: 500px;
		width: 90%;
		overflow: hidden;
	}

	.share-card {
		background: #f0f2f5;
		border: 1px solid #e5e7eb;
	}

	.share-image {
		width: 100%;
		height: auto;
		max-height: 300px;
		object-fit: cover;
		display: block;
	}

	.share-text {
		padding: 16px;
	}

	.share-title {
		margin: 0 0 8px 0;
		font-size: 16px;
		font-weight: 600;
		color: #1c1e21;
		line-height: 1.4;
	}

	.share-description {
		margin: 0 0 8px 0;
		font-size: 14px;
		color: #65676b;
		line-height: 1.4;
		display: -webkit-box;
		line-clamp: 3;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.share-url {
		margin: 0;
		font-size: 12px;
		color: #0a66c2;
		word-break: break-all;
		font-family: monospace;
	}

	.modal-header {
		padding: 16px;
		background: white;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-title {
		margin: 0;
		font-size: 16px;
		font-weight: 600;
		color: #1c1e21;
		line-height: 1.4;
	}

	.button-group {
		display: flex;
		gap: 12px;
		padding: 16px;
		background: white;
		border-top: 1px solid #e5e7eb;
	}

	.btn {
		flex: 1;
		padding: 10px 16px;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.btn-copy {
		background-color: #0a66c2;
		color: white;

		&:hover:not(:disabled) {
			background-color: #054399;
		}

		&:active:not(:disabled) {
			transform: scale(0.98);
		}

		&:disabled {
			background-color: #6b94c4;
			cursor: not-allowed;
			opacity: 0.7;
		}
	}

	.btn-close {
		background-color: #e4e6eb;
		color: #050505;

		&:hover {
			background-color: #cfd0d5;
		}

		&:active {
			transform: scale(0.98);
		}
	}

	@media (max-width: 480px) {
		.modal-content {
			width: 95%;
		}

		.button-group {
			flex-direction: column;
		}

		.share-text {
			padding: 12px;
		}

		.modal-header {
			padding: 12px;
		}

		.modal-title {
			font-size: 14px;
		}

		.button-group {
			padding: 12px;
			gap: 8px;
		}
	}
</style>
