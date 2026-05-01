<script>
	import {onMount} from "svelte"
	import {
		disableOfflineResources,
		enableOfflineResources,
		isOfflineEnabled,
		OFFLINE_ENABLED_STORAGE_KEY,
	} from "$lib/offlineSettings.js"
	import "../app.css"
	import Footer from "$lib/Footer.svelte"
	import Navbar from "$lib/Navbar.svelte"
	import SearchBar from "$lib/SearchBar.svelte"
	import {pageBackground} from "$lib/stores"
	import Reader from "$lib/Reader.svelte"

	let {children} = $props()

	onMount(() => {
		// --- Referrer capture logic ---
		const REFERRER_KEY = "original_referrer"
		if (typeof window !== "undefined") {
			const existing = localStorage.getItem(REFERRER_KEY)
			if (!existing) {
				let ref = document.referrer
				// Optionally, check for UTM params
				const urlParams = new URLSearchParams(window.location.search)
				const utmSource = urlParams.get("utm_source")
				if (utmSource) {
					ref = window.location.href
				}
				localStorage.setItem(REFERRER_KEY, ref || "")
				window.__original_referrer = ref || ""
			} else {
				window.__original_referrer = existing
			}
		}
		const syncOfflinePreference = async () => {
			if (!isOfflineEnabled()) {
				await disableOfflineResources()
				console.log("[service-worker] offline disabled by user")
				return
			}

			if (!("serviceWorker" in navigator)) return

			await enableOfflineResources()
			console.log("[service-worker] registration complete")
		}

		const logConnectionStatus = () => {
			const status = navigator.onLine ? "online" : "offline"
			const offsiteStatus = navigator.onLine ? "onsite" : "offsite"
			console.log(`[network] status=${status} offsite=${offsiteStatus}`)
		}

		const handleStorageChange = (event) => {
			if (event.key !== OFFLINE_ENABLED_STORAGE_KEY) return

			syncOfflinePreference().catch((error) => {
				console.warn("Failed to apply offline preference", error)
			})
		}

		logConnectionStatus()
		window.addEventListener("online", logConnectionStatus)
		window.addEventListener("offline", logConnectionStatus)
		window.addEventListener("storage", handleStorageChange)

		syncOfflinePreference().catch((error) => {
			console.warn("Service worker registration failed", error)
		})

		return () => {
			window.removeEventListener("online", logConnectionStatus)
			window.removeEventListener("offline", logConnectionStatus)
			window.removeEventListener("storage", handleStorageChange)
		}
	})
</script>

<div class="site-shell">
	<Reader />
	{#if $pageBackground.src}
		{#key `${$pageBackground.src}:${$pageBackground.blur}`}
			<div
				class="layout-background"
				style={`background-image: url('${$pageBackground.src}'); --layout-bg-blur: ${$pageBackground.blur}px;`}
			></div>
		{/key}
	{/if}

	<div class="site-content">
		<Navbar />
		<SearchBar />

		<div class="main-content">
			{@render children()}
		</div>

		<Footer />
	</div>
</div>

<style>
	.site-shell {
		position: relative;
		min-height: 100vh;
	}

	.layout-background {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		--layout-bg-blur: 0px;
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		animation:
			kenBurns 60s ease-in-out infinite,
			bgFadeIn 0.8s ease-in-out;
		filter: blur(var(--layout-bg-blur)) brightness(0.7);
		transform: scale(1.04);
		transform-origin: center;
	}

	.site-content {
		position: relative;
		z-index: 1;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.main-content {
		flex: 1;
	}

	@media (max-width: 900px) {
	}
</style>
