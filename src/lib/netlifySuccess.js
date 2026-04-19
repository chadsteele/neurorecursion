import {browser, dev} from "$app/environment"
import {goto} from "$app/navigation"

const FORM_KEY = "netlify-success-form"
const REDIRECT_KEY = "netlify-success-redirect-to"

export function saveNetlifySuccessContext({form, redirectTo}) {
	if (!browser) {
		return
	}

	if (form) {
		sessionStorage.setItem(FORM_KEY, form)
	}

	if (redirectTo) {
		sessionStorage.setItem(REDIRECT_KEY, redirectTo)
	}
}

export function readNetlifySuccessContext() {
	if (!browser) {
		return {
			form: "",
			redirectTo: "/",
		}
	}

	return {
		form: sessionStorage.getItem(FORM_KEY) || "",
		redirectTo: sessionStorage.getItem(REDIRECT_KEY) || "/",
	}
}

export function clearNetlifySuccessContext() {
	if (!browser) {
		return
	}

	sessionStorage.removeItem(FORM_KEY)
	sessionStorage.removeItem(REDIRECT_KEY)
}

export function getCurrentFormPath() {
	if (!browser) {
		return ""
	}

	return window.location.pathname + window.location.search
}

function isPlainLocalDevServer() {
	if (!browser || !dev) {
		return false
	}

	const isLocalHost =
		window.location.hostname === "localhost" ||
		window.location.hostname === "127.0.0.1"

	if (!isLocalHost) {
		return false
	}

	// Netlify Dev typically serves on 8888 and can preserve native form behavior.
	return window.location.port !== "8888"
}

export async function handleLocalFormNavigation(event, targetPath) {
	if (!isPlainLocalDevServer()) {
		return false
	}

	event.preventDefault()
	await goto(targetPath)
	return true
}
