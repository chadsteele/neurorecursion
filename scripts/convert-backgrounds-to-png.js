#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backgroundsDir = path.join(__dirname, "../static/backgrounds");
const srcDir = path.join(__dirname, "../src");

// Get all image files and convert to PNG
const files = fs.readdirSync(backgroundsDir)
const imageFiles = files.filter(
	(f) => /\.(jpg|jpeg|webp|avif)$/i.test(f) && f !== ".DS_Store",
)

console.log(`Found ${imageFiles.length} image files to convert`)

// Image conversion mapping (for reference)
const conversionMap = {}

imageFiles.forEach((file) => {
	const fullPath = path.join(backgroundsDir, file)
	const newFileName = file.replace(/\.(jpg|jpeg|webp|avif)$/i, ".png")
	const newPath = path.join(backgroundsDir, newFileName)

	console.log(`Converting: ${file} → ${newFileName}`)

	try {
		// Use ImageMagick convert command
		// -resize 800x800> means resize to fit in 800x800 box, only if larger
		execSync(`convert "${fullPath}" -resize 800x800\\> "${newPath}"`, {
			stdio: "pipe",
		})

		// Delete original file
		fs.unlinkSync(fullPath)
		console.log(`✓ Converted and removed: ${file}`)

		conversionMap[file] = newFileName
	} catch (err) {
		console.error(`✗ Failed to convert ${file}:`, err.message)
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
	Object.entries(conversionMap).forEach(([oldName, newName]) => {
		const oldRef = `/backgrounds/${oldName}`
		const newRef = `/backgrounds/${newName}`

		if (content.includes(oldRef)) {
			content = content.replaceAll(oldRef, newRef)
			console.log(
				`✓ Updated in ${path.basename(filePath)}: ${oldName} → ${newName}`,
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
