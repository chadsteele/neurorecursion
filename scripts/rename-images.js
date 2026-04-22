#!/usr/bin/env node

import fs from "fs"
import path from "path"
import {fileURLToPath} from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "..")

// Configuration
const ASSET_BASE = "/Users/chad.steele/code/2026/svelte/assets/assets"
const DATA_DIR = path.join(projectRoot, "src/data")
const BACKGROUNDS_DIR = path.join(ASSET_BASE, "backgrounds")
const PIONEERS_DIR = path.join(ASSET_BASE, "pioneers")
const PARTNERS_DIR = path.join(ASSET_BASE, "partners")

// Image file mappings (extracted from current structure)
const imageTypeDirs = {
	conditions: {
		assetDir: BACKGROUNDS_DIR,
		filePropertyName: "background_image",
		cdnPath: "backgrounds",
	},
	pioneers: {
		assetDir: PIONEERS_DIR,
		filePropertyName: "img_url",
		cdnPath: "pioneers",
	},
	partners: {
		assetDir: PARTNERS_DIR,
		filePropertyName: "imageSrc",
		cdnPathLocal: "partners", // local path only, no CDN
	},
}

/**
 * Read and parse a JavaScript data file
 */
function readDataFile(filePath) {
	const content = fs.readFileSync(filePath, "utf-8")
	return content
}

/**
 * Extract IDs and image filenames from data file
 */
function extractImageMappings(dataContent, type) {
	const mappings = new Map()

	if (type === "conditions") {
		const conditionMatches = dataContent.matchAll(
			/{\s*id:\s*"([^"]+)"[\s\S]*?background_image:\s*"([^"]+)"/g,
		)
		for (const match of conditionMatches) {
			const id = match[1]
			const imageUrl = match[2]
			const filename = path.basename(imageUrl)
			mappings.set(filename, {id, imageUrl, type: "conditions"})
		}
	} else if (type === "pioneers") {
		const pioneerMatches = dataContent.matchAll(
			/{\s*id:\s*"([^"]+)"[\s\S]*?img_url:\s*"([^"]+)"/g,
		)
		for (const match of pioneerMatches) {
			const id = match[1]
			const imageUrl = match[2]
			const filename = path.basename(imageUrl)
			mappings.set(filename, {id, imageUrl, type: "pioneers"})
		}

		// Also handle background_url
		const bgMatches = dataContent.matchAll(
			/{\s*id:\s*"([^"]+)"[\s\S]*?background_url:\s*"([^"]+)"/g,
		)
		for (const match of bgMatches) {
			const id = match[1]
			const imageUrl = match[2]
			if (imageUrl && imageUrl.trim()) {
				// Only if not empty
				const filename = path.basename(imageUrl)
				mappings.set(filename, {id, imageUrl, type: "pioneers-bg"})
			}
		}
	} else if (type === "partners") {
		const partnerMatches = dataContent.matchAll(/imageSrc:\s*"([^"]+)"/g)
		for (const match of partnerMatches) {
			const imageUrl = match[1]
			const filename = path.basename(imageUrl)
			// Try to find the ID by reverse matching from directory
			mappings.set(filename, {
				id: filename.replace(/\.[^.]+$/, ""),
				imageUrl,
				type: "partners",
			})
		}
	}

	return mappings
}

/**
 * Rename files in specified directory
 */
function renameFilesInDirectory(dir, newNameMap) {
	if (!fs.existsSync(dir)) {
		console.warn(`Directory does not exist: ${dir}`)
		return []
	}

	const files = fs.readdirSync(dir)
	const renamedFiles = []

	for (const file of files) {
		if (file.startsWith(".")) continue // Skip hidden files

		if (newNameMap.has(file)) {
			const {id} = newNameMap.get(file)
			const ext = path.extname(file)
			const newName = `${id}${ext}`
			const oldPath = path.join(dir, file)
			const newPath = path.join(dir, newName)

			if (oldPath !== newPath) {
				fs.renameSync(oldPath, newPath)
				renamedFiles.push({
					oldName: file,
					newName,
					dir: path.basename(dir),
				})
				console.log(`✓ Renamed: ${file} → ${newName}`)
			}
		}
	}

	return renamedFiles
}

/**
 * Update image URLs in data file
 */
function updateDataFile(filePath, type, renamedFiles, cdnPath) {
	let content = readDataFile(filePath)
	const fileMap = new Map(
		renamedFiles.map(({oldName, newName}) => [oldName, newName]),
	)

	if (type === "conditions") {
		// Replace background_image URLs
		content = content.replace(
			/background_image:\s*"([^"]+)"/g,
			(match, url) => {
				const filename = path.basename(url)
				if (fileMap.has(filename)) {
					const newFilename = fileMap.get(filename)
					const newUrl = url.replace(filename, newFilename)
					console.log(`  URL: ${filename} → ${newFilename}`)
					return `background_image: "${newUrl}"`
				}
				return match
			},
		)
	} else if (type === "pioneers") {
		// Replace img_url URLs
		content = content.replace(/img_url:\s*"([^"]+)"/g, (match, url) => {
			const filename = path.basename(url)
			if (fileMap.has(filename)) {
				const newFilename = fileMap.get(filename)
				const newUrl = url.replace(filename, newFilename)
				console.log(`  img_url: ${filename} → ${newFilename}`)
				return `img_url: "${newUrl}"`
			}
			return match
		})

		// Replace background_url URLs
		content = content.replace(
			/background_url:\s*"([^"]+)"/g,
			(match, url) => {
				if (!url || !url.trim()) return match // Skip empty URLs
				const filename = path.basename(url)
				if (fileMap.has(filename)) {
					const newFilename = fileMap.get(filename)
					const newUrl = url.replace(filename, newFilename)
					console.log(
						`  background_url: ${filename} → ${newFilename}`,
					)
					return `background_url: "${newUrl}"`
				}
				return match
			},
		)
	} else if (type === "partners") {
		// Replace imageSrc URLs while preserving the existing CDN base.
		content = content.replace(/imageSrc:\s*"([^"]+)"/g, (match, url) => {
			const filename = path.basename(url)
			if (fileMap.has(filename)) {
				const newFilename = fileMap.get(filename)
				const newUrl = url.replace(filename, newFilename)
				console.log(`  imageSrc: ${filename} → ${newFilename}`)
				return `imageSrc: "${newUrl}"`
			}
			return match
		})
	}

	// Write back to file
	fs.writeFileSync(filePath, content, "utf-8")
	console.log(`✓ Updated: ${path.basename(filePath)}\n`)
}

/**
 * Main execution
 */
async function main() {
	console.log("🚀 Starting image rename process...\n")

	// Process Conditions
	console.log("📋 Processing Conditions...")
	const conditionsPath = path.join(DATA_DIR, "Conditions.js")
	const conditionsContent = readDataFile(conditionsPath)
	const conditionsMappings = extractImageMappings(
		conditionsContent,
		"conditions",
	)
	const renamedConditions = renameFilesInDirectory(
		BACKGROUNDS_DIR,
		conditionsMappings,
	)
	if (renamedConditions.length > 0) {
		updateDataFile(
			conditionsPath,
			"conditions",
			renamedConditions,
			imageTypeDirs.conditions.cdnPath,
		)
	} else {
		console.log("No Conditions images to rename\n")
	}

	// Process Pioneers
	console.log("📋 Processing Pioneers...")
	const pioneersPath = path.join(DATA_DIR, "Pioneers.js")
	const pioneersContent = readDataFile(pioneersPath)
	const pioneersMappings = extractImageMappings(pioneersContent, "pioneers")
	const renamedPioneers = renameFilesInDirectory(
		PIONEERS_DIR,
		pioneersMappings,
	)
	if (renamedPioneers.length > 0) {
		updateDataFile(
			pioneersPath,
			"pioneers",
			renamedPioneers,
			imageTypeDirs.pioneers.cdnPath,
		)
	} else {
		console.log("No Pioneers images to rename\n")
	}

	// Process Partners (NGOs)
	console.log("📋 Processing Partners (NGOs)...")
	const ngosPath = path.join(DATA_DIR, "NGOs.js")
	const ngosContent = readDataFile(ngosPath)
	const partnersMappings = extractImageMappings(ngosContent, "partners")
	const renamedPartners = renameFilesInDirectory(
		PARTNERS_DIR,
		partnersMappings,
	)
	if (renamedPartners.length > 0) {
		updateDataFile(ngosPath, "partners", renamedPartners, "partners")
	} else {
		console.log("No Partners images to rename\n")
	}

	console.log("✅ Image rename process complete!")
	console.log(
		`\nSummary:\n  Conditions: ${renamedConditions.length} renamed\n  Pioneers: ${renamedPioneers.length} renamed\n  Partners: ${renamedPartners.length} renamed`,
	)
}

main().catch((err) => {
	console.error("❌ Error:", err.message)
	process.exit(1)
})
