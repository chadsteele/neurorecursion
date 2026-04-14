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

// Get all non-PNG image files
const allImageFiles = getAllFiles(staticDir, "jpg|jpeg|webp|avif").map(
	(fullPath) => {
		const relPath = path.relative(staticDir, fullPath)
		return {fullPath, relPath, fileName: path.basename(fullPath)}
	},
)

console.log(`Found ${allImageFiles.length} non-PNG image files to rename`)

// Image rename mapping
const renameMap = {}
let renamedCount = 0

allImageFiles.forEach(({fullPath, relPath, fileName}) => {
	const newFileName = fileName.replace(/\.(jpg|jpeg|webp|avif)$/i, ".png")
	const newRelPath = relPath.replace(/\.(jpg|jpeg|webp|avif)$/i, ".png")
	const newPath = path.join(path.dirname(fullPath), newFileName)

	console.log(`Renaming: ${relPath} → ${newRelPath}`)

	try {
		execSync(`convert "${fullPath}" "${newPath}"`, {
			stdio: "pipe",
		})
		fs.unlinkSync(fullPath)
		console.log(`✓ Renamed and removed: ${fileName}`)
		renameMap[`/${relPath}`] = `/${newRelPath}`
		renamedCount++
	} catch (err) {
		console.error(`✗ Failed to rename ${relPath}:`, err.message)
	}
})

console.log("\n--- Updating code references ---\n")

const filesToUpdate = getAllFiles(srcDir, "js|svelte|ts|tsx|jsx|json")

filesToUpdate.forEach((filePath) => {
	if (!fs.existsSync(filePath)) return

	let content = fs.readFileSync(filePath, "utf-8")
	let hasChanges = false

	Object.entries(renameMap).forEach(([oldRef, newRef]) => {
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

console.log(`\n✓ Renamed ${renamedCount} images to PNG format`)
console.log(
	`✓ Updated ${Object.keys(renameMap).length} references in source files`,
)
