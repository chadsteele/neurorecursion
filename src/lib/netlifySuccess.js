import {browser} from "$app/environment"

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
