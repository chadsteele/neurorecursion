import {readdir, writeFile} from "fs/promises"
import {join} from "path"
import {fileURLToPath} from "url"
import {dirname} from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, "..")

async function generateBackgroundsList() {
	try {
		const backgroundsDir = join(projectRoot, "static", "backgrounds")
		const files = await readdir(backgroundsDir)

		// Filter image files
		const imageExtensions = [
			".jpg",
			".jpeg",
			".png",
			".gif",
			".webp",
			".avif",
		]
		const images = files
			.filter((file) =>
				imageExtensions.some((ext) => file.toLowerCase().endsWith(ext)),
			)
			.sort()

		// Write to src/lib/backgrounds.json
		const outputPath = join(projectRoot, "src", "lib", "backgrounds.json")
		await writeFile(outputPath, JSON.stringify(images, null, 2))

		console.log(`Generated backgrounds list: ${images.length} images`)
	} catch (error) {
		console.error("Error generating backgrounds list:", error)
		process.exit(1)
	}
}

generateBackgroundsList()
