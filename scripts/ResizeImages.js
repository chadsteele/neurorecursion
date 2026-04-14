#!/usr/bin/env node

import fs from "fs"
import path from "path"
import {execSync} from "child_process"
import {fileURLToPath} from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const staticDir = path.join(__dirname, "../static")
const MAX_WIDTH = 800

// Generic file discovery with pattern matching
function getAllFiles(dir, extensions) {
	const files = []
	const extensionPatterns = Array.isArray(extensions)
		? extensions
		: [extensions]
	const regex = new RegExp(`\\.(${extensionPatterns.join("|")})$`, "i")
	const excludeDirs = /^(\.DS_Store|node_modules|\.git)$/

	function scan(dirPath) {
		try {
			fs.readdirSync(dirPath).forEach((entry) => {
				if (excludeDirs.test(entry)) return
				const fullPath = path.join(dirPath, entry)
				const stats = fs.statSync(fullPath)

				if (stats.isDirectory()) {
					scan(fullPath)
				} else if (regex.test(entry)) {
					files.push(fullPath)
				}
			})
		} catch (err) {
			console.error(`Error scanning ${dirPath}:`, err.message)
		}
	}

	scan(dir)
	return files
}

// Get image dimensions using identify command
function getImageDimensions(imagePath) {
	try {
		const output = execSync(`identify -format "%w %h" "${imagePath}"`, {
			stdio: "pipe",
			encoding: "utf-8",
		})
		const [width, height] = output.trim().split(" ").map(Number)
		return {width, height}
	} catch (err) {
		console.error(`Could not get dimensions for ${imagePath}:`, err.message)
		return null
	}
}

// Get all image files
const allImageFiles = getAllFiles(staticDir, "png|jpg|jpeg|webp|avif").map(
	(fullPath) => {
		const relPath = path.relative(staticDir, fullPath)
		return {fullPath, relPath, fileName: path.basename(fullPath)}
	},
)

console.log(`Found ${allImageFiles.length} total image files\n`)

let resizedCount = 0

allImageFiles.forEach(({fullPath, relPath, fileName}) => {
	const dimensions = getImageDimensions(fullPath)

	if (!dimensions) return

	// Only resize if width is greater than MAX_WIDTH
	if (dimensions.width > MAX_WIDTH) {
		console.log(
			`Resizing: ${relPath} (${dimensions.width}x${dimensions.height}) → max ${MAX_WIDTH}px`,
		)

		try {
			// Use ImageMagick's -resize with > flag to only shrink, never enlarge
			// The 800x800\> means: fit within 800x800 only if larger, maintain aspect ratio
			execSync(
				`convert "${fullPath}" -resize ${MAX_WIDTH}x${MAX_WIDTH}\\> "${fullPath}"`,
				{
					stdio: "pipe",
				},
			)

			const newDimensions = getImageDimensions(fullPath)
			console.log(
				`✓ Resized: ${fileName} → ${newDimensions.width}x${newDimensions.height}`,
			)
			resizedCount++
		} catch (err) {
			console.error(`✗ Failed to resize ${relPath}:`, err.message)
		}
	}
})

console.log(
	`\n✓ Resized ${resizedCount} images to max ${MAX_WIDTH}px width (aspect ratio preserved)`,
)
