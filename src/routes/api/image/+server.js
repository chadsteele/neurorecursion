import sharp from "sharp"
import fs from "fs/promises"
import path from "path"
import {fileURLToPath} from "url"
import {dirname} from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function processImage(
	imageBuffer,
	width = 1080,
	height = 566,
	watermarkText = null,
) {
	try {
		// Get image metadata
		const metadata = await sharp(imageBuffer).metadata()
		const imgAspect = metadata.width / metadata.height
		const targetAspect = width / height

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
		let composites = []
		const croppedImage = await sharp(imageBuffer)
			.extract({
				left: Math.round(cropX),
				top: Math.round(cropY),
				width: Math.round(cropWidth),
				height: Math.round(cropHeight),
			})
			.resize(width, height, {fit: "fill"})
			.png()
			.toBuffer()

		// If watermark requested, add it
		if (watermarkText) {
			const fontSize = 24
			const textWidth = Math.round(width * 0.25)
			const textSvg = `<svg width="${textWidth}" height="60" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<filter id="shadow">
						<feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
						<feOffset dx="2" dy="2" result="offsetblur"/>
						<feComponentTransfer>
							<feFuncA type="linear" slope="0.5"/>
						</feComponentTransfer>
						<feMerge>
							<feMergeNode/>
							<feMergeNode in="SourceGraphic"/>
						</feMerge>
					</filter>
				</defs>
				<text x="${textWidth / 2}" y="40" text-anchor="middle" font-size="${fontSize}" font-family="Arial, sans-serif" font-weight="bold" fill="white" filter="url(#shadow)">${watermarkText}</text>
			</svg>`

			const textBuffer = await sharp(Buffer.from(textSvg))
				.resize(textWidth, 60, {fit: "contain"})
				.png()
				.toBuffer()

			const composites = [
				{
					input: textBuffer,
					left: 5,
					top: height - 65,
				},
			]

			// Apply all composites to the image
			const finalBuffer = await sharp(croppedImage)
				.composite(composites)
				.png()
				.toBuffer()

			return finalBuffer
		}

		// Return cropped image without watermark
		return croppedImage
	} catch (err) {
		console.error("Process image error:", err)
		throw err
	}
}

export async function GET({url}) {
	try {
		const imageUrl = url.searchParams.get("url")
		const width = parseInt(url.searchParams.get("width") || "1080")
		const height = parseInt(url.searchParams.get("height") || "566")
		const watermark = url.searchParams.get("watermark")

		if (!imageUrl) {
			return new Response(
				JSON.stringify({error: "url parameter required"}),
				{
					status: 400,
					headers: {"Content-Type": "application/json"},
				},
			)
		}

		let imageBuffer

		if (imageUrl.startsWith("data:")) {
			// Base64 data URL
			const base64Data = imageUrl.split(",")[1]
			imageBuffer = Buffer.from(base64Data, "base64")
		} else if (imageUrl.startsWith("http")) {
			// HTTP/HTTPS URL
			const response = await fetch(imageUrl)
			if (!response.ok) {
				throw new Error(`Failed to fetch image: ${response.statusText}`)
			}
			imageBuffer = Buffer.from(await response.arrayBuffer())
		} else {
			// Local file path
			const filePath = path.join(process.cwd(), "static", imageUrl)
			imageBuffer = await fs.readFile(filePath)
		}

		// Process image with optional watermark
		const finalBuffer = await processImage(
			imageBuffer,
			width,
			height,
			watermark,
		)

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
