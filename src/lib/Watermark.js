// Browser-only watermark with canvas
async function browserWatermark(imageUrl) {
	const img = new Image()
	img.crossOrigin = "anonymous"

	return new Promise((resolve, reject) => {
		img.onload = async () => {
			try {
				const targetWidth = 1080
				const targetHeight = 566
				const imgAspect = img.width / img.height
				const targetAspect = targetWidth / targetHeight

				let cropWidth, cropHeight, cropX, cropY

				if (imgAspect > targetAspect) {
					cropHeight = img.height
					cropWidth = img.height * targetAspect
					cropX = (img.width - cropWidth) / 2
					cropY = 0
				} else {
					cropWidth = img.width
					cropHeight = img.width / targetAspect
					cropX = 0
					cropY = (img.height - cropHeight) / 2
				}

				const canvas = document.createElement("canvas")
				canvas.width = targetWidth
				canvas.height = targetHeight
				const ctx = canvas.getContext("2d")

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

				const brainSvg = new Image()
				brainSvg.crossOrigin = "anonymous"

				const drawAndFinalize = () => {
					const text = "NeuroRecursion.com"
					const textWidth = targetWidth * 0.33
					const fontSize = Math.floor(textWidth / 6)
					const padding = 3
					const textY = targetHeight - padding

					const brainHeight = fontSize * 1.2
					const brainWidth =
						(brainSvg.width / brainSvg.height) * brainHeight
					const brainX = padding
					const brainY = targetHeight - padding - brainHeight

					ctx.drawImage(
						brainSvg,
						brainX,
						brainY,
						brainWidth,
						brainHeight,
					)

					const textX = brainX + brainWidth + padding

					ctx.font = `bold ${fontSize}px Arial, sans-serif`
					ctx.textBaseline = "bottom"
					ctx.textAlign = "left"

					ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
					ctx.shadowColor = "rgba(0, 0, 0, 0.7)"
					ctx.shadowBlur = 3
					ctx.shadowOffsetX = 1
					ctx.shadowOffsetY = 1
					ctx.fillText(text, textX, textY)

					ctx.fillStyle = "white"
					ctx.shadowColor = "transparent"
					ctx.fillText(text, textX, textY)

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

					ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
					ctx.shadowColor = "rgba(0, 0, 0, 0.7)"
					ctx.shadowBlur = 3
					ctx.shadowOffsetX = 1
					ctx.shadowOffsetY = 1
					ctx.fillText(text, textX, textY)

					ctx.fillStyle = "white"
					ctx.shadowColor = "transparent"
					ctx.fillText(text, textX, textY)

					canvas.toBlob((blob) => {
						const reader = new FileReader()
						reader.onloadend = () => resolve(reader.result)
						reader.readAsDataURL(blob)
					}, "image/png")
				}

				brainSvg.onload = drawAndFinalize
				brainSvg.onerror = () => {
					console.warn("Brain SVG not found, drawing text only")
					drawTextOnly()
				}

				const brainUrl = `${window.location.origin}/brain.svg`
				brainSvg.src = brainUrl
			} catch (err) {
				console.error("Error processing image:", err)
				reject(err)
			}
		}
		img.onerror = () => {
			console.error("Failed to load image:", imageUrl)
			reject(new Error(`Failed to load image: ${imageUrl}`))
		}
		img.src = imageUrl
	})
}

export async function imageUrlToBase64(imageUrlParam) {
	if (!imageUrlParam) return ""

	try {
		let imageUrl
		if (imageUrlParam.startsWith("data:")) {
			imageUrl = imageUrlParam
		} else if (imageUrlParam.startsWith("http")) {
			imageUrl = imageUrlParam
		} else {
			// Relative path - convert to absolute
			imageUrl = `${window.location.origin}${imageUrlParam}`
		}

		return await browserWatermark(imageUrl)
	} catch (err) {
		console.error("Failed to convert image to base64:", err)
		return ""
	}
}

// Call server endpoint for server-side watermarking
export async function watermarkOnServer(imageUrl) {
	try {
		const response = await fetch("/api/watermark", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({imageUrl}),
		})

		if (!response.ok) {
			throw new Error(`Server error: ${response.statusText}`)
		}

		const {imageUrl: watermarkedImageUrl} = await response.json()
		return watermarkedImageUrl
	} catch (err) {
		console.error("Server watermark failed:", err)
		throw err
	}
}
