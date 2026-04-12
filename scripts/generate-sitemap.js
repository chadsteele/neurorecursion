#!/usr/bin/env node

/**
 * Generate sitemap.xml for SEO
 * Includes all routes: conditions, pioneers, and static pages
 */

import fs from "fs/promises"
import path from "path"
import {fileURLToPath} from "url"
import {dirname} from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, "..")
const staticDir = path.join(projectRoot, "static")
const sitemapPath = path.join(staticDir, "sitemap.xml")

// Import conditions and pioneers data
const conditionsModule = await import(
	path.join(projectRoot, "src/lib/Conditions.js")
)
const pioneersModule = await import(
	path.join(projectRoot, "src/lib/Pioneers.js")
)
const categoriesModule = await import(
	path.join(projectRoot, "src/lib/Categories.js")
)

const Conditions = conditionsModule.default
const Pioneers = pioneersModule.default
const {Categories} = categoriesModule

// Base domain - use production URL
const baseUrl = "https://neurorecursion.com"

// Priority and change frequency mapping
const routePriority = {
	"/": 1.0,
	"/pioneers": 0.9,
	"/careers": 0.7,
	"/consent": 0.5,
	"/success": 0.3,
	"/remote-clinical-trial": 0.8, // Category pages
	"/remote-clinical-trial/free": 0.8,
	default: 0.6, // Condition and pioneer pages
}

const changeFreq = {
	"/": "weekly",
	"/pioneers": "monthly",
	"/careers": "monthly",
	"/consent": "yearly",
	"/success": "never",
	default: "monthly",
}

function getPriority(path) {
	for (const [route, priority] of Object.entries(routePriority)) {
		if (path.startsWith(route) && route !== "default") {
			return priority
		}
	}
	return routePriority.default
}

function getChangeFreq(path) {
	for (const [route, freq] of Object.entries(changeFreq)) {
		if (path.startsWith(route) && route !== "default") {
			return freq
		}
	}
	return changeFreq.default
}

function escapeXml(str) {
	return String(str).replace(/[<>&'"]/g, (c) => {
		switch (c) {
			case "<":
				return "&lt;"
			case ">":
				return "&gt;"
			case "&":
				return "&amp;"
			case "'":
				return "&apos;"
			case '"':
				return "&quot;"
		}
	})
}

function generateUrlEntry(loc, priority = 0.6, changefreq = "monthly") {
	return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <priority>${priority}</priority>
    <changefreq>${changefreq}</changefreq>
  </url>`
}

async function generateSitemap() {
	const entries = []

	// Static pages
	entries.push(generateUrlEntry(baseUrl, routePriority["/"], changeFreq["/"])) // Home
	entries.push(
		generateUrlEntry(
			`${baseUrl}/pioneers`,
			routePriority["/pioneers"],
			changeFreq["/pioneers"],
		),
	)
	entries.push(
		generateUrlEntry(
			`${baseUrl}/careers`,
			routePriority["/careers"],
			changeFreq["/careers"],
		),
	)
	entries.push(
		generateUrlEntry(
			`${baseUrl}/consent`,
			routePriority["/consent"],
			changeFreq["/consent"],
		),
	)

	// Category pages
	for (const category of Categories) {
		const categoryPath = `${baseUrl}${category.path}`
		entries.push(
			generateUrlEntry(
				categoryPath,
				getPriority(category.path),
				"monthly",
			),
		)
	}

	// Condition pages
	for (const condition of Conditions) {
		const conditionPath = `${baseUrl}${condition.path}`
		entries.push(generateUrlEntry(conditionPath, 0.6, "monthly"))
	}

	// Pioneer pages
	for (const pioneer of Pioneers) {
		const pioneerPath = `${baseUrl}${pioneer.path}`
		entries.push(generateUrlEntry(pioneerPath, 0.6, "monthly"))
	}

	// Generate XML
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`

	await fs.writeFile(sitemapPath, xml, "utf-8")
	console.log(
		`✓ Generated sitemap.xml (${entries.length} URLs) at ${sitemapPath}`,
	)
}

generateSitemap().catch((err) => {
	console.error("Error generating sitemap:", err)
	process.exit(1)
})
