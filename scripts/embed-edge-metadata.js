/**
 * Post-build script: Embeds conditions metadata into edge function
 * This ensures the edge function has access to the metadata without Netlify
 * trying to bundle a separate data file as an edge function.
 *
 * Usage: node scripts/embed-edge-metadata.js
 */

import fs from "fs"
import path from "path"
import {fileURLToPath} from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, "..")

const metadataPath = path.join(rootDir, "src/lib/server/conditions-metadata.js")
const edgeFunctionPath = path.join(
	rootDir,
	"netlify/edge-functions/rewrite-og-tags.js",
)

/**
 * Embed metadata into edge function
 */
async function embedMetadata() {
	try {
		// Read the metadata file
		const metadataContent = fs.readFileSync(metadataPath, "utf-8")

		// Extract the entire exports (JSON arrays)
		// Find CONDITIONS_METADATA export
		const conditionsMatch = metadataContent.match(
			/export const CONDITIONS_METADATA = (\[[\s\S]*?\]\s*\n)/,
		)
		const pioneersMatch = metadataContent.match(
			/export const PIONEERS_METADATA = (\[[\s\S]*?\]\s*\n)/,
		)

		if (!conditionsMatch || !pioneersMatch) {
			throw new Error(
				"Could not extract metadata from conditions-metadata.js",
			)
		}

		const conditionsExport = `let CONDITIONS_METADATA = ${conditionsMatch[1]}`
		const pioneersExport = `let PIONEERS_METADATA = ${pioneersMatch[1]}`

		// Read the edge function
		let edgeFunctionContent = fs.readFileSync(edgeFunctionPath, "utf-8")

		// Check if metadata is already embedded and remove it
		const startMarker = edgeFunctionContent.indexOf(
			"// EMBEDDED_METADATA_START",
		)
		const endMarker = edgeFunctionContent.indexOf(
			"// EMBEDDED_METADATA_END",
		)
		if (startMarker !== -1 && endMarker !== -1) {
			const beforeMarkers = edgeFunctionContent.substring(0, startMarker)
			const afterMarkers = edgeFunctionContent.substring(
				endMarker + "// EMBEDDED_METADATA_END".length,
			)
			edgeFunctionContent = beforeMarkers + afterMarkers
		}

		// Create the embedded metadata block
		const embeddedBlock = `// EMBEDDED_METADATA_START
// Auto-generated: Metadata embedded at build time
${conditionsExport}
${pioneersExport}
// EMBEDDED_METADATA_END

`

		// Replace the let declarations with the embedded metadata
		// This removes: "let CONDITIONS_METADATA = []" and "let PIONEERS_METADATA = []"
		edgeFunctionContent = edgeFunctionContent.replace(
			/let CONDITIONS_METADATA = \[\]\s*let PIONEERS_METADATA = \[\]/,
			embeddedBlock.trim(),
		)

		// Write the updated edge function
		fs.writeFileSync(edgeFunctionPath, edgeFunctionContent, "utf-8")
		console.log(`✓ Embedded metadata into edge function`)
	} catch (error) {
		console.error("❌ Error embedding metadata:")
		console.error(error.message)
		process.exit(1)
	}
}

embedMetadata()
