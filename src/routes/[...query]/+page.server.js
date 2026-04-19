import fs from "fs"
import path from "path"

import Conditions, {ConditionsMap} from "$data/Conditions.js"
import {Categories} from "$data/Categories.js"
import Pioneers, {PioneersMap, sorted} from "$data/Pioneers.js"

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
	return {
		Categories,
		Conditions,
		ConditionsMap,
		Pioneers,
		sortedPioneers: sorted,
		PioneersMap,
	}
}
