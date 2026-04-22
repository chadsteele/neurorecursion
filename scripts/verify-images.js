#!/usr/bin/env node

import fs from "fs"
import path from "path"
import {fileURLToPath} from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "..")

// Configuration
const ASSET_BASE = "/Users/chad.steele/code/2026/svelte/assets/assets"
const DATA_DIR = path.join(projectRoot, "src/data")

/**
 * Extract all IDs from data files
 */
function extractAllIDs() {
	const ids = {
		conditions: new Set(),
		pioneers: new Set(),
		partners: new Set(),
	}

	// Read Conditions
	const conditionsPath = path.join(DATA_DIR, "Conditions.js")
	const conditionsContent = fs.readFileSync(conditionsPath, "utf-8")
	const conditionIdMatches = conditionsContent.matchAll(/id:\s*"([^"]+)"/g)
	for (const match of conditionIdMatches) {
		ids.conditions.add(match[1])
	}

	// Read Pioneers
	const pioneersPath = path.join(DATA_DIR, "Pioneers.js")
	const pioneersContent = fs.readFileSync(pioneersPath, "utf-8")
	const pioneerIdMatches = pioneersContent.matchAll(/id:\s*"([^"]+)"/g)
	for (const match of pioneerIdMatches) {
		ids.pioneers.add(match[1])
	}

	// Read NGOs (Partners)
	const ngosPath = path.join(DATA_DIR, "NGOs.js")
	const ngosContent = fs.readFileSync(ngosPath, "utf-8")
	const partnerMatches = ngosContent.matchAll(/imageSrc:\s*"([^"]+)"/g)
	for (const match of partnerMatches) {
		const filename = path.basename(match[1]).replace(/\.[^.]+$/, "")
		ids.partners.add(filename)
	}

	return ids
}

/**
 * Get all files from a directory
 */
function getFilesInDirectory(dir) {
	if (!fs.existsSync(dir)) return []
	return fs
		.readdirSync(dir)
		.filter((f) => !f.startsWith(".") && f.endsWith(".png"))
		.map((f) => f.replace(/\.[^.]+$/, "")) // Remove extension
}

/**
 * Verify image naming
 */
function verifyImageNaming() {
	console.log("🔍 Verifying image file naming...\n")

	const ids = extractAllIDs()
	const results = {
		conditions: {total: 0, correct: 0, incorrect: []},
		pioneers: {total: 0, correct: 0, incorrect: []},
		partners: {total: 0, correct: 0, incorrect: []},
	}

	// Verify Conditions
	console.log("📋 Conditions:")
	const backgroundFiles = getFilesInDirectory(
		path.join(ASSET_BASE, "backgrounds"),
	)
	results.conditions.total = backgroundFiles.length
	for (const file of backgroundFiles) {
		if (ids.conditions.has(file)) {
			results.conditions.correct++
		} else {
			results.conditions.incorrect.push(file)
		}
	}
	console.log(
		`  ✓ Correct: ${results.conditions.correct}/${results.conditions.total}`,
	)
	if (results.conditions.incorrect.length > 0) {
		console.log(
			`  ✗ Incorrect: ${results.conditions.incorrect.slice(0, 5).join(", ")}`,
		)
	}

	// Verify Pioneers
	console.log("\n📋 Pioneers:")
	const pioneerFiles = getFilesInDirectory(path.join(ASSET_BASE, "pioneers"))
	results.pioneers.total = pioneerFiles.length
	for (const file of pioneerFiles) {
		if (ids.pioneers.has(file)) {
			results.pioneers.correct++
		} else {
			results.pioneers.incorrect.push(file)
		}
	}
	console.log(
		`  ✓ Correct: ${results.pioneers.correct}/${results.pioneers.total}`,
	)
	if (results.pioneers.incorrect.length > 0) {
		console.log(
			`  ✗ Incorrect: ${results.pioneers.incorrect.slice(0, 5).join(", ")}`,
		)
	}

	// Verify Partners
	console.log("\n📋 Partners:")
	const partnerFiles = getFilesInDirectory(path.join(ASSET_BASE, "partners"))
	results.partners.total = partnerFiles.length
	for (const file of partnerFiles) {
		if (ids.partners.has(file)) {
			results.partners.correct++
		} else {
			results.partners.incorrect.push(file)
		}
	}
	console.log(
		`  ✓ Correct: ${results.partners.correct}/${results.partners.total}`,
	)
	if (results.partners.incorrect.length > 0) {
		console.log(
			`  ✗ Incorrect: ${results.partners.incorrect.slice(0, 5).join(", ")}`,
		)
	}

	// Summary
	console.log("\n" + "=".repeat(60))
	console.log("✅ VERIFICATION SUMMARY")
	console.log("=".repeat(60))
	const totalFiles =
		results.conditions.total +
		results.pioneers.total +
		results.partners.total
	const totalCorrect =
		results.conditions.correct +
		results.pioneers.correct +
		results.partners.correct
	console.log(`\nTotal: ${totalCorrect}/${totalFiles} files correctly named`)
	console.log(
		`  • Conditions: ${results.conditions.correct}/${results.conditions.total}`,
	)
	console.log(
		`  • Pioneers: ${results.pioneers.correct}/${results.pioneers.total}`,
	)
	console.log(
		`  • Partners: ${results.partners.correct}/${results.partners.total}`,
	)

	if (totalCorrect === totalFiles) {
		console.log("\n🎉 All images are correctly named to {id}.png format!")
	} else {
		console.log("\n⚠️  Some images may need renaming. See details above.")
	}
}

verifyImageNaming()
