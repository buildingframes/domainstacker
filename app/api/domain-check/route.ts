import { NextResponse } from 'next/server';
import { domainFromName } from '../../../lib/brand-utils';

type Payload = { names?: string[]; tlds?: string[] };
type DomainResult = {
  domain: string;
  available: boolean | null;
  price?: number | null;
  currency?: string | null;
  source: 'godaddy' | 'simulated';
  reason?: string;
};

const DEFAULT_TLDS = ['.com', '.co', '.io', '.app', '.ai'];
const MAX_NAMES = 8;
const MAX_DOMAINS = 25;

function deterministicFallback(domain: string): DomainResult {
  // Stable fallback so the interface remains demoable without paid API keys.
  const score = domain.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return {
    domain,
    available: score % 4 !== 0,
    source: 'simulated',
    reason: 'Set GODADDY_API_KEY and GODADDY_API_SECRET in Vercel for live checks.',
  };
}

async function checkGoDaddy(domain: string): Promise<DomainResult> {
  const key = process.env.GODADDY_API_KEY;
  const secret = process.env.GODADDY_API_SECRET;

  if (!key || !secret) return deterministicFallback(domain);

  const endpoint = `https://api.godaddy.com/v1/domains/available?domain=${encodeURIComponent(domain)}&checkType=FAST`;
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `sso-key ${key}:${secret}`,
      Accept: 'application/json',
    },
    // Domain results should be fresh enough for purchase intent.
    cache: 'no-store',
  });

  if (!response.ok) {
    return { ...deterministicFallback(domain), reason: `GoDaddy API returned ${response.status}.` };
  }

  const data = await response.json();
  return {
    domain,
    available: typeof data.available === 'boolean' ? data.available : null,
    price: typeof data.price === 'number' ? data.price / 1_000_000 : null,
    currency: typeof data.currency === 'string' ? data.currency : null,
    source: 'godaddy',
  };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Payload;
  const names = Array.isArray(body.names) ? body.names.slice(0, MAX_NAMES) : [];
  const tlds = Array.isArray(body.tlds) && body.tlds.length ? body.tlds.slice(0, 6) : DEFAULT_TLDS;

  const domains = names
    .flatMap((name) => tlds.map((tld) => domainFromName(name, tld.startsWith('.') ? tld : `.${tld}`)))
    .filter(Boolean)
    .filter((domain, index, arr) => arr.indexOf(domain) === index)
    .slice(0, MAX_DOMAINS);

  const results = await Promise.all(domains.map((domain) => checkGoDaddy(domain)));
  return NextResponse.json({ results });
}
