#!/usr/bin/env node

import fs from "fs"
import path from "path"
import {execSync} from "child_process"
import {fileURLToPath} from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const staticDir = path.join(__dirname, "../static")
const srcDir = path.join(__dirname, "../src")

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

// Get all image files and text files
const allImageFiles = getAllFiles(staticDir, "jpg|jpeg|webp|avif").map(
	(fullPath) => {
		const relPath = path.relative(staticDir, fullPath)
		return {fullPath, relPath, fileName: path.basename(fullPath)}
	},
)

console.log(`Found ${allImageFiles.length} image files to convert`)

// Image conversion mapping
const conversionMap = {}
let convertedCount = 0

allImageFiles.forEach(({fullPath, relPath, fileName}) => {
	const newFileName = fileName.replace(/\.(jpg|jpeg|webp|avif)$/i, ".png")
	const newRelPath = relPath.replace(/\.(jpg|jpeg|webp|avif)$/i, ".png")
	const newPath = path.join(path.dirname(fullPath), newFileName)

	console.log(`Converting: ${relPath} → ${newRelPath}`)

	try {
		execSync(`convert "${fullPath}" -resize 800x800\\> "${newPath}"`, {
			stdio: "pipe",
		})
		fs.unlinkSync(fullPath)
		console.log(`✓ Converted and removed: ${fileName}`)
		conversionMap[`/${relPath}`] = `/${newRelPath}`
		convertedCount++
	} catch (err) {
		console.error(`✗ Failed to convert ${relPath}:`, err.message)
	}
})

console.log("\n--- Updating code references ---\n")

const filesToUpdate = getAllFiles(srcDir, "js|svelte|ts|tsx|jsx|json")

filesToUpdate.forEach((filePath) => {
	if (!fs.existsSync(filePath)) return

	let content = fs.readFileSync(filePath, "utf-8")
	let hasChanges = false

	Object.entries(conversionMap).forEach(([oldRef, newRef]) => {
		if (content.includes(oldRef)) {
			content = content.replaceAll(oldRef, newRef)
			console.log(
				`✓ Updated in ${path.basename(filePath)}: ${oldRef} → ${newRef}`,
			)
			hasChanges = true
		}
	})

	if (hasChanges) {
		fs.writeFileSync(filePath, content, "utf-8")
	}
})

console.log(`\n✓ Converted ${convertedCount} images to PNG (max 800px)`)
console.log(
	`✓ Updated ${Object.keys(conversionMap).length} references in ${filesToUpdate.length} source files`,
)
