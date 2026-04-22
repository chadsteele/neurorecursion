import fs from "fs"
import path from "path"
import {fileURLToPath} from "url"
import Conditions from "../src/data/Conditions.js"
import Pioneers from "../src/data/Pioneers.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Generate prerender entries for all condition paths and keywords
const paths = new Set()

Conditions.forEach((condition) => {
	// Add the full path
	const fullPath = condition.path.slice(1) // Remove leading slash
	paths.add(fullPath)

	// Also add each individual word from the path
	const words = fullPath.split("/").filter(Boolean)
	words.forEach((word) => {
		paths.add(word)
	})
})

// Also add pioneer paths
Pioneers.forEach((pioneer) => {
	const fullPath = `pioneers/${pioneer.id}`
	paths.add(fullPath)

	const idWords = pioneer.id.split("-").filter(Boolean)
	idWords.forEach((word) => {
		paths.add(word)
	})
})

// Convert to entries format
const entries = Array.from(paths).map((path) => ({query: path}))

// Write to static file
const outputPath = path.join(__dirname, "../static/prerender-entries.json")
fs.writeFileSync(outputPath, JSON.stringify(entries, null, 2))
console.log(`✓ Generated ${entries.length} prerender entries at ${outputPath}`)
