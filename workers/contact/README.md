# Contact Worker

Cloudflare Worker endpoint for the Pathflow Acquisitions contact form.

## Setup

1. In Cloudflare, enable Email Service for `getpathflow.com`.
2. Verify the destination mailbox `info@getpathflow.com`.
3. Review `workers/contact/wrangler.toml`, especially `ALLOWED_ORIGINS`, `EMAIL_FROM`, and `EMAIL_TO`.
4. Log in to Cloudflare:

```bash
npm run worker:login
```

5. Deploy the Worker:

```bash
npm run worker:deploy
```

6. If Turnstile is enabled on the frontend, set the Worker secret and redeploy:

```bash
npm run worker:secret:turnstile
npm run worker:deploy
```

7. Set `VITE_CONTACT_ENDPOINT` in the site build environment to the deployed Worker URL and rebuild the site:

```text
https://pathflow-contact.vladimir-246.workers.dev
```

## Local Development

Copy `.dev.vars.example` to `.dev.vars` if you need local secrets. Do not commit `.dev.vars`.

```bash
npm run worker:dev
```

The send-email binding uses Cloudflare remote bindings, so local development still talks to Cloudflare Email Service.
