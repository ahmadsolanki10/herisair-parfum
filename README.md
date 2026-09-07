# Hérisair website

This is a framework-free static website, packaged with a small Node server for Railway.

## Run locally

```bash
npm start
```

Then open `http://localhost:3000`.

## Deploy on Railway

Connect this GitHub repository to a new Railway project. Railway will use
`railway.json`, run `npm start`, and verify the site at `/health`.

## Stripe Checkout

The bag opens Stripe's hosted Checkout through a server-side endpoint. Stripe
secret keys must only be added in Railway under the service's **Variables** tab;
they must never be added to browser code or committed to GitHub.

Required Railway variables:

- `STRIPE_SECRET_KEY`: the Stripe secret key for the same mode as the configured products and prices
- `CANONICAL_SITE_URL`: `https://herisair.com` (optional; this is also the built-in production default)
- `STRIPE_WEBHOOK_SECRET`: the signing secret from the production Stripe webhook

Create the Stripe webhook with this endpoint:

`https://herisair.com/api/stripe-webhook`

Subscribe it to `checkout.session.completed` and
`checkout.session.async_payment_succeeded`. The Stripe Price, tax-rate and
shipping-rate IDs are configured in `server.mjs` and may be overridden through
the optional Railway variables documented in `.env.example`.

## Before launch

1. Confirm product price, size, availability and tested longevity claims in `assets/js/products.js`.
2. Add the Client Care SMTP credentials to Railway Variables and submit a delivery test.
3. Replace provisional shipping, returns and legal wording with approved business policies.
4. Confirm the production domain in `robots.txt`, `sitemap.xml`, canonical tags, and social metadata.
5. Complete one Stripe test-mode order before switching the matching Price, tax, shipping and secret-key objects to live mode.

## Contact email connection

Browser JavaScript never contains SMTP credentials. The Railway server receives `/api/contact` submissions, validates them, applies honeypot and per-IP rate-limit protection, and sends them to `info@herisair.com` through authenticated SMTP. Configure these values in Railway Variables:

- `SMTP_HOST` (for Hostinger Email: `smtp.hostinger.com`)
- `SMTP_PORT` (`465` for SSL, or `587` for STARTTLS)
- `SMTP_USER` (the full mailbox address)
- `SMTP_PASSWORD` (the mailbox password; never commit it)
- `CONTACT_FROM_EMAIL` (for example `Hérisair Client Care <info@herisair.com>`)
- `CONTACT_TO_EMAIL` (`info@herisair.com`)

After Railway redeploys, submit one real enquiry on `/client-care` and confirm it reaches the inbox. If delivery volume grows, add Turnstile or hCaptcha in addition to the existing protections.

## Updating products

All collection content lives in `assets/js/products.js`. Keep each slug unique and add its images to `assets/images`. The collection overview and shopping bag are generated from this single file.
