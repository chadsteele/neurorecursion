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

	let message = $state("Completing secure sign-in...")
	let error = $state("")

	$effect(() => {
		async function completeAuth() {
			if (!isSupabaseConfigured) {
				error =
					"Supabase is not configured. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in your environment."
				return
			}

			try {
				const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
				const url = new URL(window.location.href)
				const code = url.searchParams.get("code")

				if (code) {
					const {error: exchangeError} =
						await supabase.auth.exchangeCodeForSession(code)
					if (exchangeError) {
						throw exchangeError
					}
				}

				const {data, error: userError} = await supabase.auth.getUser()
				if (userError || !data?.user) {
					throw (
						userError ||
						new Error("Unable to load authenticated user")
					)
				}

				message = "Sign-in complete. Redirecting..."
				await goto("/user/dashboard", {replaceState: true})
			} catch (err) {
				error =
					err instanceof Error
						? err.message
						: "Unable to complete authentication."
			}
		}

		completeAuth()
	})
</script>

<div class="callback-container">
	<div class="callback-card">
		{#if error}
			<h1>Sign-in Failed</h1>
			<p>{error}</p>
			<a href="/user/login">Return to Login</a>
		{:else}
			<h1>Please wait</h1>
			<p>{message}</p>
		{/if}
	</div>
</div>

<style>
	.callback-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.callback-card {
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
		padding: 2rem;
		max-width: 420px;
		text-align: center;
	}

	h1 {
		margin: 0 0 0.75rem 0;
		font-size: 1.6rem;
	}

	p {
		margin: 0;
		color: #444;
	}

	a {
		display: inline-block;
		margin-top: 1rem;
		color: #3b4cc0;
		text-decoration: none;
		font-weight: 600;
	}
</style>
