# Pathflow Acquisitions Website

Vite + React landing page for Pathflow Acquisitions.

## Commands

```bash
npm install
npm run dev
npm run build
npm run worker:login
npm run worker:dev
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

## Contact Form Security

This repository may be public, so never put email provider API keys, Cloudflare Turnstile secrets, or recipient routing logic in the React app.

Contact submissions are handled by the Cloudflare Worker in `workers/contact`.

- Set `VITE_CONTACT_ENDPOINT` to `https://pathflow-contact.vladimir-246.workers.dev` for the built site.
- Optionally set `VITE_TURNSTILE_SITE_KEY` to the public Cloudflare Turnstile site key.
- Store the Turnstile secret key as a Worker secret only.
- Verify the Turnstile token inside the Worker before sending email.
- Ignore any client-provided recipient address. The Worker should always send to the configured destination, currently `info@getpathflow.com`.
- Validate field lengths and email format server-side, check the honeypot field, rate limit submissions, and restrict CORS to the production site origin.

The frontend intentionally sends only public form fields, the honeypot value, the optional Turnstile token, and the page source URL.

## Cloudflare Worker Email Setup

Cloudflare Email Service requires the sending domain to use Cloudflare DNS. In the Cloudflare dashboard, go to **Compute > Email Service > Email Sending**, onboard `getpathflow.com`, and let Cloudflare add the bounce, SPF, DKIM, and DMARC records.

The Worker uses a `send_email` binding restricted to `info@getpathflow.com` and `website@getpathflow.com`. Before the first deploy, confirm that `info@getpathflow.com` is a verified destination address in **Compute > Email Service > Email Routing > Destination Addresses**.

Current Worker URL:

```text
https://pathflow-contact.vladimir-246.workers.dev
```

```bash
npm install
npm run worker:login
npm run worker:typecheck
npm run worker:deploy
```

If Turnstile is enabled, add the secret after the first Worker deploy:

```bash
npm run worker:secret:turnstile
npm run worker:deploy
```
