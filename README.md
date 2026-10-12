# Pathflow Acquisitions Website

Vite + React landing page for Pathflow Acquisitions.

## Commands

```bash
npm install
npm run dev
npm run build
npm run pages:deploy
npm run router:deploy
npm run worker:login
npm run worker:dev
npm run worker:secret:resend
npm run worker:deploy
```

## Images

Hero and brand assets live in `public/images`.

The current hero image is:

```text
public/images/landing-hero.png
```

## Deployment Target

The marketing website is built for this path:

```text
https://getpathflow.com/acquisitions
```

Do not deploy this website to `acquisitions.getpathflow.com`; that subdomain is reserved for the Acquisitions app.

Do not deploy this website to the `getpathflow.com` root. The main product website owns:

```text
https://getpathflow.com/
```

The Vite config uses `base: "/acquisitions/"`, and internal links are generated under that base path. The built static assets should be served so these paths resolve:

```text
/acquisitions/
/acquisitions/assets/*
/acquisitions/images/*
```

The build runs `npm run verify:deployment-target` first. That check protects against accidentally changing the build target back to root, reintroducing GitHub Pages deployment, or allowing the private/GitHub Pages domains in Worker CORS.

## Cloudflare Pages Hosting

The static site is deployed to Cloudflare Pages project:

```text
pathflow-acquisitions-website
```

Pages serves the build on its own `*.pages.dev` origin. The public `getpathflow.com/acquisitions` path is handled by the Worker in `workers/acquisitions-router`, which is routed only on:

```text
getpathflow.com/acquisitions*
```

That Worker strips the `/acquisitions` prefix before fetching Pages assets. The four real marketing routes have pre-rendered HTML, and unknown paths return HTTP 404 instead of the homepage. The Worker must not be broadened to `getpathflow.com/*`, because the root domain is the main product website.


## Automatic production deployment

This site uses an existing **Cloudflare Pages Direct Upload** project, rather than Cloudflare's Git-linked Pages builds. GitHub Actions performs the deployment using Wrangler. No second Pages project or DNS changes are needed.

On every pull request, `.github/workflows/seo-checks.yml` verifies the Vite build, router types, and generated page SEO. On every push to `main`, `.github/workflows/deploy-production.yml`:

1. Installs locked dependencies, builds pre-rendered HTML, checks the router and SEO outputs.
2. Publishes `dist` to the existing `pathflow-acquisitions-website` Cloudflare Pages project.
3. Smoke-tests all four pages, their canonical metadata, sitemap XML, and a nonexistent route at the **Pages origin**.
4. Deploys the path-scoped `pathflow-acquisitions-router` Worker.
5. Repeats the smoke tests at `https://getpathflow.com/acquisitions/`.

Deployments use one serialized concurrency group and cannot be cancelled by a newer push. Manual execution (`workflow_dispatch`) is allowed, but only for `main`.

### Initial GitHub Actions setup

In this GitHub repository, go to **Settings → Secrets and variables → Actions → Repository secrets** and add:

- `CLOUDFLARE_ACCOUNT_ID` — account ID of the Cloudflare account that owns the existing Pages project.
- `CLOUDFLARE_API_TOKEN` — a purpose-specific Cloudflare API token with Pages Edit and permission to deploy the **existing** routing Worker. Use the minimum sufficient scope (Workers Editor for that Worker; Workers Routes Write for `getpathflow.com` if Wrangler needs to manage its existing route).

Do **not** put the token in source code, repository variables, or the Vite build. Configure it as a masked GitHub Actions secret and rotate it if exposed.

Optional public frontend settings go in **Settings → Secrets and variables → Actions → Variables**:

- `VITE_CONTACT_ENDPOINT` — defaults to the existing contact Worker URL.
- `VITE_TURNSTILE_SITE_KEY` — public Turnstile site key, if Turnstile is enabled server-side.

After the secrets are installed and this workflow is merged to `main`, any subsequent push to `main` automatically triggers production deployment. The merge that first introduces the workflow also triggers it. Check **Actions → Deploy Pathflow Acquisitions** for the result.

If the Worker deployment or final smoke check fails, inspect the Actions job immediately and use the prior deployment in the Cloudflare Pages dashboard for rollback if required. Never deploy the Worker before the corresponding Pages files.

To trigger a redeploy without a new commit: **Actions → Deploy Pathflow Acquisitions → Run workflow** and choose `main`.


## Contact Form Security

This repository may be public, so never put email provider API keys, Cloudflare Turnstile secrets, or recipient routing logic in the React app.

Contact submissions are handled by the Cloudflare Worker in `workers/contact`.

- Set `VITE_CONTACT_ENDPOINT` to `https://pathflow-contact.vladimir-246.workers.dev` for the built site.
- Optionally set `VITE_TURNSTILE_SITE_KEY` to the public Cloudflare Turnstile site key.
- Store the Resend API key and optional Turnstile secret key as Worker secrets only.
- Verify the Turnstile token inside the Worker before sending email.
- Ignore any client-provided recipient address. The Worker should always send to the configured destination, currently `info@getpathflow.com`.
- Validate field lengths and email format server-side, check the honeypot field, rate limit submissions, and restrict CORS to the production site origin.

The frontend intentionally sends only public form fields, the honeypot value, the optional Turnstile token, and the page source URL.

## Contact Email Delivery

The contact Worker sends email through Resend. The Resend API key must be stored as a Cloudflare Worker secret and must never be committed to this repository.

The Worker ignores client-provided recipients and always sends to the configured `EMAIL_TO`, currently `info@getpathflow.com`. The form submitter's address is used only as `reply_to`.

Current Worker URL:

```text
https://pathflow-contact.vladimir-246.workers.dev
```

```bash
npm install
npm run worker:login
npm run worker:typecheck
npm run worker:secret:resend
npm run worker:deploy
```

If Turnstile is enabled, add the secret after the first Worker deploy:

```bash
npm run worker:secret:turnstile
npm run worker:deploy
```
