const fs = require("fs")
const files = [
	"static/logo.blue.png",
	"static/logo.blue.shadows copy.png",
	"static/logo.brush.png",
	"static/logo.institute.png",
	"static/logo.berkeley.shadows.png",
	"static/logo.berkeley.dark.shadows.png",
	"static/logo copy.png",
	"static/whitespot.png",
	"static/backgrounds/neural.png",
	"static/backgrounds/attached.png",
	"static/backgrounds/children-playing-grass_1098-504.png",
	"static/backgrounds/group-diverse-kids-playing-field-together_53876-78365.png",
	"static/backgrounds/istockphoto-998670532-612x612.png",
	"static/backgrounds/sharma-obesity-kids-playing-outside.png",
	"static/backgrounds/smiling-kids-playing-with-multi-colored-toy-blocks-generated-by-ai-free-photo.png",
]

let deleted = 0
let failed = 0
files.forEach((f) => {
	try {
		fs.unlinkSync(f)
		deleted++
	} catch (e) {
		console.log("Failed: " + f)
		failed++
	}
})
console.log("✓ Deleted: " + deleted)
console.log("✗ Failed: " + failed)
