import {browser} from "$app/environment"

export const OFFLINE_ENABLED_STORAGE_KEY = "offline:enabled"

export function isOfflineEnabled() {
	if (!browser) return true
	return localStorage.getItem(OFFLINE_ENABLED_STORAGE_KEY) !== "false"
}

export function setOfflineEnabled(enabled) {
	if (!browser) return
	localStorage.setItem(
		OFFLINE_ENABLED_STORAGE_KEY,
		enabled ? "true" : "false",
	)
}

export async function disableOfflineResources() {
	if (!browser) return

	if ("serviceWorker" in navigator) {
		const registrations = await navigator.serviceWorker.getRegistrations()
		await Promise.all(registrations.map((registration) => registration.unregister()))
	}

	if ("caches" in window) {
		const names = await caches.keys()
		await Promise.all(names.map((name) => caches.delete(name)))
	}
}

export async function enableOfflineResources() {
	if (!browser || !("serviceWorker" in navigator)) return null

	return navigator.serviceWorker.register("/service-worker.js", {
		type: "module",
	})
}