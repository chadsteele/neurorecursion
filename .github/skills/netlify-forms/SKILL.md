---
name: netlify-forms
description: Requirements and implementation strategy for Netlify Forms in this SvelteKit repo.
---

# Netlify Forms

Use this skill when adding, fixing, reviewing, or refactoring any form that should be captured by Netlify in this repository.

## Repository Requirements

- Keep Netlify form submission native. Do not replace form submission with `fetch`, custom server endpoints, or client-side AJAX for the final submit path.
- A Netlify form must include all of the following:
    - `method="POST"`
    - a stable `name` attribute on the `<form>`
    - the `netlify` attribute
    - `netlify-honeypot="bot-field"`
    - a hidden input whose `name="form-name"` and `value` matches the form name
- Keep the honeypot field present in rendered HTML with `name="bot-field"`.
- Client-side validation is allowed, but only to block invalid submits. If validation passes, let the browser submit naturally to Netlify.
- Success UX in this repo is not the default Netlify confirmation page. Forms should submit to:
    - `/success`
- Form context should be stored client-side before the native submit:
    - `form` for success-page copy variation
    - `redirectTo` for countdown return and the `Return now` button

## Current Repo Strategy

- Use a plain `/success` action. In production, query-string actions can fall through to a direct POST on `/success?...` and return `405 Method Not Allowed` instead of being handled by Netlify.
- Save success-page context in `sessionStorage` during the `onsubmit` handler before allowing the native submit.
- Keep existing `onsubmit` handlers only for validation and field preparation.
- Do not call `event.preventDefault()` unless the submission is invalid.
- Do not add SvelteKit form actions or API routes for Netlify-managed forms.
- Preserve any hidden inputs that serialize extra state into the submission payload.
- Keep `src/routes/success/+page.server.js` prerendered so the custom success page exists as static output.

## Canonical Pattern

```svelte
<script>
	import {saveNetlifySuccessContext} from "$lib/netlifySuccess.js"

	const successAction = "/success"

	function handleFormSubmit(event) {
		const isValid = true

		if (!isValid) {
			event.preventDefault()
			return
		}

		saveNetlifySuccessContext({
			form: "signup",
			redirectTo: window.location.pathname + window.location.search,
		})

		// Let the browser submit naturally to Netlify Forms.
	}
</script>

<form
	name="signup"
	method="POST"
	action={successAction}
	netlify-honeypot="bot-field"
	netlify
	onsubmit={handleFormSubmit}
>
	<input type="hidden" name="form-name" value="signup" />
	<div class="hidden" aria-hidden="true">
		<label>
			Do not fill this out if you are human
			<input type="text" name="bot-field" tabindex="-1" />
		</label>
	</div>
</form>
```

## Active Forms To Check Before Changing Behavior

- `src/lib/SignUp.svelte`
- `src/lib/CareersForm.svelte`
- `src/routes/consent/+page.svelte`
- `src/routes/marketplace/+page.svelte`

## Review Checklist

- Does the form still render as actual HTML at build/runtime so Netlify can detect it?
- Does `form-name` exactly match the form `name`?
- Does the submit path still end in native browser submission?
- Does the form action point to `/success`?
- Does the `onsubmit` handler save both `form` and `redirectTo` before allowing the native submit?
- Is `src/routes/success/+page.server.js` still set to `prerender = true`?
- Did any validation change accidentally stop valid submits?
- If hidden derived fields exist, are they still populated before submit?
- After edits, check Svelte compile errors and verify there are no deprecated event bindings introduced nearby.

## Known Failure Modes

- `fetch`-based submission bypasses Netlify capture.
- `preventDefault()` left in place after validation refactors silently breaks capture.
- Missing or mismatched `form-name` prevents Netlify from recognizing the form.
- Removing the honeypot changes spam filtering behavior.
- Accessing `$page.url.search` directly on prerendered pages causes the build to fail.
- Using query-string success actions can produce a direct POST to `/success?...` and return `405 Method Not Allowed`.
- Reverting to a plain `/success` action without storing context loses form-specific copy and return routing.
