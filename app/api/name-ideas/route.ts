import { NextResponse } from 'next/server';

type Payload = { idea?: string };

type NameIdea = {
  name: string;
  domain: string;
  angle: string;
  score: number;
  tlds: string[];
};

const STOP_WORDS = new Set([
  'a','an','and','are','as','at','be','by','for','from','in','into','is','it','of','on','or','that','the','this','to','with','your','you','my','our','their','business','company','service','app','website','tool'
]);

const SUFFIXES = ['Pilot', 'Forge', 'Flow', 'Base', 'Kit', 'Labs', 'HQ', 'Works', 'Wise', 'ly', 'io'];
const PREFIXES = ['Nova', 'Bright', 'Swift', 'Clear', 'True', 'North', 'Peak', 'Fresh', 'Urban', 'Ever'];
const INVENTED_ROOTS = ['Zentra', 'Avora', 'Nexora', 'Lumio', 'Kivo', 'Mavira', 'Solvo', 'Brava', 'Orbi', 'Velora'];
const BENEFIT_WORDS = ['Launch', 'Growth', 'Direct', 'Prime', 'Nimble', 'Signal', 'Spark', 'Scout', 'Path', 'Lift'];

function titleCase(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function cleanName(name: string) {
  return name
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/Stack$/i, '')
    .slice(0, 22);
}

function domainify(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
}

function getKeywords(idea: string) {
  const words = idea
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const unique = Array.from(new Set(words));
  return unique.length ? unique.slice(0, 6) : ['brand', 'launch'];
}

function buildFallbackIdeas(idea: string): NameIdea[] {
  const keywords = getKeywords(idea).map(titleCase);
  const primary = keywords[0] || 'Brand';
  const secondary = keywords[1] || 'Launch';
  const third = keywords[2] || 'Growth';

  const candidates = [
    { name: `${primary}${SUFFIXES[0]}`, angle: `Clear, practical name built around “${primary}” with an assistant/product feel.` },
    { name: `${PREFIXES[0]}${primary}`, angle: `Modern founder-friendly brand with a polished SaaS sound.` },
    { name: `${primary}${BENEFIT_WORDS[0]}`, angle: `Direct and conversion-oriented; good for service businesses and tools.` },
    { name: `${secondary}${SUFFIXES[2]}`, angle: `Smooth workflow positioning; useful for automation, booking, or productivity ideas.` },
    { name: `${INVENTED_ROOTS[0]}`, angle: `Short invented brand; flexible if you want room to expand beyond the original niche.` },
    { name: `${primary}${third}`, angle: `Keyword-rich name that quickly communicates what the business does.` },
    { name: `${PREFIXES[2]}${secondary}`, angle: `Speed-focused brand angle; useful when the product saves time.` },
    { name: `${secondary}${SUFFIXES[5]}`, angle: `Startup-style name; good for AI, software, analytics, or creator tools.` },
    { name: `${INVENTED_ROOTS[3]}`, angle: `Simple, brandable, and easy to remember.` },
    { name: `${BENEFIT_WORDS[6]}${primary}`, angle: `Energetic name that fits launches, side hustles, and new ventures.` },
    { name: `${primary}${SUFFIXES[8]}`, angle: `Trustworthy advisory feel; good for comparison, recommendation, or education sites.` },
    { name: `${PREFIXES[5]}${primary}`, angle: `Premium, reliable positioning for local services or professional brands.` },
  ];

  const seen = new Set<string>();
  return candidates
    .map((item, index) => ({
      ...item,
      name: cleanName(item.name),
      score: Math.max(72, 96 - index * 2),
      tlds: ['.com', '.co', '.io', '.app', '.ai'].slice(0, 2 + (index % 4)),
    }))
    .filter((item) => item.name.length >= 4)
    .filter((item) => {
      const key = item.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((item) => ({ ...item, domain: domainify(item.name) }));
}

async function buildOpenAIIdeas(idea: string): Promise<NameIdea[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = `Generate 12 unique, brandable business names for this idea: "${idea}".

Rules:
- Do not make every name use the same suffix.
- Do not force the word Stack.
- Mix styles: short invented names, modern SaaS names, clear keyword names, and premium service names.
- Avoid hyphens, numbers, trademarked brands, and names longer than 22 characters.
- Each name should work as a domain.
- Return JSON only in this exact shape: {"ideas":[{"name":"Name","angle":"one sentence positioning angle","score":94}]}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.9,
      messages: [
        { role: 'system', content: 'You are an expert naming strategist for startups, local businesses, ecommerce brands, and affiliate websites.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed?.ideas)) return null;

    const seen = new Set<string>();
    return parsed.ideas
      .map((item: any, index: number) => {
        const name = cleanName(String(item.name || ''));
        return {
          name,
          domain: domainify(name),
          angle: String(item.angle || 'Brandable name with a clear launch angle.').slice(0, 160),
          score: Number.isFinite(Number(item.score)) ? Math.min(99, Math.max(60, Number(item.score))) : 94 - index,
          tlds: ['.com', '.co', '.io', '.app', '.ai'].slice(0, 2 + (index % 4)),
        };
      })
      .filter((item: NameIdea) => item.name.length >= 4)
      .filter((item: NameIdea) => {
        const key = item.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 12);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Payload;
  const idea = (body.idea || '').slice(0, 240).trim();

  if (!idea) {
    return NextResponse.json({ error: 'Please enter a business idea first.' }, { status: 400 });
  }

  const aiIdeas = await buildOpenAIIdeas(idea);
  const ideas = aiIdeas?.length ? aiIdeas : buildFallbackIdeas(idea);

  return NextResponse.json({ ideas });
}
