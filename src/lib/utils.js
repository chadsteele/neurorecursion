import Conditions from "./Conditions.js"

export function slugToCondition(slug) {
	return Conditions.find((condition) => nameToSlug(condition.name) === slug)
}

export function nameToSlug(name) {
	return name
		.toLowerCase()
		.replace(/[&/\\#, +()$~%.'":*?<>{}]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
}

export function getAllConditionSlugs() {
	return Conditions.map((condition) => nameToSlug(condition.name))
}
