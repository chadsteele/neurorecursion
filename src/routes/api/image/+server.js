import sharp from "sharp"
import fs from "fs/promises"
import path from "path"
import {fileURLToPath} from "url"
import {dirname} from "path"
import {log} from "console"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function processImage(imageBuffer, width = 1080, height = 566) {
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

		// Add logo to lower left corner
		const logoSize = Math.round(width * 0.4) // 22% of image width (doubled)
		const margin = 0
		const logoPath = path.join(
			__dirname,
			"../../../../static/logo.blue.png",
		)

		// Get logo metadata to preserve aspect ratio
		const logoMetadata = await sharp(logoPath).metadata()
		const logoAspect = logoMetadata.width / logoMetadata.height

		// Calculate actual logo dimensions after fit: "contain"
		let logoDisplayWidth, logoDisplayHeight
		if (logoAspect > 1) {
			// Logo is wider than tall
			logoDisplayWidth = logoSize
			logoDisplayHeight = Math.round(logoSize / logoAspect)
		} else {
			// Logo is taller than wide
			logoDisplayWidth = Math.round(logoSize * logoAspect)
			logoDisplayHeight = logoSize
		}

		const logoBuffer = await sharp(logoPath)
			.resize(logoDisplayWidth, logoDisplayHeight, {
				fit: "contain",
				background: {r: 0, g: 0, b: 0, alpha: 0},
			})
			.png()
			.toBuffer()

		// Calculate position for logo
		const logoLeft = margin
		const logoTop = height - logoDisplayHeight - margin

		const finalBuffer = await sharp(croppedImage)
			.composite([
				{
					input: logoBuffer,
					left: logoLeft,
					top: logoTop,
				},
			])
			.png()
			.toBuffer()

		return finalBuffer
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

		// Process image with logo
		const finalBuffer = await processImage(imageBuffer, width, height)

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
