import { NextResponse } from 'next/server';

type Payload = { idea?: string };

function makeIdeas(idea: string) {
  const words = idea.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 5);
  const roots = words.length ? words : ['launch', 'brand'];
  const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const core = roots.map(capital).join('');
  const options = [
    [`${core}Stack`, 'Direct, utility-focused, and easy to understand'],
    [`${core}Pilot`, 'Good for guidance, automation, or assistant products'],
    [`${core}Forge`, 'Strong builder/developer energy'],
    [`${core}Flow`, 'Smooth workflow and SaaS-friendly'],
    [`${core}Base`, 'Simple, trustworthy foundation feel'],
    [`${core}Kit`, 'Great for templates, tools, or starter packs'],
  ];
  return options.map(([name, angle], i) => ({
    name,
    domain: `${name.toLowerCase()}.com`,
    angle,
    score: 94 - i * 4,
    tlds: ['.com', '.co', '.io', '.app', '.ai'].slice(0, 2 + (i % 4)),
  }));
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Payload;
  const idea = (body.idea || '').slice(0, 240);
  return NextResponse.json({ ideas: makeIdeas(idea) });
}
