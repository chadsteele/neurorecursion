# SOLUTION: Auto-Generated Derived Files

## Summary

✅ **RESOLVED** - `conditions-metadata.js` and `schema-conditions.json` are now:

- **Automatically generated** from master sources during the build process
- **Excluded from version control** (added to .gitignore)
- **Guaranteed to stay in sync** with Conditions.js and Pioneers.js
- **Regenerated on every build** to ensure consistency

## How It Works

### The Prebuild Pipeline

When you run `npm run build` (or `npm run prebuild`), three generation scripts execute in sequence:

```
1. scripts/generate-metadata.js
   └─→ Reads: src/lib/Conditions.js, src/lib/Pioneers.js
   └─→ Outputs: src/data/conditions-metadata.js
   └─→ Creates: CONDITIONS_METADATA and PIONEERS_METADATA arrays

2. scripts/generate-sitemap.js
   └─→ Generates: static/sitemap.xml

3. scripts/generate-schemas.js
   └─→ Reads: src/lib/Conditions.js, src/lib/Pioneers.js
   └─→ Outputs: static/schema-*.json files
       ├─ schema-conditions.json (86 condition JSON-LD schemas)
       ├─ schema-pioneers.json (17 pioneer Person schemas)
       ├─ schema-org.json (organization schema)
       └─ schema-breadcrumbs.json (breadcrumb examples)
```

### Key Improvements Made

1. **Improved Metadata Generator** (`scripts/generate-metadata.js`)
    - Now imports Conditions.js and Pioneers.js directly as ES modules
    - More robust: No regex parsing needed
    - 100% accurate: Captures all 86 conditions (was missing some before)
    - Handles any field ordering in condition objects

2. **Updated .gitignore**
    - Added `src/data/conditions-metadata.js`
    - Added `static/schema-conditions.json`
    - Added `static/schema-pioneers.json`
    - Added `static/schema-org.json`
    - Added `static/schema-breadcrumbs.json`

3. **Documentation** (`GENERATED_FILES.md`)
    - Clear explanation of what files are generated
    - Instructions for development and production workflows
    - Troubleshooting guide

## Usage

### Development

```bash
npm run prebuild  # Generate all derived files
npm run dev       # Start dev server (with generated files)
```

### Production / CI/CD

```bash
npm run build     # prebuild + vite build
# Generated files are created automatically, then app is built with them
```

## Sync Status

| File                    | Source      | MasterSource | Auto-Generated          |
| ----------------------- | ----------- | ------------ | ----------------------- |
| Conditions.js           | `src/lib/`  | ✅ Master    | -                       |
| Pioneers.js             | `src/lib/`  | ✅ Master    | -                       |
| conditions-metadata.js  | `src/data/` | -            | ✅ Auto (86 conditions) |
| schema-conditions.json  | `static/`   | -            | ✅ Auto (86 schemas)    |
| schema-pioneers.json    | `static/`   | -            | ✅ Auto (17 schemas)    |
| schema-org.json         | `static/`   | -            | ✅ Auto                 |
| schema-breadcrumbs.json | `static/`   | -            | ✅ Auto                 |

## Testing the System

Verify everything works:

```bash
# Regenerate all files
npm run prebuild

# Check counts match
grep 'id: "' src/lib/Conditions.js | grep -v description | wc -l      # Should: 86
node -e "const m = require('./src/data/conditions-metadata.js'); console.log(m.CONDITIONS_METADATA.length)"  # Should: 86

# Now you can safely build
npm run build
```

## Why This Approach?

This system solves the original problem:

❌ **Old Problem:**

- Multiple source files (Conditions.js, categories, metadata, schema)
- Manual sync required across 4+ files
- Easy to have mismatches (as we discovered during refactoring)
- Adding new conditions required edits in N places
- High risk of inconsistency

✅ **New Solution:**

- Single source of truth (Conditions.js)
- Derived files generated automatically on-demand
- Changes to Conditions.js automatically propagate everywhere
- No manual sync needed
- 100% consistency guaranteed
- CI/CD friendly (regenerate to verify on every build)

## Important Notes

- **Do NOT manually edit** the generated files listed above
- **Always edit** `src/lib/Conditions.js` and `src/lib/Pioneers.js` directly
- **Run `npm run prebuild`** after making changes to verify generation works
- **Commit only** the master source files to git
- Generated files are in `.gitignore` so they won't be committed
