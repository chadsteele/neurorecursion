import sharp from "sharp"
import {createCanvas, loadImage} from "canvas"
import fs from "fs/promises"
import path from "path"
import {fileURLToPath} from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function serverWatermark(imageUrlParam) {
	try {
		let imageBuffer

		if (imageUrlParam.startsWith("data:")) {
			// Base64 data URL
			const base64Data = imageUrlParam.split(",")[1]
			imageBuffer = Buffer.from(base64Data, "base64")
		} else if (imageUrlParam.startsWith("http")) {
			// HTTP/HTTPS URL
			const response = await fetch(imageUrlParam)
			imageBuffer = Buffer.from(await response.arrayBuffer())
		} else {
			// Local file path
			const projectRoot = path.resolve(__dirname, "../../../../")
			const filePath = path.join(projectRoot, "static", imageUrlParam)
			imageBuffer = await fs.readFile(filePath)
		}

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
			const projectRoot = path.resolve(__dirname, "../../../../")
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

		const finalBuffer = canvas.toBuffer("image/png")
		return `data:image/png;base64,${finalBuffer.toString("base64")}`
	} catch (err) {
		console.error("Server watermark error:", err)
		throw err
	}
}

export async function POST({request}) {
	try {
		const {imageUrl} = await request.json()

		if (!imageUrl) {
			return new Response(JSON.stringify({error: "imageUrl required"}), {
				status: 400,
			})
		}

		const watermarkedImage = await serverWatermark(imageUrl)

		return new Response(JSON.stringify({imageUrl: watermarkedImage}), {
			headers: {
				"Content-Type": "application/json",
			},
		})
	} catch (err) {
		console.error("Watermark endpoint error:", err)
		return new Response(
			JSON.stringify({error: err.message || "Failed to watermark image"}),
			{
				status: 500,
			},
		)
	}
}
