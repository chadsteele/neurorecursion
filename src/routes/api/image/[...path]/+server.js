import sharp from "sharp"
import {createCanvas, loadImage} from "canvas"
import fs from "fs/promises"
import path from "path"
import {fileURLToPath} from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function applyWatermark(imageBuffer) {
	try {
		// Get image metadata
		const metadata = await sharp(imageBuffer).metadata()
		const targetWidth = 1080
		const targetHeight = 566
		const imgAspect = metadata.width / metadata.height
		const targetAspect = targetWidth / targetHeight

		let cropWidth, cropHeight, cropX, cropY

		if (imgAspect > targetAspect) {
			cropHeight = metadata.height
			cropWidth = metadata.height * targetAspect
			cropX = (metadata.width - cropWidth) / 2
			cropY = 0
		} else {
			cropWidth = metadata.width
			cropHeight = metadata.width / targetAspect
			cropX = 0
			cropY = (metadata.height - cropHeight) / 2
		}

		// Crop and resize
		let processedImage = sharp(imageBuffer)
			.extract({
				left: Math.round(cropX),
				top: Math.round(cropY),
				width: Math.round(cropWidth),
				height: Math.round(cropHeight),
			})
			.resize(targetWidth, targetHeight, {fit: "fill"})

		const imageData = await processedImage.png().toBuffer()

		// Load image onto canvas for watermarking
		const canvas = createCanvas(targetWidth, targetHeight)
		const ctx = canvas.getContext("2d")

		const img = await loadImage(imageData)
		ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

		// Try to load brain SVG
		let brainImage = null
		try {
			const projectRoot = path.resolve(__dirname, "../../../../../")
			const brainPath = path.join(projectRoot, "static", "brain.svg")
			const brainBuffer = await fs.readFile(brainPath)
			brainImage = await loadImage(brainBuffer)
		} catch (err) {
			console.warn("Brain SVG not found on server:", err.message)
		}

		const text = "NeuroRecursion.com"
		const textWidth = targetWidth * 0.33
		const fontSize = Math.floor(textWidth / 6)
		const padding = 3
		const textY = targetHeight - padding

		if (brainImage) {
			// Draw brain SVG
			const brainHeight = fontSize * 1.2
			const brainWidth =
				(brainImage.width / brainImage.height) * brainHeight
			const brainX = padding
			const brainY = targetHeight - padding - brainHeight

			ctx.drawImage(brainImage, brainX, brainY, brainWidth, brainHeight)

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
		} else {
			// Text only
			const textX = padding
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
		}

		return canvas.toBuffer("image/png")
	} catch (err) {
		console.error("Watermark error:", err)
		throw err
	}
}

export async function GET({params, url}) {
	try {
		const imagePath = params.path
		const watermark = url.searchParams.get("watermark") === "true"

		if (!imagePath) {
			return new Response(JSON.stringify({error: "path required"}), {
				status: 400,
				headers: {"Content-Type": "application/json"},
			})
		}

		// Load local file from static directory
		const projectRoot = path.resolve(__dirname, "../../../../../")
		const filePath = path.join(projectRoot, "static", imagePath)
		const imageBuffer = await fs.readFile(filePath)

		// Apply watermark if requested
		let finalBuffer = imageBuffer
		if (watermark) {
			finalBuffer = await applyWatermark(imageBuffer)
		}

		return new Response(finalBuffer, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "public, max-age=3600",
			},
		})
	} catch (err) {
		console.error("Image endpoint error:", err)
		return new Response(
			JSON.stringify({error: err.message || "Failed to process image"}),
			{
				status: 500,
				headers: {"Content-Type": "application/json"},
			},
		)
	}
}
