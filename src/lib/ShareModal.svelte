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

	async function copyToClipboard() {
		try {
			const plainText = url
				? `${title}\n\n${description}\n\n${url}`
				: `${title}\n\n${description}`

			// Fetch image and convert to base64
			let imageBase64 = ""
			if (assetImageUrl) {
				try {
					const response = await fetch(assetImageUrl)
					const blob = await response.blob()
					const reader = new FileReader()
					imageBase64 = await new Promise((resolve) => {
						reader.onloadend = () => resolve(reader.result)
						reader.readAsDataURL(blob)
					})
				} catch (err) {
					console.error("Failed to fetch image:", err)
				}
			}

			const imageHtml = imageBase64
				? `<img src="${imageBase64}" alt="" style="width: 100%; max-height: 300px; object-fit: cover; display: block;" />`
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

			const htmlBlob = new Blob([htmlContent], {type: "text/html"})
			const textBlob = new Blob([plainText], {type: "text/plain"})

			const data = [
				new ClipboardItem({
					"text/html": htmlBlob,
					"text/plain": textBlob,
				}),
			]

			await navigator.clipboard.write(data)
			copied = true
			clearTimeout(copyTimeout)
			copyTimeout = setTimeout(() => {
				copied = false
			}, 2000)
		} catch (err) {
			console.error("Failed to copy to clipboard:", err)
			// Fallback to plain text
			try {
				const plainText = url
					? `${title}\n\n${description}\n\n${url}`
					: `${title}\n\n${description}`
				await navigator.clipboard.writeText(plainText)
				copied = true
				clearTimeout(copyTimeout)
				copyTimeout = setTimeout(() => {
					copied = false
				}, 2000)
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
