# DomainStacker

DomainStacker is a quick-deploy Next.js affiliate website/app that helps users turn a raw business idea into brandable name options, domain-style suggestions, and a starter launch stack.

## Features

- High-converting landing page for founders and side-project builders
- Idea-to-name generator API route
- Domain-style result cards
- Affiliate-ready launch stack section
- Privacy Policy page
- Terms and Conditions page
- Tailwind styling
- Vercel/GitHub ready

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Create a GitHub repo.
2. Upload this project.
3. Go to Vercel and import the repo.
4. Deploy using the default Next.js settings.

## Affiliate setup

Replace the placeholder URLs in `app/page.tsx`:

```ts
const stacks = [
  { name:'Namecheap', use:'Domain registration', url:'https://www.namecheap.com/?aff=YOUR_AFFILIATE_ID' },
  { name:'Hostinger', use:'Website hosting', url:'https://www.hostinger.com/?REFERRALCODE=YOUR_CODE' },
]
```

Also replace all `.example` email addresses in the Privacy Policy and Terms pages.

## Optional upgrades

- Connect a real domain availability API.
- Add OpenAI API generation.
- Add email capture via ConvertKit, Beehiiv, Mailchimp, or Supabase.
- Add saved user projects.
- Add a “Do Not Sell or Share” page if you enable ad retargeting or other sharing that requires it.

## Legal note

The included Privacy Policy and Terms are practical starter templates for an affiliate/lead-generation website, but they are not legal advice. Have them reviewed before serious paid ad spend.


## Brand assets included

The project now includes ready-to-use lightweight SVG assets:

- `public/assets/domainstacker-logo.svg` — full horizontal logo
- `public/assets/domainstacker-mark.svg` — app icon / compact logo mark
- `public/assets/hero-stack.svg` — homepage hero/product illustration
- `public/favicon.svg` — browser favicon

These are original vector assets and can be edited in any SVG editor or directly in code.
