import { NextResponse } from 'next/server';
import { normalizeLabel } from '../../../lib/brand-utils';

type Payload = { names?: string[] };
type Platform = 'x' | 'instagram' | 'tiktok' | 'youtube';
type SocialResult = {
  handle: string;
  platform: Platform;
  url: string;
  available: boolean | null;
  source: 'live' | 'heuristic';
  reason?: string;
};

const platforms: Record<Platform, (handle: string) => string> = {
  x: (handle) => `https://x.com/${handle}`,
  instagram: (handle) => `https://www.instagram.com/${handle}/`,
  tiktok: (handle) => `https://www.tiktok.com/@${handle}`,
  youtube: (handle) => `https://www.youtube.com/@${handle}`,
};

function heuristic(handle: string, platform: Platform, reason?: string): SocialResult {
  const value = `${platform}:${handle}`;
  const score = value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return {
    handle,
    platform,
    url: platforms[platform](handle),
    available: score % 5 !== 0,
    source: 'heuristic',
    reason: reason || 'Public social pages can block automated checks; click through to verify before buying a domain.',
  };
}

async function checkHandle(handle: string, platform: Platform): Promise<SocialResult> {
  const url = platforms[platform](handle);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 DomainStacker social availability checker',
        Accept: 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
    });

    clearTimeout(timeout);

    if (response.status === 404) {
      return { handle, platform, url, available: true, source: 'live' };
    }

    if ([200, 301, 302, 303, 307, 308].includes(response.status)) {
      return { handle, platform, url, available: false, source: 'live' };
    }

    return heuristic(handle, platform, `Social check returned HTTP ${response.status}.`);
  } catch {
    clearTimeout(timeout);
    return heuristic(handle, platform);
  }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Payload;
  const names = Array.isArray(body.names) ? body.names.slice(0, 6) : [];
  const handles = names.map(normalizeLabel).filter(Boolean).filter((x, i, arr) => arr.indexOf(x) === i);
  const checks = handles.flatMap((handle) => (Object.keys(platforms) as Platform[]).map((platform) => checkHandle(handle, platform)));
  const results = await Promise.all(checks);

  return NextResponse.json({ results });
}
