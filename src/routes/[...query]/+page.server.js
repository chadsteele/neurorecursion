import fs from "fs"
import path from "path"

export const prerender = "auto"

// Load prerender entries from generated file (avoids bundling large data files)
function loadPrerenderedEntries() {
	try {
		const entriesPath = path.join(
			process.cwd(),
			"static",
			"prerender-entries.json",
		)
		const data = fs.readFileSync(entriesPath, "utf-8")
		return JSON.parse(data)
	} catch (e) {
		console.warn(
			"Warning: prerender-entries.json not found. Defaulting to []",
		)
		return []
	}
}

const prerenderedEntries = loadPrerenderedEntries()

// Generate prerender entries - uses data generated during prebuild
export function entries() {
	return prerenderedEntries
}

export async function load({params}) {
	// Return minimal data - avoid serializing large datasets through SvelteKit
	// Data will be loaded client-side instead
	return {}
}
