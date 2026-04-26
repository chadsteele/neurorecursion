<script>
	import {goto} from "$app/navigation"
	import {
		PUBLIC_SUPABASE_ANON_KEY,
		PUBLIC_SUPABASE_URL,
	} from "$env/static/public"
	import {createClient} from "@supabase/supabase-js"

	const SUPABASE_URL = PUBLIC_SUPABASE_URL
	const SUPABASE_ANON_KEY = PUBLIC_SUPABASE_ANON_KEY
	const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

	let user = $state(null)
	let loading = $state(true)

	$effect(async () => {
		if (!isSupabaseConfigured) {
			loading = false
			return
		}

		try {
			const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
			const {data, error} = await supabase.auth.getUser()

			if (error || !data?.user) {
				goto("/user/login")
				return
			}

			user = data.user
		} catch {
			goto("/user/login")
		} finally {
			loading = false
		}
	})

	async function handleLogout() {
		if (!isSupabaseConfigured) {
			goto("/user/login")
			return
		}

		try {
			const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
			await supabase.auth.signOut()
			goto("/user/login")
		} catch (err) {
			console.error("Logout error:", err)
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
			<button onclick={handleLogout} class="logout-button"
				>Sign Out</button
			>
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
					<span class="value">{user.id.substring(0, 8)}...</span>
				</div>
			</div>
		</div>

		<div class="dashboard-card">
			<h2>Quick Actions</h2>
			<div class="action-grid">
				<a href="/" class="action-link">Explore Content</a>
				<a href="/user/profile" class="action-link">Edit Profile</a>
				<a href="/user/settings" class="action-link">Account Settings</a
				>
			</div>
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
	}
</style>
