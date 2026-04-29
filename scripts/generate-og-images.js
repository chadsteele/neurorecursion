/**
 * Pre-build script: Generates OG images for all conditions at build time
 * Serves them as static files so Facebook crawler gets direct static URLs
 *
 * Usage: node scripts/generate-og-images.js
 */

import sharp from "sharp"
import fs from "fs/promises"
import path from "path"
import {fileURLToPath} from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, "..")

// Paths
const conditionsPath = path.join(rootDir, "src/data/Conditions.js")
const pioneersPath = path.join(rootDir, "src/data/Pioneers.js")
const staticLogoPath = path.join(rootDir, "static/logo.blue.shadows.png")
const ogImagesDir = path.join(rootDir, "static/ogimages")

const OG_WIDTH = 1080
const OG_HEIGHT = 566

/**
 * Load Conditions from module
 */
async function loadConditions() {
	try {
		const conditionsModule = await import(`file://${conditionsPath}`)
		return conditionsModule.default || []
	} catch (error) {
		console.error("Failed to load Conditions.js:", error.message)
		throw error
	}
}

/**
 * Load Pioneers from module
 */
async function loadPioneers() {
	try {
		const pioneersModule = await import(`file://${pioneersPath}`)
		return pioneersModule.default || []
	} catch (error) {
		console.error("Failed to load Pioneers.js:", error.message)
		throw error
	}
}

/**
 * Process and save a single OG image
 */
async function generateOGImage(imageBuffer, outputPath, filename) {
	try {
		// Get image metadata
		const metadata = await sharp(imageBuffer).metadata()
		const imgAspect = metadata.width / metadata.height
		const targetAspect = OG_WIDTH / OG_HEIGHT

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
			.resize(OG_WIDTH, OG_HEIGHT, {fit: "fill"})
			.png()
			.toBuffer()

		// Add logo to lower left corner
		const logoSize = Math.round(OG_WIDTH * 0.4)
		const margin = 0

		// Get logo metadata
		const logoMetadata = await sharp(staticLogoPath).metadata()
		const logoAspect = logoMetadata.width / logoMetadata.height

		// Calculate actual logo dimensions
		let logoDisplayWidth, logoDisplayHeight
		if (logoAspect > 1) {
			logoDisplayWidth = logoSize
			logoDisplayHeight = Math.round(logoSize / logoAspect)
		} else {
			logoDisplayWidth = Math.round(logoSize * logoAspect)
			logoDisplayHeight = logoSize
		}

		const logoBuffer = await sharp(staticLogoPath)
			.resize(logoDisplayWidth, logoDisplayHeight, {
				fit: "contain",
				background: {r: 0, g: 0, b: 0, alpha: 0},
			})
			.png()
			.toBuffer()

		// Calculate position for logo
		const logoLeft = margin
		const logoTop = OG_HEIGHT - logoDisplayHeight - margin

		// Composite and save
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

		await fs.writeFile(outputPath, finalBuffer)
		console.log(`✓ Generated: ${filename}`)
		return true
	} catch (err) {
		console.error(`✗ Failed to generate ${filename}:`, err.message)
		return false
	}
}

/**
 * Main function
 */
async function main() {
	try {
		// Ensure output directory exists
		await fs.mkdir(ogImagesDir, {recursive: true})
		console.log(`Using directory: ${ogImagesDir}\n`)

		const conditions = await loadConditions()
		const pioneers = await loadPioneers()
		let successCount = 0
		let totalCount = 0

		// Generate OG images for conditions
		console.log(`Processing ${conditions.length} conditions...`)
		for (const condition of conditions) {
			if (
				!condition.background_image ||
				condition.background_image === "/ogfamily.avif"
			) {
				continue
			}

			totalCount++
			const backgroundPath = path.join(
				rootDir,
				"static",
				condition.background_image,
			)

			try {
				const imageBuffer = await fs.readFile(backgroundPath)
				const filename = `${condition.id}.png`
				const outputPath = path.join(ogImagesDir, filename)
				const success = await generateOGImage(
					imageBuffer,
					outputPath,
					filename,
				)
				if (success) successCount++
			} catch (err) {
				console.error(
					`✗ Failed to read background for ${condition.id}: ${err.message}`,
				)
			}
		}

		// Generate OG images for pioneers
		console.log(`\nProcessing ${pioneers.length} pioneers...`)
		for (const pioneer of pioneers) {
			if (!pioneer.img_url && !pioneer.background_url) {
				continue
			}

			totalCount++
			const imagePath = pioneer.img_url || pioneer.background_url
			const fullPath = path.join(rootDir, "static", imagePath)

			try {
				const imageBuffer = await fs.readFile(fullPath)
				const filename = `pioneer-${pioneer.id}.png`
				const outputPath = path.join(ogImagesDir, filename)
				const success = await generateOGImage(
					imageBuffer,
					outputPath,
					filename,
				)
				if (success) successCount++
			} catch (err) {
				console.error(
					`✗ Failed to read image for pioneer ${pioneer.id}: ${err.message}`,
				)
			}
		}

		console.log(
			`\n✓ Complete: Generated ${successCount}/${totalCount} OG images`,
		)
		if (successCount === totalCount) {
			process.exit(0)
		} else {
			process.exit(1)
		}
	} catch (error) {
		console.error("Fatal error:", error.message)
		process.exit(1)
	}
}

main()
