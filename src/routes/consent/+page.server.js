// This route stays prerendered.
// The consent form uses native browser POST submission to Netlify Forms.
// Client-side code only blocks invalid submits; valid submissions are handled by Netlify.
export const prerender = true
