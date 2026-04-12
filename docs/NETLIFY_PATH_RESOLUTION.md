# Netlify Serverless File Path Resolution Guide

## Critical Learning: \_\_dirname Unreliability on Netlify

This document captures lessons learned from extensive debugging of file path resolution failures on Netlify serverless functions.

### The Problem

**Symptom:** `ENOENT: no such file or directory, open '/static/...` errors in production despite files being bundled.

**Root Cause:** `__dirname` does not reliably point to `/var/task` on Netlify, even with `fileURLToPath(import.meta.url)`.

```javascript
// ❌ UNRELIABLE
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// On Netlify: /var/task/.netlify/functions-internal (NOT /var/task)
```

### Environment Analysis

| Environment      | `process.cwd()` | `__dirname`                             | Static Location       |
| ---------------- | --------------- | --------------------------------------- | --------------------- |
| **Local Dev**    | Project root    | `src/`                                  | Relative to project   |
| **Netlify Prod** | `/var/task`     | `/var/task/.netlify/functions-internal` | `/var/task/static/**` |

### Solution: Always Use `process.cwd()`

`process.cwd()` consistently returns `/var/task` on Netlify and the project root locally.

```javascript
// ✅ RELIABLE
const staticPath = path.join(process.cwd(), "static", filename)
// Works everywhere: /var/task/static/filename (Netlify) or ./static/filename (local)
```

### Implementation: Fallback Chain Strategy

Create a fallback chain that tries `process.cwd()` first, then falls back to relative paths for local dev:

```javascript
const pathsToTry = [
	// PRIMARY: Works on both Netlify and local
	path.join(process.cwd(), "static", relativePath),
	// FALLBACK: Local dev relative resolution
	path.join(__dirname, "../../static", relativePath),
]

for (const tryPath of pathsToTry) {
	try {
		return await fs.readFile(tryPath)
	} catch (err) {
		// Try next path
	}
}
throw new Error(`File not found: ${pathsToTry.join(", ")}`)
```

### Utility: Centralized File Resolver

All static file access should use `src/lib/server/file-resolver.js`:

```javascript
import {resolveStaticFile, readStaticFile} from "$lib/server/file-resolver.js"

// Get path
const logoPath = await resolveStaticFile("logo.png")
const logoBuffer = await sharp(logoPath).metadata()

// Or read directly
const fileBuffer = await readStaticFile("logo.png")
```

### Refactoring Checklist

- [x] Create `src/lib/server/file-resolver.js` utility
- [x] Update `/src/routes/api/image/+server.js` to use utility
- [x] Remove unused `__dirname` constants
- [x] Remove unsafe path.join(...\_\_dirname) calls
- [ ] Audit other server endpoints for file access patterns
- [ ] Document in onboarding/dev guide

### Debugging Tips

**When paths still fail:**

1. Check actual runtime values:

```javascript
console.log({
	process_cwd: process.cwd(),
	__dirname: __dirname, // For debugging only
	expected_static_path: path.join(process.cwd(), "static"),
})
```

2. Verify files exist in Netlify deployment logs
3. Check `netlify.toml` includes static files:

```toml
[functions]
  included_files = ["static/**", "fonts/**"]
```

### Prevention: Code Review Pattern

**Red flags to catch in PR review:**

- ❌ Hardcoded `/static/` directory paths
- ❌ Path construction using only `__dirname`
- ❌ Relative paths without fallback chains
- ❌ Missing `process.cwd()` + "static" pattern

**Green flags:**

- ✅ Use of `resolveStaticFile()` utility
- ✅ Explicit process.cwd() first in path chains
- ✅ Try/catch or fs.access() for path validation
- ✅ Error messages listing all attempted paths

### Related Files

- **Utility:** `src/lib/server/file-resolver.js`
- **Implementation:** `src/routes/api/image/+server.js`
- **Configuration:** `netlify.toml` (check `included_files`)
- **Edge Functions:** Check path assumptions in `netlify/edge-functions/**`

### Timeline of Discovery

1. **Initial Error:** `ENOENT: no such file or directory, open '/static/...`
2. **False Fix:** Added cache-busting headers (wasn't the problem)
3. **Investigation:** Enabled detailed logging of `__dirname`, `process.cwd()`, actual paths
4. **Key Insight:** Logs showed successful load from `/var/task/static/`
5. **Root Cause Found:** `__dirname` ≠ `/var/task` on Netlify
6. **Final Fix:** Reordered paths with `process.cwd()` first + centralized utility

### Migration for Existing Code

If you find unsafe path patterns:

```javascript
// Before
const filePath = path.join(__dirname, "../../../../static/file.png")

// After
import {resolveStaticFile} from "$lib/server/file-resolver.js"
const filePath = await resolveStaticFile("file.png")
```
