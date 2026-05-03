import { NextResponse } from 'next/server';

type Payload = { idea?: string };

type Intent = 'local_service' | 'saas' | 'ecommerce' | 'creator' | 'affiliate_content' | 'general';

type NameIdea = {
  name: string;
  domain: string;
  angle: string;
  score: number;
  tlds: string[];
  intent?: Intent;
};

const STOP_WORDS = new Set([
  'a','an','and','are','as','at','be','by','for','from','in','into','is','it','of','on','or','that','the','this','to','with','your','you','my','our','their','business','company','service','services','website','site','brand','startup','new','best','cheap','near','me'
]);

const LOCATION_HINTS = new Set([
  'bc','canada','ca','usa','us','uk','australia','vancouver','victoria','kamloops','kelowna','calgary','edmonton','toronto','ottawa','montreal','winnipeg','seattle','portland','austin','miami','denver','phoenix','boston','chicago','dallas','houston','atlanta','london','sydney','melbourne'
]);

const LOCAL_SERVICE_WORDS = new Set([
  'sprinkler','irrigation','lawn','landscaping','plumber','plumbing','roofer','roofing','cleaning','cleaner','maid','junk','removal','moving','movers','painting','painter','flooring','hvac','electrician','electrical','fencing','pest','pressure','washing','detailing','mechanic','repair','contractor','concrete','window','gutter','snow','pool','tree','arborist','handyman','locksmith'
]);

const SAAS_WORDS = new Set(['ai','app','tool','software','platform','dashboard','automation','agent','bot','assistant','crm','analytics','api','workflow']);
const ECOM_WORDS = new Set(['shop','store','ecommerce','e-commerce','selling','products','clothing','gear','accessories','dropshipping','print','merch']);
const CREATOR_WORDS = new Set(['newsletter','podcast','blog','youtube','creator','course','community','coaching','personal','brand']);
const AFFILIATE_WORDS = new Set(['affiliate','review','comparison','compare','deals','coupon','guide','rankings','best']);

function titleCase(word: string) {
  if (!word) return '';
  const normalized: Record<string, string> = { bc: 'BC', ca: 'CA', usa: 'USA', uk: 'UK', ai: 'AI', seo: 'SEO', crm: 'CRM', api: 'API' };
  return normalized[word.toLowerCase()] || word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function cleanWords(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function cleanName(name: string) {
  return name
    .replace(/&/g, 'And')
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/Stack$/i, '')
    .slice(0, 28);
}

function domainify(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
}

function getCoreKeywords(idea: string) {
  const unique = Array.from(new Set(cleanWords(idea).filter((w) => w.length > 1 && !STOP_WORDS.has(w))));
  return unique.slice(0, 8);
}

function detectIntent(idea: string): Intent {
  const words = cleanWords(idea);
  const hasLocation = words.some((w) => LOCATION_HINTS.has(w));
  const hasLocalService = words.some((w) => LOCAL_SERVICE_WORDS.has(w));
  if (hasLocalService || (hasLocation && words.includes('company'))) return 'local_service';
  if (words.some((w) => AFFILIATE_WORDS.has(w))) return 'affiliate_content';
  if (words.some((w) => ECOM_WORDS.has(w))) return 'ecommerce';
  if (words.some((w) => CREATOR_WORDS.has(w))) return 'creator';
  if (words.some((w) => SAAS_WORDS.has(w))) return 'saas';
  return 'general';
}

function extractLocation(words: string[]) {
  const known = words.find((w) => LOCATION_HINTS.has(w) && !['bc','ca','usa','us','uk','canada'].includes(w));
  if (known) return titleCase(known);

  const provinceIndex = words.findIndex((w) => ['bc','ca','usa','canada','us'].includes(w));
  if (provinceIndex > 0) return titleCase(words[provinceIndex - 1]);

  return '';
}

function extractRegion(words: string[]) {
  const region = words.find((w) => ['bc','ca','usa','us','uk','canada'].includes(w));
  return region ? titleCase(region) : '';
}

function extractService(words: string[]) {
  const service = words.find((w) => LOCAL_SERVICE_WORDS.has(w));
  if (!service) return titleCase(words.find((w) => !LOCATION_HINTS.has(w) && !STOP_WORDS.has(w)) || 'Service');
  if (service === 'sprinkler') return 'Sprinkler';
  if (service === 'irrigation') return 'Irrigation';
  if (service === 'detailing') return 'Detailing';
  if (service === 'removal') return 'JunkRemoval';
  if (service === 'washing') return 'PressureWashing';
  return titleCase(service);
}

function scoreIdea(name: string, intent: Intent, index: number) {
  let score = 96 - index * 2;
  if (intent === 'local_service' && /(sprinkler|irrigation|plumbing|roofing|cleaning|lawn|repair|moving)/i.test(name)) score += 3;
  if (name.length > 22) score -= 5;
  if (name.length < 8) score += 1;
  return Math.max(66, Math.min(99, score));
}

function makeIdea(name: string, angle: string, index: number, intent: Intent): NameIdea {
  const cleaned = cleanName(name);
  return {
    name: cleaned,
    domain: domainify(cleaned),
    angle,
    score: scoreIdea(cleaned, intent, index),
    tlds: ['.com', '.co', '.io', '.app', '.ai'].slice(0, intent === 'local_service' ? 2 + (index % 2) : 2 + (index % 4)),
    intent,
  };
}

function localServiceFallback(idea: string): NameIdea[] {
  const words = cleanWords(idea);
  const location = extractLocation(words);
  const region = extractRegion(words);
  const service = extractService(words);
  const related = service === 'Sprinkler' ? 'Irrigation' : service === 'Irrigation' ? 'Sprinkler' : 'Home';
  const place = location || region || 'Local';
  const broadPlace = region || location || 'Local';

  const candidates = [
    { name: `${place}${service}`, angle: `Best-match local SEO name: location + core service keyword.` },
    { name: `${place}${service}Co`, angle: `Clear, trustworthy local business naming style.` },
    { name: `${place}${related}Pros`, angle: `Service-forward name with a professional contractor feel.` },
    { name: `${place}Lawn${service}`, angle: `Good fit if the work connects to lawns, yards, or outdoor maintenance.` },
    { name: `${broadPlace}${service}Services`, angle: `Regional keyword name that makes the service obvious.` },
    { name: `${place}${service}Experts`, angle: `Trust-oriented name for homeowners comparing providers.` },
    { name: `${place}${related}Solutions`, angle: `Slightly broader name if you may expand beyond one service.` },
    { name: `${place}Yard${service}`, angle: `Friendly residential-service positioning.` },
    { name: `${broadPlace}${related}Co`, angle: `Regional brand name with room for more services.` },
    { name: `${place}OutdoorServices`, angle: `Broader option for landscaping, sprinkler, and yard-care expansion.` },
    { name: `${place}${service}Repair`, angle: `High-intent option for emergency or maintenance searches.` },
    { name: `${place}${service}Install`, angle: `Conversion-focused option for installation demand.` },
  ];

  return dedupe(candidates.map((c, i) => makeIdea(c.name, c.angle, i, 'local_service')));
}

function generalFallback(idea: string, intent: Intent): NameIdea[] {
  const keywords = getCoreKeywords(idea).map(titleCase);
  const primary = keywords[0] || 'Launch';
  const secondary = keywords[1] || 'Wise';
  const third = keywords[2] || 'Hub';

  const candidatesByIntent: Record<Intent, { name: string; angle: string }[]> = {
    local_service: [],
    saas: [
      { name: `${primary}AI`, angle: `Direct SaaS-style name that communicates the product category quickly.` },
      { name: `${primary}Flow`, angle: `Workflow-oriented name for a tool that saves time.` },
      { name: `${secondary}Pilot`, angle: `Assistant-style naming for automation or productivity.` },
      { name: `Clear${primary}`, angle: `Trustworthy and easy to remember.` },
      { name: `${primary}Forge`, angle: `Builder-focused positioning for a practical software tool.` },
      { name: `${primary}HQ`, angle: `Simple hub-style name for dashboards or operating systems.` },
      { name: `Nimble${secondary}`, angle: `Speed-focused brand angle.` },
      { name: `${primary}${third}`, angle: `Keyword-rich name that stays brandable.` },
      { name: `Avora`, angle: `Short invented brand if you want flexibility beyond the first niche.` },
      { name: `Kivo`, angle: `Compact invented name, useful for a broad software product.` },
      { name: `${secondary}Scout`, angle: `Discovery-oriented name for recommendation, search, or analysis tools.` },
      { name: `Bright${primary}`, angle: `Friendly, polished startup-style name.` },
    ],
    ecommerce: [
      { name: `${primary}Shop`, angle: `Clear ecommerce name that explains the buying destination.` },
      { name: `${primary}Market`, angle: `Marketplace-style name with broad category room.` },
      { name: `${secondary}${primary}`, angle: `Brandable two-keyword ecommerce option.` },
      { name: `${primary}Goods`, angle: `Simple, product-friendly naming style.` },
      { name: `True${primary}`, angle: `Trust-oriented retail brand feel.` },
      { name: `${primary}Supply`, angle: `Good for practical goods, accessories, or repeat purchases.` },
      { name: `Fresh${primary}`, angle: `Modern consumer-brand sound.` },
      { name: `${primary}Collective`, angle: `Lifestyle-oriented ecommerce positioning.` },
    ],
    creator: [
      { name: `${primary}Letter`, angle: `Good for a newsletter or editorial brand.` },
      { name: `${primary}Daily`, angle: `Repeat-visit creator/media positioning.` },
      { name: `${primary}Guide`, angle: `Useful for education, courses, and content brands.` },
      { name: `${secondary}Studio`, angle: `Polished creator-brand naming style.` },
      { name: `${primary}Club`, angle: `Community-oriented brand with membership potential.` },
      { name: `${primary}Signal`, angle: `Strong for trend, insight, or analysis content.` },
      { name: `The${primary}Brief`, angle: `Editorial feel for newsletters and podcasts.` },
      { name: `${primary}Path`, angle: `Coaching or education-friendly positioning.` },
    ],
    affiliate_content: [
      { name: `${primary}Compare`, angle: `Clear comparison-site name with commercial intent.` },
      { name: `${primary}Ranked`, angle: `Good for review and ranking content.` },
      { name: `${primary}Deals`, angle: `High-intent affiliate naming style.` },
      { name: `${primary}Guide`, angle: `Search-friendly name for educational buying guides.` },
      { name: `Best${primary}`, angle: `Direct SEO angle for commercial searches.` },
      { name: `${primary}Scout`, angle: `Discovery-oriented affiliate/recommendation brand.` },
      { name: `${secondary}Reviews`, angle: `Trust-forward review site name.` },
      { name: `${primary}Advisor`, angle: `Professional recommendation positioning.` },
    ],
    general: [
      { name: `${primary}${secondary}`, angle: `Keyword-rich but still brandable.` },
      { name: `${primary}Works`, angle: `Practical, business-friendly naming style.` },
      { name: `Clear${primary}`, angle: `Simple, trustworthy, and easy to understand.` },
      { name: `${primary}Base`, angle: `Hub-style name with room to grow.` },
      { name: `${secondary}Path`, angle: `Action-oriented name for a useful service.` },
      { name: `Bright${primary}`, angle: `Friendly modern business name.` },
      { name: `${primary}Wise`, angle: `Trust-oriented option for advice, tools, or education.` },
      { name: `${primary}Direct`, angle: `Conversion-oriented and clear.` },
    ],
  };

  return dedupe((candidatesByIntent[intent] || candidatesByIntent.general).map((c, i) => makeIdea(c.name, c.angle, i, intent))).slice(0, 12);
}

function dedupe(items: NameIdea[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (item.name.length < 4) return false;
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildFallbackIdeas(idea: string): NameIdea[] {
  const intent = detectIntent(idea);
  if (intent === 'local_service') return localServiceFallback(idea);
  return generalFallback(idea, intent);
}

function promptForIntent(idea: string, intent: Intent) {
  if (intent === 'local_service') {
    return `Generate 12 realistic domain-friendly names for this LOCAL SERVICE business: "${idea}".

Critical rules:
- Extract the location if provided and use it in most names.
- Extract the core service keyword and use it in most names.
- Prioritize clarity, local SEO, and homeowner trust over abstract creativity.
- Use names that sound like real local businesses, not SaaS startups.
- Good style examples: Kamloops Sprinkler, Kamloops Irrigation Pros, BC Sprinkler Services, Kamloops Lawn Sprinkler.
- Avoid vague words like Pilot, Nova, Forge, Labs, Base unless they truly fit.
- Avoid hyphens, numbers, trademarked brands, and names longer than 28 characters.
- Return JSON only: {"ideas":[{"name":"Name","angle":"one sentence explaining why it fits","score":94}]}`;
  }

  const styleByIntent: Record<Intent, string> = {
    local_service: '',
    saas: 'modern SaaS/product names with some clear keyword-rich options',
    ecommerce: 'clear ecommerce/store names with commercial intent',
    creator: 'newsletter, podcast, creator, community, or education brand names',
    affiliate_content: 'comparison, reviews, buying-guide, deal, and recommendation site names',
    general: 'a balanced mix of clear keyword names and brandable names',
  };

  return `Generate 12 unique, domain-friendly business names for this idea: "${idea}".

Naming style: ${styleByIntent[intent]}.

Rules:
- Do not make every name use the same suffix.
- Do not force the word Stack.
- Match the user's business type. If it is local/service-based, use location + service keywords.
- Include a mix of clear keyword names and brandable names.
- Avoid hyphens, numbers, trademarked brands, and names longer than 28 characters.
- Each name should work as a domain.
- Return JSON only: {"ideas":[{"name":"Name","angle":"one sentence positioning angle","score":94}]}`;
}

async function buildOpenAIIdeas(idea: string): Promise<NameIdea[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const intent = detectIntent(idea);
  const prompt = promptForIntent(idea, intent);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: intent === 'local_service' ? 0.45 : 0.85,
      messages: [
        { role: 'system', content: 'You are an expert naming strategist. You adapt naming style to the business category: local services need clear SEO names, SaaS needs brandable product names, ecommerce needs commercial clarity, and affiliate sites need search intent.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed?.ideas)) return null;

    return dedupe(parsed.ideas.map((item: any, index: number) => {
      const name = cleanName(String(item.name || ''));
      return {
        name,
        domain: domainify(name),
        angle: String(item.angle || 'Strong name with a clear launch angle.').slice(0, 180),
        score: Number.isFinite(Number(item.score)) ? Math.min(99, Math.max(60, Number(item.score))) : scoreIdea(name, intent, index),
        tlds: ['.com', '.co', '.io', '.app', '.ai'].slice(0, intent === 'local_service' ? 2 + (index % 2) : 2 + (index % 4)),
        intent,
      };
    })).slice(0, 12);
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
  const intent = detectIntent(idea);

  return NextResponse.json({ ideas, intent });
}
