# NRI Neurorecursion Project - Netlify Setup Guide

## Project Overview

This project is a SvelteKit site deployed on Netlify and uses native Netlify Forms for submission capture. The current strategy does not use custom server endpoints, SvelteKit form actions, SendGrid, or AJAX for the final form submit path.

## Quick Start For Deployment

### 1. Prerequisites

- A Netlify account
- A GitHub repository for this project
- A local Node.js version compatible with the project configuration

### 2. Local Setup

```bash
npm install
npm run dev
```

### 3. Verify The Build

```bash
npm run build
```

Netlify should build from the repository's existing `netlify.toml` configuration.

### 4. Deploy To Netlify

#### Option A: GitHub Integration

1. Push the repository to GitHub.
2. In Netlify, choose Add new site → Import an existing project.
3. Select the repository.
4. Let Netlify use the settings from `netlify.toml`.
5. Deploy.

#### Option B: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## Netlify Forms Strategy In This Repo

All Netlify-managed forms in this repository follow the same pattern:

- Native browser `POST` submission
- `netlify` attribute on the form
- `netlify-honeypot="bot-field"`
- Hidden input with `name="form-name"`
- Client-side validation only blocks invalid submits
- If validation passes, the browser submits naturally to Netlify

Current active forms:

- `signup`
- `careers`
- `consent`
- `future-order-request`

## Success Flow

Forms should submit to a success URL shaped like this:

```text
/success?form=<form-id>&redirectTo=<current-path-and-query>
```

That allows the shared success page to:

- render form-specific success copy
- auto-redirect after a short countdown
- offer a `Return now` button
- return the user to the page they came from instead of always sending them to `/`

## Form Submission Flow

```text
User fills form
    ↓
Client-side validation runs
    ↓
Browser submits form with POST
    ↓
Netlify captures submission
    ↓
User lands on /success with form + redirectTo query params
    ↓
Success page shows context-aware message
    ↓
User auto-redirects back to the originating page or clicks Return now
```

## Viewing Submissions

1. Open the site in the Netlify dashboard.
2. Open Forms.
3. Select the form name you want to inspect.
4. Review entries or export CSV as needed.

## Optional Notifications

If you want email alerts for submissions, configure them directly in Netlify:

1. Open Forms in the Netlify dashboard.
2. Open a form.
3. Add a form notification.

This is operationally separate from the site code. The repository itself does not send form emails through a custom backend.

## Relevant Files

```text
src/lib/SignUp.svelte
src/lib/CareersForm.svelte
src/routes/consent/+page.svelte
src/routes/marketplace/+page.svelte
src/routes/success/+page.svelte
netlify.toml
```

## Troubleshooting

### Form submissions not appearing

- Verify the form still has `method="POST"`, `netlify`, `netlify-honeypot`, and matching `form-name`.
- Verify client-side validation is not calling `preventDefault()` for valid submissions.
- Verify the form still renders as real HTML in the built output.
- Confirm you are looking at the right form name in the Netlify dashboard.

### Redirect behavior is wrong

- Verify the form action includes both `form` and `redirectTo` query params.
- Verify the success page still reads those params.

### Build fails on Netlify

- Check the build logs.
- Confirm `netlify.toml` parses cleanly.
- Clear the Netlify cache and redeploy if needed.

## Important Notes

- Do not replace the final submit path with `fetch` or an API route.
- Do not remove the honeypot field.
- Do not change a form name without updating the hidden `form-name` input to match.
- Do not revert actions back to plain `/success` if you want context-aware return behavior.

## Security Notes

- Form validation prevents HTML/SQL injection
- Environment variables remain separate from the Netlify Forms flow
- No user data stored on frontend

## Support Resources

- **Netlify**: https://docs.netlify.com/
- **SvelteKit**: https://kit.svelte.dev/docs
- **SvelteKit + Netlify**: https://docs.netlify.com/integrations/frameworks/sveltekit/

## Performance Metrics

After deployment, check:

- Core Web Vitals in Netlify Analytics
- Build time (should be < 2 minutes)
- Form capture and redirect behavior on each active form

## Next Steps

1. ✓ Customize form fields as needed
2. ✓ Add additional pages or sections
3. ✓ Set up custom domain
4. ✓ Configure DNS records
5. ✓ Set up SSL certificate (auto from Netlify)
