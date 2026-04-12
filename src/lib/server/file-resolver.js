/**
 * Netlify Serverless File Resolution Utility
 *
 * CRITICAL LEARNING: `__dirname` does not reliably point to `/var/task/` on Netlify.
 * Instead, use `process.cwd()` which consistently resolves to `/var/task` in production.
 *
 * Environment Analysis:
 * - Local Dev: __dirname = src/, process.cwd() = project root
 * - Netlify Production: __dirname = /var/task/.netlify/functions-internal, process.cwd() = /var/task
 * - Static files bundled to: /var/task/static/** (referenced as process.cwd() + "/static")
 *
 * Strategy: Always try `process.cwd()/static/` first. Fall back to relative __dirname for local dev.
 */

import fs from "fs/promises"
import path from "path"

/**
 * Resolve a static file path with fallback chains for Netlify/local compatibility
 * @param {string} relativePath - Path relative to /static (e.g., "logo.png", "backgrounds/paranoid.png")
 * @returns {Promise<string>} - Resolved absolute file path
 * @throws {Error} - If file not found in any expected location
 */
export async function resolveStaticFile(relativePath) {
	// Paths to try in priority order
	const pathsToTry = [
		// PRIMARY: Works on both Netlify and local dev
		path.join(process.cwd(), "static", relativePath),
		// FALLBACK: Local development relative to __dirname
		path.join(
			path.dirname(new URL(import.meta.url).pathname),
			"../../static",
			relativePath,
		),
	]

	let lastError = null

	for (const tryPath of pathsToTry) {
		try {
			await fs.access(tryPath)
			return tryPath
		} catch (err) {
			lastError = err
		}
	}

	throw new Error(
		`Static file not found: ${relativePath}. Tried: ${pathsToTry.join(", ")}. Last error: ${lastError?.message}`,
	)
}

/**
 * Read static file with automatic path resolution
 * @param {string} relativePath - Path relative to /static
 * @returns {Promise<Buffer>} - File buffer
 */
export async function readStaticFile(relativePath) {
	const resolvedPath = await resolveStaticFile(relativePath)
	return fs.readFile(resolvedPath)
}
