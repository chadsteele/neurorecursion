<script>
	import {browser} from "$app/environment"
	import {goto} from "$app/navigation"
	import {
		disableOfflineResources,
		enableOfflineResources,
		isOfflineEnabled,
		setOfflineEnabled,
	} from "$lib/offlineSettings.js"
	import {
		getSupabaseClient,
		isSupabaseConfigured,
	} from "$lib/supabaseClient.js"
	import QRCode from "qrcode"
	import {onMount} from "svelte"

	const MAX_CODE_LENGTH = 125
	const SHARE_DESTINATION_PATH = "/marketplace"
	const MIN_DISCOUNT_PERCENT = 0
	const MAX_DISCOUNT_PERCENT = 50

	const supabase = getSupabaseClient()

	let user = $state(null)
	let loading = $state(true)
	let codesLoading = $state(false)
	let isCreating = $state(false)
	let isSigningOut = $state(false)
	let createError = $state("")
	let createSuccess = $state("")
	let codesError = $state("")
	let clipboardMessage = $state("")
	let codeCharHelperVisible = $state(false)
	let clipboardTimeout = null

	let newCode = $state("")
	let discountPercent = $state("10")
	let affiliateCodes = $state([])
	let qrPreviews = $state({})
	let networkStatus = $state("Unknown")
	let serviceWorkerScope = $state("Not registered")
	let serviceWorkerState = $state("Unknown")
	let cacheCount = $state(0)
	let cacheNames = $state([])
	let diagnosticsUpdatedAt = $state("")
	let cacheMessage = $state("")
	let isRefreshingWorker = $state(false)
	let isRefreshingCache = $state(false)
	let offlineEnabled = $state(true)

	function getErrorMessage(error, fallback) {
		if (error instanceof Error && error.message) return error.message
		return fallback
	}

	async function loadOfflineDiagnostics() {
		if (!browser) return

		offlineEnabled = isOfflineEnabled()

		networkStatus = navigator.onLine ? "Online" : "Offline"

		if ("serviceWorker" in navigator) {
			const registration = await navigator.serviceWorker.getRegistration()
			serviceWorkerScope = registration?.scope || "Not registered"
			serviceWorkerState =
				registration?.active?.state ||
				registration?.waiting?.state ||
				registration?.installing?.state ||
				(registration ? "registered" : "not-registered")
		} else {
			serviceWorkerScope = "Unsupported"
			serviceWorkerState = "unsupported"
		}

		if ("caches" in window) {
			const names = await caches.keys()
			cacheNames = names
			cacheCount = names.length
		} else {
			cacheNames = []
			cacheCount = 0
		}

		diagnosticsUpdatedAt = new Date().toLocaleTimeString()
	}

	async function handleOfflineEnabledToggle(event) {
		const enabled = Boolean(event.currentTarget?.checked)
		offlineEnabled = enabled
		setOfflineEnabled(enabled)
		cacheMessage = ""

		try {
			if (enabled) {
				await enableOfflineResources()
				cacheMessage =
					"Offline mode enabled. Service worker registration is active."
			} else {
				await disableOfflineResources()
				cacheMessage =
					"Offline mode disabled. Service worker and caches were removed."
			}
			await loadOfflineDiagnostics()
		} catch (error) {
			cacheMessage = getErrorMessage(
				error,
				"Failed to update offline mode setting.",
			)
		}
	}

	async function refreshServiceWorker() {
		if (!offlineEnabled) {
			cacheMessage = "Offline mode is disabled. Enable it first."
			return
		}

		if (!browser || !("serviceWorker" in navigator)) {
			cacheMessage = "Service workers are not supported in this browser."
			return
		}

		isRefreshingWorker = true
		cacheMessage = ""

		try {
			let registration = await navigator.serviceWorker.getRegistration()
			if (!registration) {
				registration = await navigator.serviceWorker.register(
					"/service-worker.js",
					{type: "module"},
				)
			}

			await registration.update()
			await loadOfflineDiagnostics()
			cacheMessage = "Service worker refreshed."
		} catch (error) {
			cacheMessage = getErrorMessage(
				error,
				"Failed to refresh the service worker.",
			)
		} finally {
			isRefreshingWorker = false
		}
	}

	async function refreshCache() {
		if (!offlineEnabled) {
			cacheMessage = "Offline mode is disabled. Enable it first."
			return
		}

		if (!browser || !("caches" in window)) {
			cacheMessage = "Cache API is not available in this browser."
			return
		}

		if (!navigator.onLine) {
			cacheMessage =
				"Go online before refreshing cache so assets can be downloaded again."
			return
		}

		isRefreshingCache = true
		cacheMessage = ""

		try {
			const names = await caches.keys()
			await Promise.all(names.map((name) => caches.delete(name)))

			if ("serviceWorker" in navigator) {
				const registration =
					await navigator.serviceWorker.getRegistration()
				if (registration) {
					await registration.update()
				}
			}

			await loadOfflineDiagnostics()
			cacheMessage =
				"Cache cleared. Reloading to rebuild offline cache..."
			window.location.reload()
		} catch (error) {
			cacheMessage = getErrorMessage(error, "Failed to refresh cache.")
		} finally {
			isRefreshingCache = false
		}
	}

	function clearClipboardMessageSoon() {
		if (clipboardTimeout) {
			clearTimeout(clipboardTimeout)
			clipboardTimeout = null
		}

		clipboardTimeout = setTimeout(() => {
			clipboardMessage = ""
		}, 2200)
	}

	function normalizeCode(value) {
		return (value || "")
			.replace(/[^A-Za-z0-9._~-]/g, "")
			.slice(0, MAX_CODE_LENGTH)
	}

	function validateCode(code) {
		if (!code) {
			return "Code is required"
		}

		if (!/^[A-Za-z0-9._~-]{1,125}$/.test(code)) {
			return "Use only URI-safe characters: A-Z, a-z, 0-9, -, ., _, ~"
		}

		return ""
	}

	function normalizeDiscountPercent(value) {
		if (value === "" || value === null || value === undefined) return ""
		const parsed = Number(value)
		if (!Number.isFinite(parsed)) return ""
		return String(parsed)
	}

	function validateDiscountPercent(value) {
		if (value === "") {
			return "Discount percentage is required"
		}

		const parsed = Number(value)
		if (!Number.isFinite(parsed)) {
			return "Discount percentage must be a number"
		}

		if (parsed < MIN_DISCOUNT_PERCENT || parsed > MAX_DISCOUNT_PERCENT) {
			return "Discount percentage must be between 0 and 50"
		}

		return ""
	}

	function getShareUrl(code) {
		if (browser && window?.location?.origin) {
			const url = new URL(SHARE_DESTINATION_PATH, window.location.origin)
			url.searchParams.set("discount", code)
			return url.toString()
		}

		return `${SHARE_DESTINATION_PATH}?discount=${encodeURIComponent(code)}`
	}

	async function copyToClipboard(value, successText) {
		if (!browser) return

		try {
			await navigator.clipboard.writeText(value)
			clipboardMessage = successText
			clearClipboardMessageSoon()
		} catch {
			clipboardMessage =
				"Could not copy automatically. Please copy manually."
			clearClipboardMessageSoon()
		}
	}

	async function loadAffiliateCodes() {
		if (!supabase || !user) return

		codesLoading = true
		codesError = ""

		const {data, error} = await supabase
			.from("affiliate_discount_codes")
			.select("id, user_id, code, discount_percent, created_at")
			.eq("user_id", user.id)
			.order("created_at", {ascending: false})

		if (error) {
			codesError = error.message || "Failed to load discount codes"
			codesLoading = false
			return
		}

		affiliateCodes = data || []
		codesLoading = false
	}

	onMount(() => {
		const handleNetworkChange = () => {
			loadOfflineDiagnostics().catch(() => {
				cacheMessage = "Failed to refresh offline status."
			})
		}

		window.addEventListener("online", handleNetworkChange)
		window.addEventListener("offline", handleNetworkChange)

		const runInit = async () => {
			if (!supabase) {
				loading = false
				await loadOfflineDiagnostics()
				return
			}

			try {
				const {data, error} = await supabase.auth.getUser()

				if (error || !data?.user) {
					goto("/user/login")
					return
				}

				user = data.user
				await loadAffiliateCodes()
			} catch {
				goto("/user/login")
			} finally {
				loading = false
				await loadOfflineDiagnostics()
			}
		}

		runInit()

		return () => {
			if (clipboardTimeout) {
				clearTimeout(clipboardTimeout)
			}
			window.removeEventListener("online", handleNetworkChange)
			window.removeEventListener("offline", handleNetworkChange)
		}
	})

	async function handleCreateCode(event) {
		event.preventDefault()
		if (!supabase || !user || isCreating) return

		createError = ""
		createSuccess = ""

		const normalizedCode = normalizeCode(newCode)
		const codeError = validateCode(normalizedCode)
		if (codeError) {
			createError = codeError
			return
		}

		const normalizedDiscountPercent =
			normalizeDiscountPercent(discountPercent)
		const discountError = validateDiscountPercent(normalizedDiscountPercent)
		if (discountError) {
			createError = discountError
			return
		}

		isCreating = true

		const {data, error} = await supabase
			.from("affiliate_discount_codes")
			.insert({
				user_id: user.id,
				code: normalizedCode,
				discount_percent: Number(normalizedDiscountPercent),
			})
			.select("id, user_id, code, discount_percent, created_at")
			.single()

		if (error) {
			if (error.code === "23505") {
				createError = "That code is already taken. Pick another one."
			} else {
				createError = error.message || "Failed to create discount code"
			}
			isCreating = false
			return
		}

		affiliateCodes = [data, ...affiliateCodes]
		newCode = ""
		codeCharHelperVisible = false
		discountPercent = "10"
		createSuccess = `Code ${data.code} created and linked to your account.`
		isCreating = false
	}

	async function handleDownloadQr(code) {
		const shareUrl = getShareUrl(code)

		try {
			const qrDataUrl = await QRCode.toDataURL(shareUrl, {
				width: 640,
				margin: 2,
			})

			qrPreviews = {
				...qrPreviews,
				[code]: qrDataUrl,
			}

			if (!browser) return

			const link = document.createElement("a")
			link.href = qrDataUrl
			link.download = `neurorecursion-${code}-qr.png`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
		} catch {
			codesError = "Failed to generate QR code. Please try again."
		}
	}

	async function handleLogout() {
		if (!supabase || isSigningOut) {
			goto("/user/login")
			return
		}

		try {
			isSigningOut = true
			await supabase.auth.signOut()
			goto("/user/login")
		} catch (err) {
			console.error("Logout error:", err)
			isSigningOut = false
		}
	}
</script>

{#if loading}
	<div class="loading-container">
		<div class="spinner"></div>
		<p>Loading...</p>
	</div>
{:else if user}
	<div class="dashboard-container">
		<div class="dashboard-header">
			<h1>Welcome, {user.user_metadata?.first_name || user.email}</h1>
			<button
				onclick={handleLogout}
				class="logout-button"
				disabled={isSigningOut}
			>
				{isSigningOut ? "Signing Out..." : "Sign Out"}
			</button>
		</div>

		<div class="dashboard-card">
			<h2>Account Information</h2>
			<div class="info-grid">
				<div class="info-item">
					<span class="label">Email:</span>
					<span class="value">{user.email}</span>
				</div>
				<div class="info-item">
					<span class="label">Account Created:</span>
					<span class="value">
						{new Date(user.created_at).toLocaleDateString()}
					</span>
				</div>
				<div class="info-item">
					<span class="label">User ID:</span>
					<span class="value">{user.id}</span>
				</div>
			</div>
		</div>

		<div class="dashboard-card">
			<h2>Affiliate Discount Codes</h2>
			<p class="section-intro">
				Create unique codes tied to your user UUID, then copy a
				shareable URL or download a QR code for social posts.
			</p>

			<form class="affiliate-form" onsubmit={handleCreateCode}>
				<div class="field-grid">
					<label>
						<span>Discount Code</span>
						<input
							type="text"
							placeholder="my-code_2026~launch"
							bind:value={newCode}
							oninput={(event) => {
								const rawCode = event.currentTarget.value
								const normalizedCode = normalizeCode(rawCode)
								codeCharHelperVisible =
									rawCode !== normalizedCode
								newCode = normalizedCode
							}}
							maxlength={MAX_CODE_LENGTH}
							required
						/>
						{#if codeCharHelperVisible}
							<span class="input-helper">
								Only URI-safe chars are allowed: A-Z, a-z, 0-9,
								-, ., _, ~
							</span>
						{/if}
					</label>

					<label>
						<span>Discount Percent</span>
						<input
							type="number"
							min={MIN_DISCOUNT_PERCENT}
							max={MAX_DISCOUNT_PERCENT}
							step="0.01"
							placeholder="10"
							bind:value={discountPercent}
							oninput={() => {
								discountPercent =
									normalizeDiscountPercent(discountPercent)
							}}
							required
						/>
					</label>
				</div>

				<div class="form-actions">
					<button
						type="submit"
						class="create-button"
						disabled={isCreating || !newCode.trim()}
					>
						{isCreating ? "Creating..." : "Create Discount Code"}
					</button>
				</div>

				{#if createError}
					<p class="message error">{createError}</p>
				{/if}
				{#if createSuccess}
					<p class="message success">{createSuccess}</p>
				{/if}
				{#if clipboardMessage}
					<p class="message info">{clipboardMessage}</p>
				{/if}
			</form>

			{#if codesLoading}
				<p class="empty">Loading your affiliate codes...</p>
			{:else if codesError}
				<p class="message error">{codesError}</p>
			{:else if affiliateCodes.length === 0}
				<p class="empty">
					No discount codes yet. Create one above to start sharing.
				</p>
			{:else}
				<div class="codes-list">
					{#each affiliateCodes as item}
						<div class="code-card">
							<div class="code-row">
								<div>
									<p class="code-pill">{item.code}</p>
									<p class="muted">
										UUID linked: {item.user_id}
									</p>
									<p class="muted">
										Discount: {Number(
											item.discount_percent,
										)}%
									</p>
								</div>
								<div class="code-buttons">
									<button
										type="button"
										onclick={() =>
											copyToClipboard(
												item.code,
												"Code copied",
											)}
									>
										Copy Code
									</button>
									<button
										type="button"
										onclick={() =>
											copyToClipboard(
												getShareUrl(item.code),
												"Share URL copied",
											)}
									>
										Copy Share URL
									</button>
									<button
										type="button"
										onclick={() =>
											handleDownloadQr(item.code)}
									>
										Download QR
									</button>
								</div>
							</div>

							<div class="share-url-box">
								{getShareUrl(item.code)}
							</div>

							{#if qrPreviews[item.code]}
								<img
									src={qrPreviews[item.code]}
									alt={`QR code for ${item.code}`}
									class="qr-preview"
								/>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div class="dashboard-card">
			<h2>Quick Actions</h2>
			<div class="action-grid">
				<a href="/" class="action-link">Explore Content</a>
				<a href="/welcome/affiliate" class="action-link"
					>Affiliate Overview</a
				>
				<a href="/marketplace" class="action-link">Open Marketplace</a>
			</div>
		</div>

		<div class="dashboard-card">
			<h2>Offline &amp; Cache</h2>
			<p class="section-intro">
				Check network and service worker state, refresh the service
				worker, or rebuild offline caches.
			</p>

			<div class="offline-status-grid">
				<div class="info-item">
					<span class="label">Offline Mode</span>
					<label class="offline-toggle">
						<input
							type="checkbox"
							checked={offlineEnabled}
							onchange={handleOfflineEnabledToggle}
						/>
						<span>
							{offlineEnabled ? "Enabled" : "Disabled"}
						</span>
					</label>
				</div>
				<div class="info-item">
					<span class="label">Network</span>
					<span class="value">{networkStatus}</span>
				</div>
				<div class="info-item">
					<span class="label">Service Worker State</span>
					<span class="value">{serviceWorkerState}</span>
				</div>
				<div class="info-item">
					<span class="label">Service Worker Scope</span>
					<span class="value">{serviceWorkerScope}</span>
				</div>
				<div class="info-item">
					<span class="label">Cache Stores</span>
					<span class="value">{cacheCount}</span>
				</div>
				<div class="info-item">
					<span class="label">Last Updated</span>
					<span class="value"
						>{diagnosticsUpdatedAt || "Not yet"}</span
					>
				</div>
			</div>

			<div class="offline-actions">
				<button
					type="button"
					class="create-button"
					onclick={refreshServiceWorker}
					disabled={isRefreshingWorker || !offlineEnabled}
				>
					{isRefreshingWorker
						? "Refreshing Service Worker..."
						: "Refresh Service Worker"}
				</button>
				<button
					type="button"
					class="create-button secondary-button"
					onclick={refreshCache}
					disabled={isRefreshingCache ||
						networkStatus !== "Online" ||
						!offlineEnabled}
				>
					{isRefreshingCache
						? "Refreshing Cache..."
						: "Refresh Cache"}
				</button>
				<button
					type="button"
					class="create-button secondary-button"
					onclick={loadOfflineDiagnostics}
				>
					Refresh Status
				</button>
			</div>

			{#if cacheMessage}
				<p class="message info">{cacheMessage}</p>
			{/if}

			{#if cacheNames.length > 0}
				<p class="muted">Active caches: {cacheNames.join(", ")}</p>
			{/if}
		</div>
	</div>
{:else}
	<div class="error-container">
		<p>
			{isSupabaseConfigured
				? "Unable to load user data. Please try logging in again."
				: "Supabase is not configured. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in your environment."}
		</p>
		<a href="/user/login">Return to Login</a>
	</div>
{/if}

<style>
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		gap: 1rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #f0f0f0;
		border-top: 4px solid #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.dashboard-container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	h1 {
		margin: 0;
		font-size: 28px;
		color: #1c1e21;
	}

	.logout-button {
		padding: 10px 20px;
		background-color: #667eea;
		color: white;
		border: none;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.logout-button:hover {
		background-color: #764ba2;
		transform: translateY(-2px);
	}

	.logout-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	.dashboard-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	h2 {
		margin: 0 0 1.5rem 0;
		font-size: 20px;
		color: #1c1e21;
		border-bottom: 2px solid #667eea;
		padding-bottom: 0.75rem;
	}

	.section-intro {
		margin: 0 0 1rem;
		color: #4b5563;
		line-height: 1.5;
	}

	.affiliate-form {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		margin-bottom: 1rem;
	}

	.field-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-weight: 600;
		font-size: 0.9rem;
		color: #374151;
	}

	input {
		border: 1px solid #d1d5db;
		border-radius: 8px;
		padding: 0.65rem 0.75rem;
		font-size: 0.95rem;
	}

	input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
	}

	.input-helper {
		font-size: 0.82rem;
		color: #7c2d12;
	}

	.form-actions {
		display: flex;
		align-items: center;
		gap: 0.8rem;
	}

	.create-button {
		padding: 0.7rem 1rem;
		border: none;
		border-radius: 8px;
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: #fff;
		font-weight: 700;
		cursor: pointer;
	}

	.create-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.message {
		border-radius: 8px;
		padding: 0.65rem 0.8rem;
		font-size: 0.92rem;
	}

	.message.error {
		color: #9f1239;
		background: #ffe4e6;
		border: 1px solid #fecdd3;
	}

	.message.success {
		color: #166534;
		background: #dcfce7;
		border: 1px solid #bbf7d0;
	}

	.message.info {
		color: #1e3a8a;
		background: #dbeafe;
		border: 1px solid #bfdbfe;
	}

	.empty {
		margin: 0.6rem 0 0;
		color: #6b7280;
	}

	.codes-list {
		display: grid;
		gap: 1rem;
	}

	.code-card {
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 1rem;
		background: #fafafa;
	}

	.code-row {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.code-pill {
		display: inline-block;
		margin: 0 0 0.5rem;
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		background: #e0e7ff;
		color: #3730a3;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-weight: 700;
	}

	.muted {
		margin: 0.2rem 0;
		font-size: 0.88rem;
		color: #6b7280;
		word-break: break-all;
	}

	.code-buttons {
		display: flex;
		gap: 0.55rem;
		flex-wrap: wrap;
		align-items: flex-start;
	}

	.code-buttons button {
		padding: 0.52rem 0.75rem;
		border-radius: 8px;
		border: 1px solid #cbd5e1;
		background: #fff;
		cursor: pointer;
		font-weight: 600;
	}

	.code-buttons button:hover {
		border-color: #667eea;
	}

	.share-url-box {
		margin-top: 0.8rem;
		padding: 0.65rem 0.75rem;
		border: 1px dashed #cbd5e1;
		border-radius: 8px;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.85rem;
		background: #fff;
		word-break: break-all;
	}

	.qr-preview {
		display: block;
		margin-top: 0.8rem;
		width: 160px;
		height: 160px;
		border-radius: 10px;
		border: 1px solid #e5e7eb;
		background: #fff;
		padding: 0.35rem;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.label {
		font-weight: 600;
		color: #65676b;
		font-size: 13px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.value {
		font-size: 16px;
		color: #1c1e21;
		word-break: break-all;
	}

	.action-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
	}

	.offline-status-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.offline-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-bottom: 0.75rem;
	}

	.offline-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		color: #1c1e21;
	}

	.offline-toggle input {
		width: 18px;
		height: 18px;
	}

	.secondary-button {
		background: #fff;
		color: #3730a3;
		border: 1px solid #c7d2fe;
	}

	.secondary-button:hover {
		background: #eef2ff;
	}

	.action-link {
		display: inline-block;
		padding: 12px 16px;
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
		text-decoration: none;
		border-radius: 6px;
		font-weight: 600;
		text-align: center;
		transition: all 0.2s ease;
	}

	.action-link:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
	}

	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		gap: 1rem;
		text-align: center;
	}

	.error-container a {
		padding: 10px 20px;
		background-color: #667eea;
		color: white;
		text-decoration: none;
		border-radius: 6px;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.error-container a:hover {
		background-color: #764ba2;
	}

	@media (max-width: 768px) {
		.dashboard-container {
			padding: 1rem;
		}

		.dashboard-header {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}

		h1 {
			font-size: 24px;
		}

		.dashboard-card {
			padding: 1.5rem;
		}

		.code-buttons {
			width: 100%;
		}

		.code-buttons button {
			flex: 1 1 100%;
		}

		.offline-actions .create-button {
			flex: 1 1 100%;
		}
	}
</style>
