# Netlify Deployment Guide

This repository deploys to Netlify and uses native Netlify Forms for submission capture.

## Deployment Basics

### Prerequisites

- A Netlify account
- The repository pushed to GitHub or available locally for CLI deploys
- A local Node.js version compatible with the project configuration

### Local Verification

```bash
npm install
npm run build
```

If the build succeeds locally, Netlify should be able to use the same repository configuration.

### Deploy

#### GitHub import

1. Open Netlify.
2. Import the repository.
3. Let Netlify use `netlify.toml`.
4. Deploy.

#### Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## Netlify Forms In This Repository

The active forms are:

- `signup`
- `careers`
- `consent`
- `future-order-request`

Each of them should follow this structure:

- `method="POST"`
- stable form `name`
- `netlify`
- `netlify-honeypot="bot-field"`
- hidden `form-name` input matching the form name
- validation-only submit handler that allows valid submissions to continue naturally

## Success Page Contract

Forms submit to the shared success route with query params:

```text
/success?form=<form-id>&redirectTo=<current-path-and-query>
```

The success page uses:

- `form` to vary the message
- `redirectTo` for auto-return and the immediate return button

## What Not To Do

- Do not submit with `fetch` instead of a native browser POST.
- Do not add a custom API route for Netlify-managed forms.
- Do not rely on SvelteKit server actions for these forms.
- Do not remove the honeypot field.
- Do not let `preventDefault()` run on valid submissions.

## Viewing And Exporting Submissions

1. Open the Netlify dashboard.
2. Open Forms.
3. Choose the form you want.
4. Review entries or export CSV.

Optional form notifications can be configured directly in the Netlify dashboard.

## Troubleshooting

### Forms not captured

- Check that the form still renders in HTML.
- Check that `form-name` matches the form `name`.
- Check that the form still posts with `method="POST"`.
- Check that valid submissions are not blocked by validation code.

### Redirects wrong after submit

- Check that the action still includes `form` and `redirectTo`.
- Check that the success page still reads those params.

### Netlify build failure

- Check the deploy log.
- Check `netlify.toml` for syntax issues.
- Run `npm run build` locally.

## Relevant Files

```text
src/lib/SignUp.svelte
src/lib/CareersForm.svelte
src/routes/consent/+page.svelte
src/routes/marketplace/+page.svelte
src/routes/success/+page.svelte
netlify.toml
```

## References

- Netlify Forms: https://docs.netlify.com/forms/overview
- Netlify Support: https://support.netlify.com
- SvelteKit Docs: https://kit.svelte.dev
