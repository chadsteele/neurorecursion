import sharp from "sharp"
import fs from "fs/promises"
import {resolveStaticFile} from "$lib/server/file-resolver.js"

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
		const logoSize = Math.round(width * 0.4)
		const margin = 0

		// Resolve logo path using centralized utility (handles Netlify/local dev)
		const logoPath = await resolveStaticFile("logo.blue.shadows.png")

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

		console.log("Image API called", {imageUrl, width, height})

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
			// Local file path - use centralized resolver (handles Netlify + local dev)
			const cleanImageUrl = imageUrl.replace(/^\//, "")
			try {
				imageBuffer = await resolveStaticFile(cleanImageUrl).then((p) =>
					fs.readFile(p),
				)
			} catch (err) {
				throw new Error(
					`Could not load static image: ${cleanImageUrl}. ${err.message}`,
				)
			}
		}

		// Process image with logo
		const finalBuffer = await processImage(imageBuffer, width, height)

		return new Response(finalBuffer, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control":
					"no-cache, no-store, must-revalidate, max-age=0, private",
				"CDN-Cache-Control":
					"no-cache, no-store, must-revalidate, max-age=0",
				Pragma: "no-cache",
				Expires: "0",
				Age: "0",
				Vary: "url",
				"X-Content-Type-Options": "nosniff",
				ETag: `"${Date.now()}-${Math.random()}"`,
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
