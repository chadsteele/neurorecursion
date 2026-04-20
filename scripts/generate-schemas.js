#!/usr/bin/env node

/**
 * Generate JSON-LD structured data for SEO
 * Creates schema.json for various pages
 */

import fs from "fs/promises"
import path from "path"
import {fileURLToPath} from "url"
import {dirname} from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, "..")
const staticDir = path.join(projectRoot, "static")

// Import data
const conditionsModule = await import(
	path.join(projectRoot, "src/data/Conditions.js")
)
const pioneersModule = await import(
	path.join(projectRoot, "src/data/Pioneers.js")
)
const Conditions = conditionsModule.default
const Pioneers = pioneersModule.default

const baseUrl = "https://neurorecursion.com"

/**
 * Organization schema for homepage
 */
function generateOrganizationSchema() {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "Neuro Recursion Institute",
		url: baseUrl,
		logo: `${baseUrl}/logo.berkeley.png`,
		description:
			"Clinical research program targeting neuroplasticity to treat anxiety, PTSD, phobias, and neurological conditions.",
		sameAs: [],
		address: {
			"@type": "PostalAddress",
			addressCountry: "US",
		},
		contactPoint: {
			"@type": "ContactPoint",
			contactType: "General",
			email: "contact@neurorecursion.com",
		},
	}
}

/**
 * Medical entity schema for conditions
 */
function generateConditionSchema(condition) {
	return {
		"@context": "https://schema.org",
		"@type": "MedicalCondition",
		name: condition.name,
		description: condition.description
			? condition.description.replace(/<[^>]*>/g, "").substring(0, 500)
			: "",
		url: `${baseUrl}${condition.path}`,
		identifier: condition.id,
		mainEntity: {
			"@type": "Thing",
			name: condition.name,
		},
	}
}

/**
 * Person schema for pioneers
 */
function generatePioneerSchema(pioneer) {
	const schema = {
		"@context": "https://schema.org",
		"@type": "Person",
		name: pioneer.name,
		description: pioneer.description || "",
		url: `${baseUrl}${pioneer.path}`,
		jobTitle: pioneer.title,
		affiliation: {
			"@type": "Organization",
			name: pioneer.institution,
		},
		knowsAbout: pioneer.researchAreas || [],
	}

	const pioneerImage = pioneer.img_url || pioneer.background_url
	if (pioneerImage) {
		schema.image = /^https?:\/\//i.test(pioneerImage)
			? pioneerImage
			: `${baseUrl}${pioneerImage}`
	}

	if (pioneer.education) {
		schema.educationDetails = {
			"@type": "EducationalOccupationalCredential",
			credentialCategory: pioneer.education,
		}
	}

	return schema
}

/**
 * Breadcrumb schema for navigation
 */
function generateBreadcrumbSchema(path) {
	const parts = path.split("/").filter(Boolean)
	const items = [
		{
			"@type": "ListItem",
			position: 1,
			name: "Home",
			item: baseUrl,
		},
	]

	let currentPath = ""
	parts.forEach((part, index) => {
		currentPath += `/${part}`
		items.push({
			"@type": "ListItem",
			position: index + 2,
			name: part.charAt(0).toUpperCase() + part.slice(1),
			item: `${baseUrl}${currentPath}`,
		})
	})

	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items,
	}
}

async function generateSchemas() {
	try {
		// Generate organization schema for homepage
		const orgSchema = generateOrganizationSchema()
		await fs.writeFile(
			path.join(staticDir, "schema-org.json"),
			JSON.stringify(orgSchema, null, 2),
		)
		console.log("✓ Generated organization schema")

		// Generate condition schemas
		const conditionSchemas = {}
		for (const condition of Conditions) {
			const schema = generateConditionSchema(condition)
			const fileName = condition.id.replace(/[^a-z0-9-]/g, "-")
			conditionSchemas[condition.id] = schema
		}
		await fs.writeFile(
			path.join(staticDir, "schema-conditions.json"),
			JSON.stringify(conditionSchemas, null, 2),
		)
		console.log(`✓ Generated ${Conditions.length} condition schemas`)

		// Generate pioneer schemas
		const pioneerSchemas = {}
		for (const pioneer of Pioneers) {
			const schema = generatePioneerSchema(pioneer)
			pioneerSchemas[pioneer.id] = schema
		}
		await fs.writeFile(
			path.join(staticDir, "schema-pioneers.json"),
			JSON.stringify(pioneerSchemas, null, 2),
		)
		console.log(`✓ Generated ${Pioneers.length} pioneer schemas`)

		// Generate example breadcrumb schemas
		const exampleBreadcrumbs = {
			"home-breadcrumb": generateBreadcrumbSchema("/"),
			"condition-breadcrumb": generateBreadcrumbSchema(
				"/remote-clinical-trial/free/depression",
			),
			"pioneer-breadcrumb": generateBreadcrumbSchema("/pioneers"),
		}
		await fs.writeFile(
			path.join(staticDir, "schema-breadcrumbs.json"),
			JSON.stringify(exampleBreadcrumbs, null, 2),
		)
		console.log("✓ Generated breadcrumb schemas")

		console.log("\n✅ All structured data schemas generated successfully!")
	} catch (err) {
		console.error("Error generating schemas:", err)
		process.exit(1)
	}
}

generateSchemas()
