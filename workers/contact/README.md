# Contact Worker

Cloudflare Worker endpoint for the Pathflow Acquisitions contact form. Email delivery uses Resend.

## Setup

1. Verify the sender domain/address in Resend.
2. Review `workers/contact/wrangler.toml`, especially `ALLOWED_ORIGINS`, `EMAIL_FROM`, and `EMAIL_TO`.
3. Log in to Cloudflare:

```bash
npm run worker:login
```

4. Store the Resend API key as a Worker secret:

```bash
npm run worker:secret:resend
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

Local development needs `RESEND_API_KEY` in `.dev.vars` if you want to send through Resend locally.
