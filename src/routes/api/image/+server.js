import sharp from "sharp"
import fs from "fs/promises"
import {resolveStaticFile} from "$lib/server/file-resolver.js"

async function processImage(
	imageBuffer,
	width = 1080,
	height = 566,
	requestLog = {},
) {
	try {
		// Get image metadata
		const metadata = await sharp(imageBuffer).metadata()
		console.log(`[processImage] Image metadata:`, {
			originalWidth: metadata.width,
			originalHeight: metadata.height,
			format: metadata.format,
			hasAlpha: metadata.hasAlpha,
			targetWidth: width,
			targetHeight: height,
			forRequest: requestLog,
		})
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
		console.log(`[processImage] Crop/resize params:`, {
			cropX: Math.round(cropX),
			cropY: Math.round(cropY),
			cropWidth: Math.round(cropWidth),
			cropHeight: Math.round(cropHeight),
			finalWidth: width,
			finalHeight: height,
		})
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
		console.log(`[processImage] Cropped and resized image successfully`)

		// Add logo to lower left corner
		const logoSize = Math.round(width * 0.4)
		const margin = 0

		// Resolve logo path using centralized utility (handles Netlify/local dev)
		console.log(`[processImage] Resolving logo path...`)
		const logoPath = await resolveStaticFile("logo.blue.shadows.png")
		console.log(`[processImage] Logo resolved to:`, logoPath)

		// Get logo metadata to preserve aspect ratio
		const logoMetadata = await sharp(logoPath).metadata()
		console.log(`[processImage] Logo metadata:`, {
			logoWidth: logoMetadata.width,
			logoHeight: logoMetadata.height,
			logoFormat: logoMetadata.format,
		})
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

		console.log(`[processImage] Adding logo overlay:`, {
			logoDisplayWidth,
			logoDisplayHeight,
			logoLeft,
			logoTop,
		})
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

		console.log(
			`[processImage] Image processing completed successfully. Final buffer size: ${finalBuffer.length} bytes`,
		)
		return finalBuffer
	} catch (err) {
		console.error("[processImage] ERROR during processing:", {
			error: err.message,
			stack: err.stack,
			forRequest: requestLog,
		})
		throw err
	}
}

export async function GET({url, request}) {
	const startTime = Date.now()
	const requestId = Math.random().toString(36).substr(2, 9)
	const userAgent = request.headers.get("user-agent") || "unknown"
	const referer = request.headers.get("referer") || "unknown"

	try {
		const imageUrl = url.searchParams.get("url")
		const width = parseInt(url.searchParams.get("width") || "1080")
		const height = parseInt(url.searchParams.get("height") || "566")

		const requestLog = {
			requestId,
			userAgent,
			isFacebookCrawler: userAgent
				.toLowerCase()
				.includes("facebookexternalhit"),
			referer,
			imageUrl: imageUrl ? imageUrl.substring(0, 100) : null,
			width,
			height,
		}

		console.log("[API] Image endpoint called", requestLog)

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
		} else if (
			imageUrl.startsWith("http://") ||
			imageUrl.startsWith("https://")
		) {
			// HTTP/HTTPS URL - fetch it
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
		console.log(
			`[API] ${requestLog.requestId} Starting image processing...`,
		)
		const finalBuffer = await processImage(
			imageBuffer,
			width,
			height,
			requestLog,
		)
		const processingTime = Date.now() - startTime

		console.log(
			`[API] ${requestLog.requestId} Image processing completed successfully`,
			{
				outputSize: finalBuffer.length,
				processingTimeMs: processingTime,
			},
		)

		return new Response(finalBuffer, {
			headers: {
				"Content-Type": "image/png",
				// Allow public caching for OG image generation, but vary by URL
				"Cache-Control": "public, max-age=86400",
				"CDN-Cache-Control": "public, max-age=86400",
				Vary: "url",
				"X-Content-Type-Options": "nosniff",
				ETag: `"${Date.now()}-${Math.random()}"`,
			},
		})
	} catch (err) {
		const processingTime = Date.now() - startTime
		console.error(`[API] ${requestLog.requestId} ERROR:`, {
			error: err.message,
			stack: err.stack,
			processingTimeMs: processingTime,
			userAgent: requestLog.userAgent,
			isFacebookCrawler: requestLog.isFacebookCrawler,
		})
		return new Response(
			JSON.stringify({error: err.message || "Failed to process image"}),
			{
				status: 500,
				headers: {"Content-Type": "application/json"},
			},
		)
	}
}
