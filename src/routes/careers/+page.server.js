// Server actions can no longer be used with prerendering
// Forms now use client-side AJAX submission to Netlify Forms
// The page is prerendered, and Netlify's JavaScript handles form interception at runtime
export const prerender = true

// Netlify's Automatic Compression (Built-in)
// Netlify automatically compresses all static assets (HTML, CSS, JS) with gzip and brotli when serving—no configuration needed.
