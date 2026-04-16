import fs from "fs"
import path from "path"
import {fileURLToPath} from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const prerender = "auto"

// Load prerender entries from generated file (avoids bundling large data files)
function loadPrerenderedEntries() {
	try {
		const entriesPath = path.join(
			__dirname,
			"../../static/prerender-entries.json",
		)
		const data = fs.readFileSync(entriesPath, "utf-8")
		return JSON.parse(data)
	} catch (e) {
		console.warn("Warning: prerender-entries.json not found. Defaulting to []")
		return []
	}
}

const prerenderedEntries = loadPrerenderedEntries()

// Generate prerender entries - uses data generated during prebuild
export function entries() {
	return prerenderedEntries
}

export async function load({params}) {
	// Return data from server (not bundled into client)
	// Dynamic imports ensure data files are only loaded on server
	// Only return serializable data - functions cannot be sent to client
	const conditionsModule = await import("../../data/Conditions.js")
	const pioneersModule = await import("../../data/Pioneers.js")
	
	return {
		conditions: conditionsModule.default,
		conditionsMap: conditionsModule.ConditionsMap,
		pioneers: pioneersModule.default,
		sortedPioneers: pioneersModule.sorted,
		pioneersMap: pioneersModule.PioneersMap,
	}
}
