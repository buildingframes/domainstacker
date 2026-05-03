# DomainStacker

DomainStacker is a Next.js app that turns a business idea into brandable domain suggestions, domain availability checks, social-handle checks, and a recommended launch stack.

## What is now connected

- `/api/domain-check` checks domain availability.
  - If `GODADDY_API_KEY` and `GODADDY_API_SECRET` are present, it uses GoDaddy's domain availability API.
  - If keys are missing or the API errors, it falls back to stable demo results so the UI still works.
- `/api/social-check` checks public profile URLs for X, Instagram, TikTok, and YouTube.
  - Social platforms can block automated requests, so the UI clearly asks users to manually verify handles before buying a domain.
- Affiliate-ready outbound links are in `app/page.tsx`.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Deploy on Vercel

1. Push this folder to GitHub.
2. In Vercel, choose **Add New Project**.
3. Import the GitHub repository.
4. Framework preset should auto-detect **Next.js**.
5. Add environment variables if you have GoDaddy API keys:
   - `GODADDY_API_KEY`
   - `GODADDY_API_SECRET`
6. Click **Deploy**.

## Affiliate links

Replace placeholder links in `app/page.tsx`, especially:

- `YOUR_AFFILIATE_ID`
- `YOUR_CODE`

For best conversion, use deep links that open a registrar search page with the generated domain prefilled.

## Notes

Social-handle checking is best-effort. Public social platforms frequently change bot protection, redirects, and profile-page behavior. Treat the result as a convenience signal, not a legal or ownership guarantee.

Legal pages are starter templates and should be reviewed before paid ad campaigns.
