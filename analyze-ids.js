import Conditions from "./src/data/Conditions.js"
import {Categories} from "./src/data/Categories.js"

// Extract unique IDs from Conditions
const conditionIds = new Set(Conditions.map((c) => c.id))

// Extract unique IDs from Categories
const categoryIds = new Set()
Categories.forEach((cat) => {
	cat.ids.forEach((id) => categoryIds.add(id))
})

// Find differences
const inConditionsNotCategories = Array.from(conditionIds)
	.filter((id) => !categoryIds.has(id))
	.sort()
const inCategoriesNotConditions = Array.from(categoryIds)
	.filter((id) => !conditionIds.has(id))
	.sort()
const inBoth = Array.from(conditionIds)
	.filter((id) => categoryIds.has(id))
	.sort()

console.log("=== UNIQUE CONDITION IDS ANALYSIS ===\n")
console.log("Total unique IDs in Conditions.js:", conditionIds.size)
console.log("Total unique IDs in Categories.js:", categoryIds.size)
console.log("IDs referenced in BOTH files:", inBoth.length)
console.log("")

console.log("=== IN CONDITIONS BUT NOT IN CATEGORIES ===")
console.log("Count:", inConditionsNotCategories.length)
console.log("")
inConditionsNotCategories.forEach((id) => console.log("  - " + id))

console.log("")
console.log("=== IN CATEGORIES BUT NOT IN CONDITIONS ===")
console.log("Count:", inCategoriesNotConditions.length)
console.log("")
inCategoriesNotConditions.forEach((id) => console.log("  - " + id))
