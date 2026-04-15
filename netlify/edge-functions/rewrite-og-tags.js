// Minimal edge function - OG tags are handled server-side by SvelteKit
// This function is a placeholder for future edge-based logic
// All OG tag generation happens in SvelteKit's +page.server.js files

export default async (request, context) => {
// Pass through to next middleware/server handler
// OG tags are dynamically generated server-side
return context.next()
}

export const config = {
path: "/*",
}
