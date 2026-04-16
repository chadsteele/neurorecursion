#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Configuration
const ASSET_BASE = "/Users/chad.steele/code/2026/svelte/assets/assets";
const DATA_DIR = path.join(projectRoot, "src/data");

/**
 * Main rename function - handles all image renaming to {id}.png format
 */
class ImageRenamer {
	constructor() {
		this.dataFiles = {
			conditions: {
				path: path.join(DATA_DIR, "Conditions.js"),
				imageField: "background_image",
				imageDir: path.join(ASSET_BASE, "backgrounds"),
				cdnPath: "backgrounds",
			},
			pioneers: {
				path: path.join(DATA_DIR, "Pioneers.js"),
				imageFields: ["img_url", "background_url"],
				imageDir: path.join(ASSET_BASE, "pioneers"),
				cdnPath: "pioneers",
			},
			partners: {
				path: path.join(DATA_DIR, "NGOs.js"),
				imageField: "imageSrc",
				imageDir: path.join(ASSET_BASE, "partners"),
				cdnPath: "partners",
			},
		};
		this.renameLog = [];
	}

	/**
	 * Extract all ID -> current filename mappings from data files
	 */
	extractMappings() {
		const mappings = { conditions: {}, pioneers: {}, partners: {} };

		// Process Conditions
		const conditionsContent = fs.readFileSync(this.dataFiles.conditions.path, "utf-8");
		const conditionMatches = conditionsContent.matchAll(
			/id:\s*"([^"]+)"[\s\S]*?background_image:\s*"([^"]+)"/g
		);
		for (const match of conditionMatches) {
			const [, id, url] = match;
			const filename = path.basename(url);
			mappings.conditions[filename] = { id, url };
		}

		// Process Pioneers
		const pioneersContent = fs.readFileSync(this.dataFiles.pioneers.path, "utf-8");
		const pioneerMatches = pioneersContent.matchAll(
			/id:\s*"([^"]+)"[\s\S]*?img_url:\s*"([^"]+)"/g
		);
		for (const match of pioneerMatches) {
			const [, id, url] = match;
			const filename = path.basename(url);
			mappings.pioneers[filename] = { id, url, field: "img_url" };
		}

		// Also get background_url for pioneers
		const bgMatches = pioneersContent.matchAll(
			/id:\s*"([^"]+)"[\s\S]*?background_url:\s*"([^"]+)"/g
		);
		for (const match of bgMatches) {
			const [, id, url] = match;
			if (url && url.trim()) {
				const filename = path.basename(url);
				mappings.pioneers[filename] = { id, url, field: "background_url" };
			}
		}

		// Process Partners/NGOs
		const ngosContent = fs.readFileSync(this.dataFiles.partners.path, "utf-8");
		const partnerMatches = ngosContent.matchAll(
			/imageSrc:\s*"\/partners\/([^"]+)"/g
		);
		for (const match of partnerMatches) {
			const filename = match[1];
			const id = filename.replace(/\.[^.]+$/, ""); // Remove extension
			mappings.partners[filename] = { id, filename };
		}

		return mappings;
	}

	/**
	 * Rename files in a directory based on mappings
	 */
	renameFiles(category, mappings) {
		const config = this.dataFiles[category];
		const renames = [];

		if (!fs.existsSync(config.imageDir)) {
			console.warn(`  ⚠️  Directory not found: ${config.imageDir}`);
			return renames;
		}

		const files = fs.readdirSync(config.imageDir);

		for (const file of files) {
			if (file.startsWith(".")) continue;

			// Check if this file is in our mappings
			if (mappings[file]) {
				const { id } = mappings[file];
				const ext = path.extname(file);
				const newName = `${id}${ext}`;

				if (file !== newName) {
					const oldPath = path.join(config.imageDir, file);
					const newPath = path.join(config.imageDir, newName);

					try {
						fs.renameSync(oldPath, newPath);
						renames.push({ oldName: file, newName, id });
						this.renameLog.push(`✓ ${category}: ${file} → ${newName}`);
					} catch (error) {
						this.renameLog.push(`✗ ${category}: Failed to rename ${file} - ${error.message}`);
					}
				}
			}
		}

		return renames;
	}

	/**
	 * Update references in data files
	 */
	updateReferences(category, renames) {
		const config = this.dataFiles[category];
		const filePath = config.path;
		let content = fs.readFileSync(filePath, "utf-8");

		for (const { oldName, newName } of renames) {
			// Create a regex pattern to find and replace the old URL with the new one
			const oldUrlPattern = new RegExp(
				oldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
				"g"
			);
			const newUrlContent = content.replace(oldUrlPattern, newName);
			content = newUrlContent;
		}

		fs.writeFileSync(filePath, content, "utf-8");
		this.renameLog.push(`✓ Updated ${path.basename(filePath)}`);
	}

	/**
	 * Main execution
	 */
	run() {
		console.log("🚀 Image Rename Utility\n");
		console.log("Processing image files and data files...\n");

		const mappings = this.extractMappings();

		// Process each category
		for (const category of ["conditions", "pioneers", "partners"]) {
			console.log(`\n📋 ${category.toUpperCase()}`);
			const renames = this.renameFiles(category, mappings[category]);

			if (renames.length > 0) {
				console.log(`  Renaming ${renames.length} files...`);
				this.updateReferences(category, renames);
				console.log(`  ✓ Updated data file`);
			} else {
				console.log(`  No files to rename`);
			}
		}

		// Print summary
		console.log("\n" + "=".repeat(60));
		console.log("📊 RENAME SUMMARY");
		console.log("=".repeat(60));
		console.log(this.renameLog.join("\n"));

		const successCount = this.renameLog.filter((l) => l.startsWith("✓")).length;
		console.log("\n✅ Rename process complete! " + successCount + " operations succeeded.");
	}
}

// Execute
const renamer = new ImageRenamer();
renamer.run();
