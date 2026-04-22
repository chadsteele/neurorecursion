import {legalSections} from "$lib/legalSections.js"

export const prerender = true

export function entries() {
	return legalSections.map((section) => ({
		section: section.slug,
	}))
}
