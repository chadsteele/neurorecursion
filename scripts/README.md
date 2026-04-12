# SEO Enhancement Scripts

This directory contains scripts to improve SEO for the Neuro Recursion Institute website.

## Scripts

### `generate-sitemap.js`

Generates a complete `sitemap.xml` including:

- All static pages (home, pioneers, careers, consent, success)
- All category pages
- All condition pages (~20 conditions)
- All pioneer pages (~16 pioneers)

**Output:** `static/sitemap.xml`

### `generate-schemas.js`

Generates JSON-LD structured data for search engines:

- `schema-org.json` - Organization schema for homepage
- `schema-conditions.json` - Medical condition schemas for all conditions
- `schema-pioneers.json` - Person schemas for all pioneers
- `schema-breadcrumbs.json` - Breadcrumb navigation schemas

**Output:** `static/schema-*.json` files

### `generate-metadata.js` (existing)

Generates condition metadata for runtime use.

## Prebuild Process

All scripts run automatically before the build:

```bash
npm run build
```

This executes:

1. `generate-metadata.js` - Syncs condition/pioneer metadata
2. `generate-sitemap.js` - Creates sitemap.xml
3. `generate-schemas.js` - Creates structured data

## Files Generated

```
static/
├── sitemap.xml                  # Sitemap for all pages (~40+ URLs)
├── robots.txt                   # Updated with sitemap reference
├── schema-org.json             # Organization JSON-LD
├── schema-conditions.json       # Condition schemas
├── schema-pioneers.json         # Pioneer schemas
└── schema-breadcrumbs.json      # Breadcrumb examples
```

## robots.txt Updates

Now includes:

- Sitemap reference: `Sitemap: https://neurorecursion.com/sitemap.xml`
- API exclusion: `Disallow: /api/`
- Crawl delay optimization for different bots
- Googlebot crawl-delay: 0 (fast crawling allowed)
- Default crawl-delay: 1 (respect server load)

## SEO Checklist

- ✅ Dynamic sitemap generation
- ✅ Structured data (JSON-LD) for conditions, pioneers, organization
- ✅ robots.txt with sitemap reference
- ✅ Metadata syncing in prebuild
- ✅ OG tags (already implemented via edge function)
- ✅ Breadcrumb navigation (in schemas)

## Integration in HTML

To use the schema data in your Svelte components, reference the generated JSON files:

```svelte
<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(conditionSchema)}</script>`}
</svelte:head>
```

Or load them from the static files for better caching.

## How to Test

1. **Test sitemap:**

    ```bash
    cat static/sitemap.xml | head -20
    ```

2. **Validate with Google:**
    - Visit Google Search Console
    - Submit `https://neurorecursion.com/sitemap.xml`

3. **Test structured data:**
    - Use [Google Rich Results Test](https://search.google.com/test/rich-results)
    - Paste JSON-LD from schema files

4. **Check robots.txt:**
    ```
    https://neurorecursion.com/robots.txt
    ```
