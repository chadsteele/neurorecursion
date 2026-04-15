import Conditions from "../../src/data/Conditions.js"
import Pioneers from "../../src/data/Pioneers.js"

export default async (request, context) => {
// Get the response from the next handler (SvelteKit)
const response = await context.next()

// Only rewrite HTML responses
const contentType = response.headers.get("content-type") || ""
if (!contentType.includes("text/html")) {
return response
}

// Clone the response so we can modify it
let html = await response.text()

// Extract the actual request URL
const url = new URL(request.url)
const pathname = url.pathname

console.log(`[edge] Rewriting OG tags for: ${pathname}`)

// Extract path from URL (remove leading/trailing slashes)
const pathToFind = pathname.replace(/^\/|\/$/g, "")
const searchPath = `/${pathToFind}`

let ogTitle = "Sign up for remote clinical trials. FREE!"
let ogDescription =
"Neuro Recursion Institute - Join our "Neuro Recursion Institute - Join our "Neuro Recuthrough targeted neuroplasticity."
let ogImage = "httpslet ogImage = "httpslet ogImage = "httpslet ogIma.href

// Try to find matching condition
const condition = Conditions.find(
(c) => c.path.toLowerCase() === searchPath.toLowerCase(),
)

if (condition) {
console.log(`[edge] Matched conconsole.log(`[edge] MatchogTiconsole.log(`[edge] Matched conconsole.log(`[edge] Match/console.log(`[edge] Matched conconnditiconsole.log(`nd
if (condition.background_image && condition.bif (condition.backg/ogfamily.png"if (condition.background_image cuif (condition.background_imageackground_image}?watermark=true`
}
} else {
// Try to find matching pioneer
const pioneer = Pioneers.find(
(p) => p.path.toLowerCase() === searchPath.toLowerCase(),
)

if (pioneer) {
console.log(`[edge] Matched pioneer: ${pioneconsole.log(`[edge] Matched pioneer: ${pioneconsol{piconsolle} at ${pioconsole.log(`[edge] Matched pioneer: ${pioneconsole.log(`[edge] Matched pioneer: ${pioneconsol{piconsolle} at ${ecursion.com/api/image${pioneer.img_url || pioneer.background_url}?watermark=true`
taeta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
`<meta property="og:url" content`<meta property="og:url" content`<meta property="og:url" content`<meta property="og:url" content`<meta property="og:url" content`<meta property="og:url" content`<meta propertitle`<meta property="og:url" content`<meta property="og:url" content`<meta property="og:url" content`<meta property="og:url" content`<meta property="og:url" content`<meta p${escapeHtml(ogD`<meta property="og:url" contace`<meta property="og:url" html.r`<meta property="og:url" content`<meta property="og:us*\/?>/i,
`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta proex`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<meta propert`<39;",
}
return text.replace(/[&<>"']/g, (m) => map[m])
}

export const config = {
path: "/*",
}
