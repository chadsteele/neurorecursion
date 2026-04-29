<script>
	import {browser} from "$app/environment"
	import {searchOpen} from "$lib/stores.js"
	import {getSupabaseClient, isSupabaseConfigured} from "$lib/supabaseClient.js"
	import {onMount} from "svelte"
	import Logo from "$lib/Logo.svelte"

	let isMenuOpen = $state(false)
	let scrolling = $state(false)
	let isSignedIn = $state(false)
	let username = $state("")
	let User = $state(null)
	let Search = $state(null)

	if (browser) {
		import("lucide-svelte").then((module) => {
			User = module.User
			Search = module.Search
		})
	}

	function toggleMenu() {
		isMenuOpen = !isMenuOpen
	}

	function closeMenu() {
		isMenuOpen = false
	}

	function toggleSearch() {
		searchOpen.update((value) => !value)
	}

	function handleScroll() {
		scrolling = window.scrollY > 10
	}

	function formatDisplayName(value) {
		const normalized = (value || "").trim()
		if (normalized.length <= 12) return normalized

		return `${normalized.slice(0, 5)}*${normalized.slice(-5)}`
	}

	function updateUserState(user) {
		isSignedIn = Boolean(user)
		if (!user) {
			username = ""
			return
		}

		const firstName = user.user_metadata?.first_name?.trim()
		const fullName = user.user_metadata?.full_name?.trim()
		const emailName = user.email?.split("@")[0]
		const baseName = firstName || fullName || emailName || "Account"

		username = formatDisplayName(baseName)
	}

	onMount(() => {
		if (!isSupabaseConfigured) return

		const supabase = getSupabaseClient()
		if (!supabase) return

		supabase.auth.getUser().then(({data}) => {
			updateUserState(data?.user ?? null)
		})

		const {data: authListener} = supabase.auth.onAuthStateChange(
			(_event, session) => {
				updateUserState(session?.user ?? null)
			},
		)

		return () => {
			authListener.subscription.unsubscribe()
		}
	})
</script>

<svelte:window onscroll={handleScroll} />

<nav class="navbar" class:scrolling>
	<div class="nav-container">
		<button
			class="menu-toggle"
			onclick={toggleMenu}
			aria-label="Toggle menu"
		>
			<span></span>
			<span></span>
			<span></span>
		</button>
		<!-- Left: Logo -->
		<Logo />

		<!-- Center: Navigation Links -->
		<div class="nav-links" class:open={isMenuOpen}>
			<a href="/about" class="nav-link" onclick={closeMenu}>About</a>
			<a href="/clinical-trials" class="nav-link" onclick={closeMenu}
				>Clinical Trials</a
			>
			<a href="/pioneers" class="nav-link" onclick={closeMenu}>Pioneers</a
			>
			<a href="/support" class="nav-link" onclick={closeMenu}>Support</a>
			<a href="/signup" class="nav-link" onclick={closeMenu}>Sign Up</a>
			<a href="/careers" class="nav-link" onclick={closeMenu}>Join us</a>
		</div>

		<!-- Right: Search & User Avatar -->
		<div class="nav-right">
			<button
				class="search-btn"
				onclick={toggleSearch}
				aria-label="Toggle search"
				title="Search"
			>
				{#if Search}
					<Search size={24} strokeWidth={1.5} />
				{/if}
			</button>
			<a
				class="user-avatar"
				class:signed-in={isSignedIn}
				href={isSignedIn ? "/user/dashboard" : "/user/login"}
				aria-label={isSignedIn ? "Go to dashboard" : "Go to login"}
				title={isSignedIn ? "Dashboard" : "Login"}
			>
				{#if User}
					<User size={40} strokeWidth={1.5} />
				{/if}
				{#if isSignedIn && username}
					<span class="user-name">{username}</span>
				{/if}
			</a>
		</div>
	</div>
</nav>

<style>
	.navbar {
		position: sticky;
		top: 0;
		z-index: 1000;
		background: rgba(10, 14, 39, 0.95);
		border-bottom: 1px solid #1e5a96;
		backdrop-filter: blur(10px);
		transition: all 0.3s ease;
	}

	.navbar.scrolling {
		background: rgba(10, 14, 39, 0.98);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 70px;
	}

	.nav-links {
		display: flex;
		gap: 2rem;
		align-items: center;
	}

	.nav-link {
		color: #a0d8ff;
		text-decoration: none;
		font-size: clamp(0.75rem, 2vw, 1.1rem);
		font-weight: 500;
		transition: all 0.3s ease;
		position: relative;
	}

	.nav-link:hover {
		color: #4a9fd8;
	}

	.nav-link::after {
		content: "";
		position: absolute;
		bottom: -5px;
		left: 0;
		width: 0;
		height: 2px;
		background: #4a9fd8;
		transition: width 0.3s ease;
	}

	.nav-link:hover::after {
		width: 100%;
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.user-avatar {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 0.45rem;
		justify-content: center;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		text-decoration: none;
	}

	.user-avatar.signed-in {
		flex-direction: column;
		gap: 0.15rem;
	}

	.user-name {
		color: #a0d8ff;
		font-size: clamp(0.75rem, 1.6vw, 0.95rem);
		font-weight: 600;
		max-width: 130px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.user-avatar svg) {
		width: clamp(28px, 8vw, 40px);
		height: clamp(28px, 8vw, 40px);
		stroke: #4a9fd8;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.user-avatar.signed-in :global(svg) {
		width: clamp(22px, 5vw, 30px);
		height: clamp(22px, 5vw, 30px);
	}

	:global(.user-avatar svg:hover) {
		filter: drop-shadow(0 0 12px rgba(74, 159, 216, 0.4));
		transform: scale(1.1);
	}

	/* Keep img styles for fallback */

	.search-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: clamp(0.25rem, 1.5vw, 0.5rem);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.search-btn:hover {
		transform: scale(1.1);
	}

	:global(.search-btn svg) {
		width: clamp(20px, 5vw, 24px);
		height: clamp(20px, 5vw, 24px);
		stroke: #4a9fd8;
		transition: all 0.3s ease;
	}

	.search-btn:hover :global(svg) {
		filter: drop-shadow(0 0 8px rgba(74, 159, 216, 0.4));
	}

	.menu-toggle {
		display: none;
		flex-direction: column;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		gap: 5px;
	}

	.menu-toggle span {
		width: clamp(20px, 5vw, 25px);
		height: clamp(1px, 0.5vw, 2px);
		background: #4a9fd8;
		border-radius: 2px;
		transition: all 0.3s ease;
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.nav-container {
			padding: 0 1rem;
			height: 60px;
			justify-content: flex-start;
			gap: 1rem;
		}

		.menu-toggle {
			display: flex;
			order: 0;
			flex-shrink: 0;
		}

		.nav-right {
			margin-left: auto;
		}

		.nav-links {
			position: absolute;
			top: 60px;
			left: 0;
			right: 0;
			flex-direction: column;
			gap: 0;
			background: rgba(10, 14, 39, 0.99);
			max-height: 0;
			overflow: hidden;
			transition: max-height 0.3s ease;
			border-bottom: 1px solid #1e5a96;
		}

		.nav-links.open {
			max-height: 300px;
		}

		.nav-link {
			width: 100%;
			padding: clamp(0.75rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem);
			border-bottom: 1px solid #1a2447;
		}

		.nav-link::after {
			display: none;
		}

		.nav-right {
			gap: 1rem;
		}

		.user-name {
			display: none;
		}
	}
</style>
