# Auto-Generated Files

This project uses a prebuild system to keep derived data files in sync with the master source. **These files should NOT be manually edited.**

## Files Generated During Build

### 1. `src/data/conditions-metadata.js`

- **Source:** `src/lib/Conditions.js` and `src/lib/Pioneers.js`
- **Generator:** `scripts/generate-metadata.js`
- **Purpose:** Exports `CONDITIONS_METADATA` and `PIONEERS_METADATA` arrays with id, path, and background_image
- **Usage:** Currently not imported anywhere, kept for potential future use
- **Generated:** Runs automatically in `npm run prebuild`

### 2. `static/schema-conditions.json`

- **Source:** `src/lib/Conditions.js`
- **Generator:** `scripts/generate-schemas.js`
- **Purpose:** JSON-LD structured data for SEO (one entry per condition)
- **Usage:** Served as static asset for search engine crawlers
- **Generated:** Runs automatically in `npm run prebuild`

### 3. `static/schema-org.json`

- **Source:** Generated from project metadata
- **Generator:** `scripts/generate-schemas.js`
- **Purpose:** Organization schema for homepage
- **Generated:** Runs automatically in `npm run prebuild`

### 4. `static/schema-pioneers.json`

- **Source:** `src/lib/Pioneers.js`
- **Generator:** `scripts/generate-schemas.js`
- **Purpose:** JSON-LD Person schemas for pioneers
- **Generated:** Runs automatically in `npm run prebuild`

### 5. `static/schema-breadcrumbs.json`

- **Source:** Generated from path patterns
- **Generator:** `scripts/generate-schemas.js`
- **Purpose:** Example breadcrumb schemas for navigation
- **Generated:** Runs automatically in `npm run prebuild`

## Workflow

### For Development

```bash
npm run prebuild  # Generate all derived files
npm run dev       # Start dev server
```

### For Production

```bash
npm run build     # Automatically runs prebuild, then vite build
```

## Key Rules

✅ **DO:**

- Edit `src/lib/Conditions.js` (master source)
- Edit `src/lib/Pioneers.js` (master source)
- Run `npm run prebuild` after changes to regenerate all derived files
- Commit only the master source files to git

❌ **DON'T:**

- Manually edit `src/data/conditions-metadata.js`
- Manually edit any `static/schema-*.json` files
- Commit generated files to git (they're in .gitignore)

## Why This Approach?

This system prevents data synchronization issues:

- Single source of truth (Conditions.js, Pioneers.js)
- No manual sync of multiple files required
- Errors in one file propagate everywhere automatically during generation
- Easy to audit: compare before/after of generated files
- CI/CD friendly: regenerate on every build to verify consistency

## Troubleshooting

**If generated files don't match Conditions.js:**

1. Check the extraction regex in the relevant generator script
2. Verify your changes in Conditions.js follow the expected format
3. Run `npm run prebuild` to regenerate
4. Compare generated files with the source

**To regenerate without building:**

```bash
npm run prebuild
```
