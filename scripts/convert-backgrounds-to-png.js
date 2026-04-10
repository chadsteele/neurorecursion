#!/usr/bin/env node

import fs from "fs"
import path from "path"
import {execSync} from "child_process"
import {fileURLToPath} from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const staticDir = path.join(__dirname, "../static")
const srcDir = path.join(__dirname, "../src")

// Get all image files recursively from all subdirectories in static/
function getAllImageFiles(dir, relDir = "") {
	const imageFiles = []
	const entries = fs.readdirSync(dir)

	entries.forEach((entry) => {
		if (entry === ".DS_Store") return
		const fullPath = path.join(dir, entry)
		const relPath = relDir ? `${relDir}/${entry}` : entry
		const stats = fs.statSync(fullPath)

		if (stats.isDirectory()) {
			// Recursively process subdirectories
			imageFiles.push(...getAllImageFiles(fullPath, relPath))
		} else if (/\.(jpg|jpeg|webp|avif)$/i.test(entry)) {
			imageFiles.push({fullPath, relPath, fileName: entry})
		}
	})

	return imageFiles
}

const allImageFiles = getAllImageFiles(staticDir)

console.log(`Found ${allImageFiles.length} image files to convert`)

// Image conversion mapping (for reference)
const conversionMap = {}

allImageFiles.forEach(({fullPath, relPath, fileName}) => {
	const newFileName = fileName.replace(/\.(jpg|jpeg|webp|avif)$/i, ".png")
	const newPath = path.join(path.dirname(fullPath), newFileName)
	const newRelPath = relPath.replace(/\.(jpg|jpeg|webp|avif)$/i, ".png")

	console.log(`Converting: ${relPath} → ${newRelPath}`)

	try {
		// Use ImageMagick convert command
		// -resize 800x800> means resize to fit in 800x800 box, only if larger
		execSync(`convert "${fullPath}" -resize 800x800\\> "${newPath}"`, {
			stdio: "pipe",
		})

		// Delete original file
		fs.unlinkSync(fullPath)
		console.log(`✓ Converted and removed: ${fileName}`)

		conversionMap[`/${relPath}`] = `/${newRelPath}`
	} catch (err) {
		console.error(`✗ Failed to convert ${relPath}:`, err.message)
	}
})

console.log("\n--- Updating code references ---\n")

// Update references in codebase
const filesToUpdate = [
	path.join(srcDir, "lib/Conditions.js"),
	path.join(srcDir, "routes/[[query]]/+page.svelte"),
	path.join(srcDir, "routes/[...query]/+page.svelte"),
	path.join(srcDir, "routes/careers/+page.svelte"),
]

filesToUpdate.forEach((filePath) => {
	if (!fs.existsSync(filePath)) {
		console.log(`⊘ File not found: ${filePath}`)
		return
	}

	let content = fs.readFileSync(filePath, "utf-8")
	let updated = false

	// Replace all image references
	Object.entries(conversionMap).forEach(([oldRef, newRef]) => {
		if (content.includes(oldRef)) {
			content = content.replaceAll(oldRef, newRef)
			console.log(
				`✓ Updated in ${path.basename(filePath)}: ${oldRef} → ${newRef}`,
			)
			updated = true
		}
	})

	if (updated) {
		fs.writeFileSync(filePath, content, "utf-8")
	}
})

console.log("\n✓ All backgrounds converted to PNG (max 800px width)")
console.log("✓ All code references updated")
