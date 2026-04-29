import {build, files, prerendered, version} from "$service-worker"

const CACHE_NAME = `neurorecursion-cache-${version}`
const STATIC_ASSETS = [...build, ...files, ...prerendered]

self.addEventListener("install", (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME)
			await cache.addAll(STATIC_ASSETS)
			self.skipWaiting()
		})(),
	)
})

self.addEventListener("activate", (event) => {
	event.waitUntil(
		(async () => {
			const names = await caches.keys()
			await Promise.all(
				names
					.filter((name) => name !== CACHE_NAME)
					.map((name) => caches.delete(name)),
			)
			await self.clients.claim()
		})(),
	)
})

self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") return

	const url = new URL(event.request.url)
	if (url.origin !== self.location.origin) return

	const isNavigation = event.request.mode === "navigate"
	const isStaticAsset =
		STATIC_ASSETS.includes(url.pathname) ||
		url.pathname.startsWith("/_app/") ||
		url.pathname.startsWith("/piper/")

	if (isNavigation) {
		event.respondWith(networkFirst(event.request))
		return
	}

	if (isStaticAsset) {
		event.respondWith(cacheFirst(event.request))
		return
	}

	event.respondWith(staleWhileRevalidate(event.request))
})

async function cacheFirst(request) {
	const cache = await caches.open(CACHE_NAME)
	const cached = await cache.match(request)
	if (cached) return cached

	const response = await fetch(request)
	if (response.ok) {
		await cache.put(request, response.clone())
	}
	return response
}

async function networkFirst(request) {
	const cache = await caches.open(CACHE_NAME)

	try {
		const response = await fetch(request)
		if (response.ok) {
			await cache.put(request, response.clone())
		}
		return response
	} catch {
		const cached = await cache.match(request)
		if (cached) return cached

		const fallback = await cache.match("/")
		if (fallback) return fallback

		return new Response("Offline and this page has not been cached yet.", {
			status: 503,
			headers: {"Content-Type": "text/plain"},
		})
	}
}

async function staleWhileRevalidate(request) {
	const cache = await caches.open(CACHE_NAME)
	const cached = await cache.match(request)

	const networkPromise = fetch(request)
		.then(async (response) => {
			if (response.ok) {
				await cache.put(request, response.clone())
			}
			return response
		})
		.catch(() => null)

	if (cached) return cached

	const network = await networkPromise
	if (network) return network

	return new Response("Offline and this resource is unavailable.", {
		status: 503,
		headers: {"Content-Type": "text/plain"},
	})
}
