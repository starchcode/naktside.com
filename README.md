# naktside.com

The Next.js site for naktside.

## Getting started locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env template and fill in real values:

   ```bash
   cp .env.example .env.local
   ```

   See [.env.example](.env.example) for what each variable is and where to get it (MongoDB Atlas connection string, Cloudflare Turnstile keys, contact email).

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see it.

Other scripts:

```bash
npm run build   # production build
npm run start   # run a production build locally
npm run lint    # lint the project
```

## Deployment

The site is deployed on [Vercel](https://vercel.com), connected to this repo's GitHub remote.

- **Pushing to `main` deploys to production automatically.** There is no manual deploy step — a `git push` to `main` is what triggers a new production build/deployment on Vercel.
- Pushing to any other branch (or opening a pull request) creates a separate Preview deployment with its own URL, without touching production.
- All environment variables in `.env.example` must also be added in Vercel under Project → Settings → Environment Variables (for Production, and Preview/Development if needed for parity). `TURNSTILE_SECRET_KEY` and `CONTACT_EMAIL` should be marked Sensitive there.

## Domain

`naktside.com` is registered on GoDaddy and points to Vercel via DNS records (A record for the apex domain, CNAME for `www` if used) configured in GoDaddy's DNS management, with the domain added under Project → Settings → Domains in Vercel.

## Stack & structure

- **Next.js 16** (App Router), React 19, Tailwind CSS v4.
- **MongoDB** via Mongoose (`libs/mongodb.js`) — connects using `MONGODB_URI`, with the target database name split by environment (`db_collection` in [next.config.ts](next.config.ts): `local_naktside` in dev, `prod_naktside` in production).
- **`models/link.js`** — a `Link` document (`name`, `url`, `type` enum of `youtube`/`instagram`) used to show a link on the homepage.
- **`libs/links_data.js`** — fetches `Link` documents for the homepage.
- **Contact reveal** (`components/ContactReveal.tsx` + `app/actions/verify-turnstile.ts`) — a Cloudflare Turnstile–gated reveal: the contact email stays server-side and is only returned to the browser after a Server Action verifies the visitor passed the Turnstile challenge, so the address isn't scrapeable from the page source.
- **Font**: Source Code Pro, loaded via `next/font/google` in [app/layout.tsx](app/layout.tsx), applied app-wide as the sans/mono font in [app/globals.css](app/globals.css).
- **Traffic-source tracking** (`models/visit.js` + `libs/visits_data.js`) — bio/description links to the homepage are tagged with `?utm_source=ig` or `?utm_source=yt`; anything else (including a direct visit) is recorded as `other`. Each record stores just the source and a coarse country (read from Vercel's `x-vercel-ip-country` request header — the raw IP is never read or stored, and nothing is tracked across visits), written via `after()` so it never delays the page. A privacy notice banner (`components/PrivacyNotice.tsx`) discloses this on every page, with "Close" (hides for the current browser session) and "Don't show this again" (hides permanently, via `localStorage`).
- **`/admin`** (`app/admin/`) — a password-gated dashboard for the visit data above: total/per-source counts and a chart (via [Recharts](https://recharts.org)), filterable by date range and source. Not linked from anywhere else on the site.
  - **Login is two-step**: `ADMIN_EMAIL`/`ADMIN_PASSWORD` first (env vars, set manually — not stored anywhere else), then a 6-digit TOTP code from an authenticator app (`ADMIN_TOTP_SECRET`, verified in `libs/totp.js` — a from-scratch RFC 6238 implementation, no library). A signed, HTTP-only session cookie (`libs/admin-auth.js`, signed with `AUTH_SECRET`) is only set after both steps pass; the dashboard auto-logs-out after 5 minutes of inactivity.
  - **Lockout**: 3 failed attempts (password or code, combined) from the same IP blocks further attempts from it for 24 hours (`models/login-attempt.js` + `libs/login-attempts.js` — a MongoDB TTL index auto-expires the record after a day, which is what lifts the lockout). This is the one place in the project that stores an IP address, deliberately scoped to abuse-prevention rather than analytics.

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Turnstile docs](https://developers.cloudflare.com/turnstile/)
- [Mongoose docs](https://mongoosejs.com/docs/)
