<script>
	import {browser} from "$app/environment"

	let isMenuOpen = $state(false)
	let scrolling = $state(false)
	let User = $state(null)

	if (browser) {
		import("lucide-svelte").then((module) => {
			User = module.User
		})
	}

	function toggleMenu() {
		isMenuOpen = !isMenuOpen
	}

	function handleScroll() {
		scrolling = window.scrollY > 10
	}
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
		<div class="nav-logo">
			<a href="/">
				<img
					src="/brain.png"
					alt="Neuro Recursion"
					class="brain-logo"
				/>
				<div class="nav-logo-text">
					<div>Neuro</div>
					<div>Recursion</div>
					<div>Institute</div>
				</div>
			</a>
		</div>

		<!-- Center: Navigation Links -->
		<div class="nav-links" class:open={isMenuOpen}>
			<a href="/#about" class="nav-link">About</a>
			<a href="/#trials" class="nav-link">Trials</a>
			<a href="/#partners" class="nav-link">Partners</a>
			<a href="/#signup" class="nav-link">Sign Up</a>
			<a href="/#careers" class="nav-link">Join us</a>
		</div>

		<!-- Right: User Avatar & Menu Toggle -->
		<div class="nav-right">
			<a
				class="user-avatar"
				href="/#signup"
				aria-label="Go to sign up"
				title="Sign up"
			>
				{#if User}
					<User size={40} strokeWidth={1.5} />
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

	.nav-logo {
		flex-shrink: 0;
	}

	.nav-logo a {
		display: flex;
		align-items: center;
		text-decoration: none;
		gap: 1rem;
	}

	.nav-logo-text {
		display: flex;
		flex-direction: column;
		justify-content: left;
		gap: 0.1rem;
	}

	.nav-logo-text > div {
		line-height: 1;
		color: #4a9fd8;
		font-weight: 600;
	}

	.nav-logo-text > div:nth-child(1) {
		font-size: 0.9rem;
		letter-spacing: 0.05em;
	}

	.nav-logo-text > div:nth-child(2) {
		font-size: 1.1rem;
		letter-spacing: 0.02em;
	}

	.nav-logo-text > div:nth-child(3) {
		font-size: 0.75rem;
		color: #a0d8ff;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.brain-logo {
		width: 50px;
		height: 50px;
		object-fit: cover;
		border-radius: 50%;
		box-shadow: 0 2px 8px rgba(30, 90, 150, 0.3);
		transition: all 0.3s ease;
	}

	.brain-logo:hover {
		box-shadow: 0 4px 16px rgba(74, 159, 216, 0.4);
		transform: scale(1.05);
	}

	.nav-links {
		display: flex;
		gap: 2rem;
		align-items: center;
	}

	.nav-link {
		color: #a0d8ff;
		text-decoration: none;
		font-size: 0.95rem;
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
		justify-content: center;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	:global(.user-avatar svg) {
		width: 40px;
		height: 40px;
		stroke: #4a9fd8;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	:global(.user-avatar svg:hover) {
		filter: drop-shadow(0 0 12px rgba(74, 159, 216, 0.4));
		transform: scale(1.1);
	}

	/* Keep img styles for fallback */

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
		width: 25px;
		height: 2px;
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

		.nav-logo {
			flex-shrink: 0;
		}

		.nav-right {
			margin-left: auto;
		}

		.nav-logo a {
			gap: 0.5rem;
		}

		.brain-logo {
			width: 40px;
			height: 40px;
		}

		.nav-logo-text > div:nth-child(1) {
			font-size: 0.75rem;
		}

		.nav-logo-text > div:nth-child(2) {
			font-size: 0.9rem;
		}

		.nav-logo-text > div:nth-child(3) {
			font-size: 0.65rem;
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
			padding: 1rem 2rem;
			border-bottom: 1px solid #1a2447;
		}

		.nav-link::after {
			display: none;
		}

		.nav-right {
			gap: 1rem;
		}
	}
</style>
