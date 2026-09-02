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

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Turnstile docs](https://developers.cloudflare.com/turnstile/)
- [Mongoose docs](https://mongoosejs.com/docs/)
