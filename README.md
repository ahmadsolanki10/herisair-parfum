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

## Before launch

1. Confirm product price, size, availability and tested longevity claims in `assets/js/products.js`.
2. Connect the bag's checkout button to a secure hosted payment provider or a server-side checkout endpoint.
3. Add a server-side form endpoint to the `data-endpoint` attribute in `contact.html`.
4. Replace provisional shipping, returns and legal wording with approved business policies.
5. Confirm the production domain in `robots.txt`, `sitemap.xml`, canonical tags, and social metadata.

## Contact email connection

Browser JavaScript must never contain SMTP credentials. Create a server-side handler on Hostinger using PHP or another supported server runtime and configure these values outside the public web folder:

- SMTP host (shown in Hostinger Email settings)
- SMTP port (`465` for SSL or `587` for TLS, as provided by Hostinger)
- SMTP username (the full mailbox address)
- SMTP password
- Encryption method
- Sender address and sender name
- Destination client-care address

The handler should validate and sanitize every field, reject the hidden `website` honeypot when filled, apply a per-IP rate limit, verify an optional Turnstile/hCaptcha token, send through authenticated SMTP, and return JSON with an appropriate HTTP status. Set its URL on `data-endpoint` in `contact.html`.

## Updating products

All collection content lives in `assets/js/products.js`. Keep each slug unique and add its images to `assets/images`. The collection overview and shopping bag are generated from this single file.
