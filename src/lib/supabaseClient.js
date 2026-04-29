import {browser} from "$app/environment"
import {env} from "$env/dynamic/public"
import {createClient} from "@supabase/supabase-js"

const SUPABASE_URL = env.PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = env.PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

let supabaseClient = null

export function getSupabaseClient() {
	if (!browser || !isSupabaseConfigured) return null

	if (!supabaseClient) {
		supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
	}

	return supabaseClient
}
