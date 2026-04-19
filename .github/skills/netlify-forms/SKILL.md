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
    - `/success?form=<form-id>&redirectTo=<current-path-and-query>`
- The success page already reads:
    - `form` for copy variation
    - `redirectTo` for countdown return and the `Return now` button

## Current Repo Strategy

- Derive the form action from the current page URL instead of hard-coding a plain `/success`.
- On prerendered pages, do not read `$page.url.search` or `searchParams` during SSR. Guard query-string access with `browser` and fall back to the pathname during prerender.
- Keep existing `onsubmit` handlers only for validation and field preparation.
- Do not call `event.preventDefault()` unless the submission is invalid.
- Do not add SvelteKit form actions or API routes for Netlify-managed forms.
- Preserve any hidden inputs that serialize extra state into the submission payload.

## Canonical Pattern

```svelte
<script>
	import {browser} from "$app/environment"
	import {page} from "$app/stores"

	const successAction = $derived(
		`/success?form=signup&redirectTo=${encodeURIComponent($page.url.pathname + (browser ? $page.url.search : ""))}`,
	)

	function handleFormSubmit(event) {
		const isValid = true

		if (!isValid) {
			event.preventDefault()
			return
		}

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
- Does the form action include both `form` and `redirectTo` query params?
- If the route is prerendered, is query-string access guarded so SSR does not touch `url.search` or `searchParams`?
- Did any validation change accidentally stop valid submits?
- If hidden derived fields exist, are they still populated before submit?
- After edits, check Svelte compile errors and verify there are no deprecated event bindings introduced nearby.

## Known Failure Modes

- `fetch`-based submission bypasses Netlify capture.
- `preventDefault()` left in place after validation refactors silently breaks capture.
- Missing or mismatched `form-name` prevents Netlify from recognizing the form.
- Removing the honeypot changes spam filtering behavior.
- Accessing `$page.url.search` directly on prerendered pages causes the build to fail.
- Reverting to `action="/success"` loses context-aware return routing.
