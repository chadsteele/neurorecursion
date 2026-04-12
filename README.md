# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.14.0 create --template minimal --no-types --install npm neurorecursion
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

---

## Netlify Deployment Notes

### File Access in Server-Side Code

⚠️ **CRITICAL:** Do NOT use `__dirname` for accessing static files in Netlify serverless functions.

- `__dirname` points to `.netlify/functions-internal/`, not `/var/task/`
- Always use `process.cwd()` which reliably returns `/var/task`

**Use the centralized file resolver utility:**

```javascript
import {resolveStaticFile} from "$lib/server/file-resolver.js"

const logoPath = await resolveStaticFile("logo.png")
```

See [NETLIFY_PATH_RESOLUTION.md](./docs/NETLIFY_PATH_RESOLUTION.md) for complete details.

### Static Files Bundling

Ensure `netlify.toml` includes static directories:

```toml
[functions]
  included_files = ["static/**", "fonts/**"]
```

### Image Endpoint

The `/api/image` endpoint processes and watermarks images. It:

- Accepts `url` parameter (data:, http, or /static/)
- Returns PNG with watermark overlay
- Uses centralized file resolver for all static asset access
