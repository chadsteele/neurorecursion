import sharp from "sharp"
import fs from "fs/promises"
import path from "path"
import {fileURLToPath} from "url"
import {dirname} from "path"
import TextToSVG from "text-to-svg"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let textToSVG = null

// Initialize font loader on first use
async function getTextToSVG() {
	if (textToSVG) return textToSVG

	try {
		// Try to load from bundled fonts first (for Netlify)
		const fontPath = path.join(process.cwd(), "fonts", "arial.ttf")
		const fontExists = await fs
			.access(fontPath)
			.then(() => true)
			.catch(() => false)

		if (fontExists) {
			textToSVG = await TextToSVG.load(fontPath)
			return textToSVG
		}
	} catch (err) {
		console.warn("Custom font not found, falling back to system font")
	}

	// Fallback to system fonts - try common paths
	const systemFontPaths = [
		"/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", // Linux/Netlify
		"/System/Library/Fonts/ArialHB.ttc", // macOS
		"/Windows/Fonts/arial.ttf", // Windows
	]

	for (const fontPath of systemFontPaths) {
		try {
			const exists = await fs
				.access(fontPath)
				.then(() => true)
				.catch(() => false)
			if (exists) {
				textToSVG = await TextToSVG.load(fontPath)
				return textToSVG
			}
		} catch (err) {
			// Continue to next path
		}
	}

	// If nothing works, throw error
	throw new Error("No suitable font found for text rendering")
}

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
			let fontSize = 48
			let textHeight = 70
			let textWidth =
				Math.max(watermarkText.length * fontSize * 0.5, fontSize * 2) +
				20
			const brainSize = 50
			const margin = 3
			const composites = []

			try {
				// Load and add brain SVG to upper left
				const brainPath = path.join(process.cwd(), "static/brain.svg")
				const brainSvgStr = await fs.readFile(brainPath, "utf8")

				// Clean SVG content
				const cleanedSvg = brainSvgStr
					.replace(/<\?xml[^?]*\?>/, "")
					.replace(/<svg[^>]*>/, "")
					.replace(/<\/svg>/, "")

				// Wrap SVG with proper dimensions
				const wrappedSvg = `<svg width="${brainSize}" height="${brainSize}" viewBox="0 0 497 491" xmlns="http://www.w3.org/2000/svg">${cleanedSvg}</svg>`

				const brainBuffer = await sharp(Buffer.from(wrappedSvg))
					.resize(brainSize, brainSize, {fit: "cover"})
					.png()
					.toBuffer()

				// Add brain to upper left corner
				composites.push({
					input: brainBuffer,
					left: margin,
					top: height - brainSize - margin,
				})
			} catch (err) {
				console.warn("Brain SVG error:", err.message)
			}

			// Create text image using text-to-svg (converts text to path)
			// This works reliably on Netlify by converting fonts to vector paths
			let textBuffer = null

			try {
				const fontLoader = await getTextToSVG()
				const fontSize = 40

				// Convert text to SVG path
				const textSvgPath = fontLoader.getSVG(watermarkText, {
					x: 0,
					y: 0,
					fontSize: fontSize,
					anchor: "top left",
					attributes: {
						fill: "white",
						stroke: "none",
					},
				})

				// Create SVG with shadow effect
				const textSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${textWidth}" height="${textHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
      <feOffset dx="1" dy="1" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.4"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <g filter="url(#shadow)">
    ${textSvgPath}
  </g>
</svg>`

				textBuffer = await sharp(Buffer.from(textSvg), {density: 96})
					.resize(Math.ceil(textWidth), Math.ceil(textHeight), {
						fit: "contain",
						background: {r: 0, g: 0, b: 0, alpha: 0},
					})
					.png()
					.toBuffer()
			} catch (err) {
				console.warn("SVG text rendering not available on this system")
				// Fallback: create a simple dark rectangle as text placeholder
				textBuffer = await sharp({
					create: {
						width: textWidth,
						height: textHeight,
						channels: 4,
						background: {r: 30, g: 30, b: 30, alpha: 200},
					},
				})
					.png()
					.toBuffer()
			}

			// Only add text buffer if rendering succeeded
			if (textBuffer) {
				composites.push({
					input: textBuffer,
					left: Math.round(brainSize),
					top: Math.round(height - textHeight + 7),
				})
			}

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
