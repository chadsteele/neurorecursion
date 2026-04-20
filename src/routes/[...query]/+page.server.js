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

function loadPioneerSchemas() {
	try {
		const schemaPath = path.join(
			process.cwd(),
			"static",
			"schema-pioneers.json",
		)
		const data = fs.readFileSync(schemaPath, "utf-8")
		return JSON.parse(data)
	} catch (e) {
		console.warn(
			"Warning: schema-pioneers.json not found. Defaulting to {}",
		)
		return {}
	}
}

const pioneerSchemas = loadPioneerSchemas()

function getRequestPath(params) {
	const queryArray = params.query
	const queryPath = Array.isArray(queryArray)
		? queryArray.join("/")
		: queryArray || ""

	return queryPath ? `/${queryPath}` : "/"
}

function getPioneerSchemasForPath(params) {
	const requestPath = getRequestPath(params)

	if (requestPath === "/pioneers") {
		return Object.values(pioneerSchemas)
	}

	const matchedPioneer = Pioneers.find(
		(pioneer) => pioneer.path === requestPath,
	)
	if (!matchedPioneer) {
		return []
	}

	return pioneerSchemas[matchedPioneer.id]
		? [pioneerSchemas[matchedPioneer.id]]
		: []
}

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
		pioneerSchemasForPath: getPioneerSchemasForPath(params),
		sortedPioneers: sorted,
		PioneersMap,
	}
}
