'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe2,
  Layers3,
  Loader2,
  Sparkles,
  Star,
  UserCheck,
  XCircle,
  Zap,
} from 'lucide-react';
import { Footer } from '../components/Footer';

type Idea = { name: string; domain: string; angle: string; score: number; tlds: string[] };
type DomainResult = { domain: string; available: boolean | null; price?: number | null; currency?: string | null; source: 'godaddy' | 'simulated'; reason?: string };
type SocialResult = { handle: string; platform: 'x' | 'instagram' | 'tiktok' | 'youtube'; url: string; available: boolean | null; source: 'live' | 'heuristic'; reason?: string };

const stacks = [
  {
    name: 'Namecheap',
    use: 'Buy the domain',
    detail: 'Lock in the best available name before someone else does.',
    url: 'https://www.namecheap.com/?aff=YOUR_AFFILIATE_ID',
    cta: 'Search on Namecheap',
  },
  {
    name: 'Hostinger',
    use: 'Launch the website',
    detail: 'Affordable hosting for a landing page, blog, or small business site.',
    url: 'https://www.hostinger.com/?REFERRALCODE=YOUR_CODE',
    cta: 'View hosting plans',
  },
  {
    name: 'Google Workspace',
    use: 'Set up business email',
    detail: 'Create a professional inbox like hello@yourdomain.com.',
    url: 'https://workspace.google.com/',
    cta: 'Set up email',
  },
  {
    name: 'Canva',
    use: 'Create starter branding',
    detail: 'Make a quick logo, social banner, and launch graphics.',
    url: 'https://www.canva.com/',
    cta: 'Create brand assets',
  },
];

function fallbackIdeas(input: string): Idea[] {
  const words = input.trim().toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  const localServices = ['sprinkler', 'irrigation', 'plumbing', 'roofing', 'cleaning', 'lawn', 'landscaping', 'moving', 'detailing', 'repair'];
  const locations = ['kamloops', 'vancouver', 'victoria', 'kelowna', 'calgary', 'toronto', 'seattle', 'austin'];
  const service = words.find((w) => localServices.includes(w));
  const location = words.find((w) => locations.includes(w)) || words[0] || 'local';

  let names: string[];
  if (service) {
    const loc = location[0].toUpperCase() + location.slice(1);
    const svc = service[0].toUpperCase() + service.slice(1);
    const related = service === 'sprinkler' ? 'Irrigation' : service === 'irrigation' ? 'Sprinkler' : 'Home';
    names = [`${loc}${svc}`, `${loc}${svc}Co`, `${loc}${related}Pros`, `${loc}${svc}Services`, `${loc}${svc}Experts`, `${loc}${related}Solutions`];
  } else {
    const clean = words.filter((w) => w.length > 2).slice(0, 3);
    const base = clean.length ? clean : ['launch', 'brand'];
    const seed = base.map((w) => w[0]?.toUpperCase() + w.slice(1)).join('');
    names = [`${seed}HQ`, `${seed}Flow`, `Clear${seed}`, `${seed}Works`, `${seed}Guide`, `${seed}Direct`];
  }

  return names.map((n, i) => ({
    name: n,
    domain: `${n.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    angle: service ? ['Best-match local SEO name', 'Clear local business style', 'Professional service positioning', 'Search-friendly service name', 'Trust-oriented local name', 'Broader expansion option'][i] : ['Clear and practical', 'Workflow-oriented', 'Trustworthy', 'Business-friendly', 'Search-friendly', 'Conversion-oriented'][i],
    score: 96 - i * 3,
    tlds: ['.com', '.co', '.io', '.app', '.ai'].slice(0, 2 + (i % 3)),
  }));
}

function domainBuyUrl(domain: string) {
  return `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`;
}

function statusBadge(available: boolean | null) {
  if (available === true) return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 size={14} /> Available</span>;
  if (available === false) return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700"><XCircle size={14} /> Taken</span>;
  return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">Verify</span>;
}

function LaunchStackMini() {
  return <div className="overflow-hidden rounded-[2rem] border-2 border-cyanframe/40 bg-white shadow-xl shadow-slate-200">
    <div className="bg-ink px-5 py-4 text-white">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-cyanframe"><Layers3 size={14} /> Recommended launch stack</div>
      <h3 className="mt-2 text-2xl font-black">Secure the name, then launch fast.</h3>
      <p className="mt-1 text-sm text-white/70">These are the next buying steps after you find a domain you like.</p>
    </div>
    <div className="grid gap-3 p-4 sm:grid-cols-2">
      {stacks.map((s, index) => <a key={s.name} href={s.url} target="_blank" className="group rounded-2xl border bg-slate-50 p-4 transition hover:border-cyanframe hover:bg-white hover:shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyanframe/10 text-sm font-black text-cyanframe">{index + 1}</div>
          <ExternalLink size={14} className="text-slate-400 group-hover:text-cyanframe" />
        </div>
        <h4 className="mt-3 font-black">{s.name}</h4>
        <p className="text-sm font-bold text-slate-700">{s.use}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{s.detail}</p>
        <div className="mt-3 text-sm font-black text-ink">{s.cta} →</div>
      </a>)}
    </div>
    <div className="border-t bg-cyanframe/5 px-5 py-3 text-xs leading-5 text-slate-600">Affiliate disclosure: some links may earn us a commission. Replace placeholder URLs with approved affiliate tracking links.</div>
  </div>;
}

export default function Home() {
  const [idea, setIdea] = useState('AI bookkeeping assistant for freelancers');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>(fallbackIdeas(idea));
  const [domains, setDomains] = useState<DomainResult[]>([]);
  const [socials, setSocials] = useState<SocialResult[]>([]);
  const [email, setEmail] = useState('');

  const tldSummary = useMemo(() => ideas.flatMap((i) => i.tlds).slice(0, 8).join('  '), [ideas]);
  const domainMap = useMemo(() => new Map(domains.map((d) => [d.domain, d])), [domains]);
  const socialMap = useMemo(() => {
    const grouped = new Map<string, SocialResult[]>();
    for (const item of socials) grouped.set(item.handle, [...(grouped.get(item.handle) || []), item]);
    return grouped;
  }, [socials]);

  async function checkAvailability(nextIdeas: Idea[]) {
    setChecking(true);
    try {
      const names = nextIdeas.map((x) => x.name);
      const [domainResponse, socialResponse] = await Promise.all([
        fetch('/api/domain-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ names, tlds: ['.com', '.co', '.io', '.app', '.ai'] }) }),
        fetch('/api/social-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ names }) }),
      ]);
      const domainData = await domainResponse.json();
      const socialData = await socialResponse.json();
      setDomains(Array.isArray(domainData.results) ? domainData.results : []);
      setSocials(Array.isArray(socialData.results) ? socialData.results : []);
    } catch {
      setDomains([]);
      setSocials([]);
    } finally {
      setChecking(false);
    }
  }

  async function generate() {
    setLoading(true);
    setDomains([]);
    setSocials([]);
    try {
      const res = await fetch('/api/name-ideas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idea }) });
      const data = await res.json();
      const nextIdeas = data.ideas?.length ? data.ideas : fallbackIdeas(idea);
      setIdeas(nextIdeas);
      await checkAvailability(nextIdeas);
    } catch {
      const nextIdeas = fallbackIdeas(idea);
      setIdeas(nextIdeas);
      await checkAvailability(nextIdeas);
    } finally {
      setLoading(false);
    }
  }

  return <main className="min-h-screen bg-[#f8fbfc]">
    <section className="gradient-grid border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="/" className="flex items-center gap-3 font-bold tracking-tight" aria-label="DomainStacker home"><img src="/assets/domainstacker-mark.svg" alt="" className="h-10 w-10" /><span className="text-lg">Domain<span className="text-cyanframe">Stacker</span></span></a>
        <div className="hidden items-center gap-6 text-sm text-slate-600 md:flex"><a href="#how">How it works</a><a href="#stack">Launch stack</a><a href="#results">Try it</a></div>
      </nav>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.05fr_.95fr] md:py-24">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm text-slate-700 shadow-sm"><Sparkles size={16} /> Idea to launch-ready in minutes</div>
          <h1 className="text-5xl font-black leading-tight tracking-tight md:text-6xl">Find the domain, brand angle, and starter stack for your next idea.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">DomainStacker removes the tedious part of starting: brainstorming names, checking domain fit, checking social handles, and figuring out what tools to buy next.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href="#results" className="inline-flex items-center justify-center rounded-2xl bg-ink px-6 py-4 font-semibold text-white shadow-lg shadow-slate-300">Generate ideas <ArrowRight className="ml-2" size={18} /></a><a href="#stack" className="inline-flex items-center justify-center rounded-2xl border bg-white px-6 py-4 font-semibold">See launch stack</a></div>
          <p className="mt-4 text-xs text-slate-500">Disclosure: recommendations may include affiliate links. You pay the same or similar price; we may earn a commission.</p>
        </div>
        <div className="relative">
          <div className="absolute -right-4 -top-4 hidden rounded-2xl bg-white px-4 py-3 text-sm font-bold text-ink shadow-xl md:flex md:items-center md:gap-2"><Layers3 size={18} className="text-cyanframe" /> Launch stack ready</div>
          <img src="/assets/hero-stack.svg" alt="DomainStacker product preview showing idea input, domain suggestions, and fit scores" className="w-full rounded-[2rem] border bg-white shadow-2xl shadow-slate-200" />
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs font-semibold text-slate-600"><div className="rounded-2xl border bg-white p-3">Live domains</div><div className="rounded-2xl border bg-white p-3">Social handles</div><div className="rounded-2xl border bg-white p-3">Launch tools</div></div>
        </div>
      </div>
    </section>

    <section id="results" className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-8 md:grid-cols-[.9fr_1.1fr]">
        <div><h2 className="text-3xl font-black">Try the generator</h2><p className="mt-3 text-slate-600">Enter any business, product, app, newsletter, or side-project idea. The generator now adapts to the intent: local services get location + service keyword names, SaaS gets brandable product names, and affiliate sites get search-friendly names.</p><textarea value={idea} onChange={(e) => setIdea(e.target.value)} className="mt-6 h-32 w-full rounded-2xl border p-4 shadow-sm outline-none focus:ring-2 focus:ring-cyanframe" /><button onClick={generate} disabled={loading || checking} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyanframe px-6 py-4 font-bold text-white shadow-lg disabled:opacity-60">{loading || checking ? <Loader2 className="animate-spin" size={18} /> : null}{loading ? 'Generating...' : checking ? 'Checking availability...' : 'Generate names'}</button><p className="mt-3 text-xs text-slate-500">TLDs checked: {tldSummary || '.com .co .io .app .ai'}</p>
          <div className="mt-6 rounded-3xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-black text-ink"><Layers3 size={16} className="text-cyanframe" /> Launch stack after naming</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">After choosing a name, the highest-value next clicks are domain registration, hosting, business email, and starter brand assets.</p>
            <a href="#stack" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-bold text-white">View stack links <ArrowRight size={15} /></a>
          </div>
        </div>
        <div className="grid gap-4">
          {ideas.map((x, index) => {
            const primaryDomain = domainMap.get(x.domain);
            const handle = x.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const handleResults = socialMap.get(handle) || [];
            const availableDomains = x.tlds.map((tld) => domainMap.get(`${handle}${tld}`)).filter(Boolean) as DomainResult[];
            return <div key={x.name}>
              <div className="rounded-3xl border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="text-xl font-bold">{x.name}</h3><p className="text-slate-500">{x.domain} · {x.angle}</p></div><a href={domainBuyUrl(x.domain)} target="_blank" className="rounded-xl bg-ink px-4 py-3 text-center text-sm font-semibold text-white">Buy / verify <ExternalLink className="ml-1 inline" size={14} /></a></div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-3"><div className="mb-2 flex items-center gap-2 text-sm font-bold"><Globe2 size={16} /> Domain availability</div><div className="flex flex-wrap gap-2">{availableDomains.length ? availableDomains.map((d) => <a key={d.domain} href={domainBuyUrl(d.domain)} target="_blank" className="rounded-full border bg-white px-3 py-1.5 text-sm hover:border-cyanframe"><span className="font-semibold">{d.domain}</span> {statusBadge(d.available)}</a>) : <span className="text-sm text-slate-500">Click generate to check domains.</span>}</div>{primaryDomain?.source === 'simulated' ? <p className="mt-2 text-xs text-slate-500">Demo availability shown. Add GoDaddy keys for live checks.</p> : null}</div>
              <div className="mt-3 rounded-2xl bg-slate-50 p-3"><div className="mb-2 flex items-center gap-2 text-sm font-bold"><UserCheck size={16} /> Social handles</div><div className="flex flex-wrap gap-2">{handleResults.length ? handleResults.map((s) => <a key={`${s.platform}-${s.handle}`} href={s.url} target="_blank" className="rounded-full border bg-white px-3 py-1.5 text-sm capitalize hover:border-cyanframe">{s.platform}: @{s.handle} {statusBadge(s.available)}</a>) : <span className="text-sm text-slate-500">Click generate to check handles.</span>}</div><p className="mt-2 text-xs text-slate-500">Always manually verify social handles before purchasing a domain.</p></div>
              </div>
              {index === 0 ? <div className="mt-5"><LaunchStackMini /></div> : null}
            </div>;
          })}

          <div className="overflow-hidden rounded-[2rem] border-2 border-cyanframe/30 bg-white shadow-2xl shadow-slate-200">
            <div className="bg-ink px-6 py-5 text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyanframe">
                <Layers3 size={14} /> Recommended next step
              </div>
              <h2 className="mt-3 text-3xl font-black">Build your launch stack</h2>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Once you find a name you like, these are the practical tools most founders need next: domain, website, email, and basic brand assets.
              </p>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {stacks.map((s, index) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  className="group rounded-3xl border bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-cyanframe hover:bg-white hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyanframe/10 font-black text-cyanframe">
                      {index + 1}
                    </div>
                    <ExternalLink size={16} className="text-slate-400 transition group-hover:text-cyanframe" />
                  </div>
                  <h3 className="mt-4 text-lg font-black">{s.name}</h3>
                  <p className="mt-1 text-sm font-bold text-slate-700">{s.use}</p>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{s.detail}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-black text-ink">
                    {s.cta} <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                  </div>
                </a>
              ))}
            </div>
            <div className="border-t bg-cyanframe/5 px-6 py-4 text-xs leading-5 text-slate-600">
              Disclosure: some recommendations may use affiliate links. Replace the placeholder URLs with your approved tracking links before running ads.
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="how" className="bg-white py-16"><div className="mx-auto grid max-w-6xl gap-5 px-6 md:grid-cols-3">{[{ icon: Zap, title: 'Generate', text: 'Turn a raw idea into brandable names and positioning angles.' }, { icon: Clock3, title: 'Check', text: 'Compare domain availability and matching social handles quickly.' }, { icon: CheckCircle2, title: 'Launch', text: 'Move from name to domain, hosting, email, and design tools.' }].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-3xl border p-6"><Icon className="text-cyanframe" /><h3 className="mt-4 text-xl font-bold">{title}</h3><p className="mt-2 text-slate-600">{text}</p></div>)}</div></section>

    <section id="stack" className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-[2rem] border bg-white p-8 shadow-sm md:flex md:items-center md:justify-between md:gap-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyanframe/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-cyanframe"><Star size={14} /> Monetized launch flow</div>
          <h2 className="text-3xl font-black">The stack is the conversion path.</h2>
          <p className="mt-3 max-w-2xl text-slate-600">DomainStacker is designed so users do not just browse names — they move naturally into buying a domain, launching a site, setting up email, and creating starter brand assets.</p>
        </div>
        <a href="#results" className="mt-6 inline-flex shrink-0 items-center justify-center rounded-2xl bg-ink px-6 py-4 font-bold text-white md:mt-0">Try the full flow <ArrowRight className="ml-2" size={18} /></a>
      </div>
    </section>

    <section className="mx-auto max-w-3xl px-6 pb-16"><div className="rounded-[2rem] bg-ink p-8 text-center text-white"><h2 className="text-3xl font-black">Save your launch stack</h2><p className="mt-3 text-white/70">Add email capture later with ConvertKit, Beehiiv, Mailchimp, or your own backend.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="min-h-12 flex-1 rounded-xl border-0 px-4 text-ink" /><button className="rounded-xl bg-cyanframe px-6 py-3 font-bold">Save results</button></div></div></section>
    <Footer />
  </main>;
}
