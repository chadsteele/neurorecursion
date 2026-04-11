<script>
	let {
		title = "",
		description = "",
		imageUrl = "/pioneers/bluebrain.png",
		url = "",
		onClose = () => {},
	} = $props()

	let copied = $state(false)
	let copyTimeout
	let copying = $state(false)
	let previewImageBase64 = $state("")

	$effect.pre(() => {
		// Watch imageUrl changes and reload preview with watermark
		if (imageUrl) {
			imageUrlToBase64(imageUrl).then((base64) => {
				previewImageBase64 = base64
			})
		}
	})

	async function imageUrlToBase64(imageUrlParam) {
		if (!imageUrlParam) return ""
		try {
			// Handle relative URLs
			const absoluteUrl = imageUrlParam.startsWith("http")
				? imageUrlParam
				: `${typeof window !== "undefined" ? window.location.origin : ""}${imageUrlParam}`

			// Load main image
			const img = new Image()
			img.crossOrigin = "anonymous"

			return new Promise((resolve, reject) => {
				img.onload = async () => {
					try {
						// Crop image to 1080x566 pixels (centered)
						const targetWidth = 1080
						const targetHeight = 566
						const imgAspect = img.width / img.height
						const targetAspect = targetWidth / targetHeight

						let cropWidth, cropHeight, cropX, cropY

						if (imgAspect > targetAspect) {
							// Image is wider - crop width
							cropHeight = img.height
							cropWidth = img.height * targetAspect
							cropX = (img.width - cropWidth) / 2
							cropY = 0
						} else {
							// Image is taller - crop height
							cropWidth = img.width
							cropHeight = img.width / targetAspect
							cropX = 0
							cropY = (img.height - cropHeight) / 2
						}

						// Create canvas with target dimensions
						const canvas = document.createElement("canvas")
						canvas.width = targetWidth
						canvas.height = targetHeight
						const ctx = canvas.getContext("2d")

						// Draw cropped and scaled image
						ctx.drawImage(
							img,
							cropX,
							cropY,
							cropWidth,
							cropHeight,
							0,
							0,
							targetWidth,
							targetHeight,
						)

						// Load brain SVG for watermark
						const brainSvg = new Image()
						brainSvg.crossOrigin = "anonymous"

						const drawAndFinalize = () => {
							const text = "NeuroRecursion.com"
							const textWidth = targetWidth * 0.33
							const fontSize = Math.floor(textWidth / 6)
							const padding = 3
							const textY = targetHeight - padding

							// Calculate brain size and position
							const brainHeight = fontSize * 1.2
							const brainWidth =
								(brainSvg.width / brainSvg.height) * brainHeight
							const brainX = padding
							const brainY = targetHeight - padding - brainHeight

							// Draw brain SVG
							ctx.drawImage(
								brainSvg,
								brainX,
								brainY,
								brainWidth,
								brainHeight,
							)

							// Text position to right of brain
							const textX = brainX + brainWidth + padding

							ctx.font = `bold ${fontSize}px Arial, sans-serif`
							ctx.textBaseline = "bottom"
							ctx.textAlign = "left"

							// Draw black shadow
							ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
							ctx.shadowColor = "rgba(0, 0, 0, 0.7)"
							ctx.shadowBlur = 3
							ctx.shadowOffsetX = 1
							ctx.shadowOffsetY = 1
							ctx.fillText(text, textX, textY)

							// Draw white text
							ctx.fillStyle = "white"
							ctx.shadowColor = "transparent"
							ctx.fillText(text, textX, textY)

							// Convert canvas to base64
							canvas.toBlob((blob) => {
								const reader = new FileReader()
								reader.onloadend = () => resolve(reader.result)
								reader.readAsDataURL(blob)
							}, "image/png")
						}

						const drawTextOnly = () => {
							const text = "NeuroRecursion.com"
							const textWidth = targetWidth * 0.33
							const fontSize = Math.floor(textWidth / 6)
							const padding = 3
							const textX = padding
							const textY = targetHeight - padding

							ctx.font = `bold ${fontSize}px Arial, sans-serif`
							ctx.textBaseline = "bottom"
							ctx.textAlign = "left"

							// Draw black shadow
							ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
							ctx.shadowColor = "rgba(0, 0, 0, 0.7)"
							ctx.shadowBlur = 3
							ctx.shadowOffsetX = 1
							ctx.shadowOffsetY = 1
							ctx.fillText(text, textX, textY)

							// Draw white text
							ctx.fillStyle = "white"
							ctx.shadowColor = "transparent"
							ctx.fillText(text, textX, textY)

							// Convert canvas to base64
							canvas.toBlob((blob) => {
								const reader = new FileReader()
								reader.onloadend = () => resolve(reader.result)
								reader.readAsDataURL(blob)
							}, "image/png")
						}

						brainSvg.onload = drawAndFinalize
						brainSvg.onerror = () => {
							console.warn(
								"Brain SVG not found, drawing text only",
							)
							drawTextOnly()
						}

						const brainUrl =
							typeof window !== "undefined"
								? `${window.location.origin}/brain.svg`
								: "/brain.svg"
						brainSvg.src = brainUrl
					} catch (err) {
						console.error("Error processing image:", err)
						reject(err)
					}
				}
				img.onerror = () => {
					console.error("Failed to load image:", absoluteUrl)
					reject(new Error(`Failed to load image: ${absoluteUrl}`))
				}
				img.src = absoluteUrl
			})
		} catch (err) {
			console.error("Failed to convert image to base64:", err)
			return ""
		}
	}

	async function copyToClipboard() {
		copying = true
		try {
			const plainText = url
				? `${title}\n\n${description}\n\n${url}`
				: `${title}\n\n${description}`

			// Convert image to base64 on-demand (only when copying)
			let imageBase64 = ""
			if (imageUrl) {
				imageBase64 = await imageUrlToBase64(imageUrl)
			}

			const imageHtml = imageBase64
				? `<img src="${imageBase64}" alt="" style="width: 100%; max-height: 300px; object-fit: cover; display: block;" />`
				: ""
			const urlHtml = url
				? `<p style="margin: 0; font-size: 12px; color: #0a66c2;"><a href="${url}" style="color: #0a66c2; text-decoration: none;">${url}</a></p>`
				: ""

			const htmlContent = `
<div style="font-family: Arial, sans-serif; max-width: 500px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
	${imageHtml}
	<div style="padding: 16px; background: #f0f2f5;">
		<h2 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1c1e21;">${title}</h2>
		<p style="margin: 0 0 8px 0; font-size: 14px; color: #65676b; line-height: 1.4;">${description}</p>
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
		} finally {
			copying = false
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
				src={previewImageBase64 || imageUrl}
				alt={title}
				class="share-image"
			/>

			<div class="share-text">
				<h2 class="share-title">{title}</h2>
				<p class="share-description">{description}</p>
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
				disabled={copying}
				aria-label="Copy content to clipboard"
			>
				{copying ? "Copying..." : copied ? "✓ Copied!" : "Copy"}
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
