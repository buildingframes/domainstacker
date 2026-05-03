'use client';
import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, Layers3, Sparkles, ShieldCheck, Star, Zap } from 'lucide-react';
import { Footer } from '@/components/Footer';

type Idea = { name:string; domain:string; angle:string; score:number; tlds:string[] };

const stacks = [
  { name:'Namecheap', use:'Domain registration', url:'https://www.namecheap.com/?aff=YOUR_AFFILIATE_ID' },
  { name:'Hostinger', use:'Website hosting', url:'https://www.hostinger.com/?REFERRALCODE=YOUR_CODE' },
  { name:'Google Workspace', use:'Business email', url:'https://workspace.google.com/' },
  { name:'Canva', use:'Logo + starter graphics', url:'https://www.canva.com/' },
];

function fallbackIdeas(input:string): Idea[] {
  const clean = input.trim().toLowerCase().replace(/[^a-z0-9 ]/g,'').split(/\s+/).filter(Boolean).slice(0,4);
  const base = clean.length ? clean : ['launch','brand'];
  const seed = base.map(w => w[0]?.toUpperCase()+w.slice(1)).join('');
  const names = [`${seed}Stack`, `${seed}Pilot`, `${seed}Forge`, `${seed}Base`, `${seed}Kit`, `${seed}Flow`];
  return names.map((n,i)=>({ name:n, domain:`${n.toLowerCase()}.com`, angle:['Clear and practical','Founder-friendly','Modern SaaS feel','Strong utility vibe','Simple and memorable','Action-oriented'][i], score: 92-i*3, tlds:['.com','.co','.io','.app'].slice(0, 2+(i%3)) }));
}

export default function Home(){
  const [idea,setIdea]=useState('AI bookkeeping assistant for freelancers');
  const [loading,setLoading]=useState(false);
  const [ideas,setIdeas]=useState<Idea[]>(fallbackIdeas(idea));
  const [email,setEmail]=useState('');
  const tldSummary = useMemo(()=>ideas.flatMap(i=>i.tlds).slice(0,8).join('  '),[ideas]);

  async function generate(){
    setLoading(true);
    try{
      const res = await fetch('/api/name-ideas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idea})});
      const data = await res.json();
      setIdeas(data.ideas?.length ? data.ideas : fallbackIdeas(idea));
    }catch{ setIdeas(fallbackIdeas(idea)); }
    finally{ setLoading(false); }
  }

  return <main className="min-h-screen bg-[#f8fbfc]">
    <section className="gradient-grid border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="/" className="flex items-center gap-3 font-bold tracking-tight" aria-label="DomainStacker home"><img src="/assets/domainstacker-mark.svg" alt="" className="h-10 w-10"/><span className="text-lg">Domain<span className="text-cyanframe">Stacker</span></span></a>
        <div className="hidden items-center gap-6 text-sm text-slate-600 md:flex"><a href="#how">How it works</a><a href="#stack">Launch stack</a><a href="#results">Try it</a></div>
      </nav>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.05fr_.95fr] md:py-24">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm text-slate-700 shadow-sm"><Sparkles size={16}/> Idea to launch-ready in minutes</div>
          <h1 className="text-5xl font-black leading-tight tracking-tight md:text-6xl">Find the domain, brand angle, and starter stack for your next idea.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">DomainStacker removes the tedious part of starting: brainstorming names, checking fit, and figuring out what tools to buy next.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href="#results" className="inline-flex items-center justify-center rounded-2xl bg-ink px-6 py-4 font-semibold text-white shadow-lg shadow-slate-300">Generate ideas <ArrowRight className="ml-2" size={18}/></a><a href="#stack" className="inline-flex items-center justify-center rounded-2xl border bg-white px-6 py-4 font-semibold">See launch stack</a></div>
          <p className="mt-4 text-xs text-slate-500">Disclosure: recommendations may include affiliate links. You pay the same or similar price; we may earn a commission.</p>
        </div>
        <div className="relative">
          <div className="absolute -right-4 -top-4 hidden rounded-2xl bg-white px-4 py-3 text-sm font-bold text-ink shadow-xl md:flex md:items-center md:gap-2"><Layers3 size={18} className="text-cyanframe"/> Launch stack ready</div>
          <img src="/assets/hero-stack.svg" alt="DomainStacker product preview showing idea input, domain suggestions, and fit scores" className="w-full rounded-[2rem] border bg-white shadow-2xl shadow-slate-200" />
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs font-semibold text-slate-600">
            <div className="rounded-2xl border bg-white p-3">Name ideas</div>
            <div className="rounded-2xl border bg-white p-3">Domain fit</div>
            <div className="rounded-2xl border bg-white p-3">Launch tools</div>
          </div>
        </div>
      </div>
    </section>

    <section id="results" className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-8 md:grid-cols-[.9fr_1.1fr]">
        <div><h2 className="text-3xl font-black">Try the generator</h2><p className="mt-3 text-slate-600">Enter any business, product, app, newsletter, or side-project idea. The MVP includes simulated domain results; connect a domain availability API when ready.</p><textarea value={idea} onChange={e=>setIdea(e.target.value)} className="mt-6 h-32 w-full rounded-2xl border p-4 shadow-sm outline-none focus:ring-2 focus:ring-cyanframe"/><button onClick={generate} disabled={loading} className="mt-4 w-full rounded-2xl bg-cyanframe px-6 py-4 font-bold text-white shadow-lg disabled:opacity-60">{loading?'Generating...':'Generate name stack'}</button><p className="mt-3 text-xs text-slate-500">Available TLDs preview: {tldSummary}</p></div>
        <div className="grid gap-4">
          {ideas.map(x=><div key={x.name} className="rounded-3xl border bg-white p-5 shadow-sm"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-xl font-bold">{x.name}</h3><p className="text-slate-500">{x.domain} · {x.angle}</p></div><a href={`https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(x.domain)}`} target="_blank" className="rounded-xl bg-ink px-4 py-3 text-center text-sm font-semibold text-white">Check domain</a></div><div className="mt-3 flex flex-wrap gap-2">{x.tlds.map(t=><span key={t} className="rounded-full bg-slate-100 px-3 py-1 text-sm">{t}</span>)}</div></div>)}
        </div>
      </div>
    </section>

    <section id="how" className="bg-white py-16"><div className="mx-auto grid max-w-6xl gap-5 px-6 md:grid-cols-3">{[{icon:Zap,title:'Generate',text:'Turn a raw idea into brandable names and positioning angles.'},{icon:Clock3,title:'Shortlist',text:'Compare domain style, memorability, and launch fit quickly.'},{icon:CheckCircle2,title:'Launch',text:'Move from name to domain, hosting, email, and design tools.'}].map(({icon:Icon,title,text})=><div key={title} className="rounded-3xl border p-6"><Icon className="text-cyanframe"/><h3 className="mt-4 text-xl font-bold">{title}</h3><p className="mt-2 text-slate-600">{text}</p></div>)}</div></section>

    <section id="stack" className="mx-auto max-w-6xl px-6 py-16"><div className="mb-8 flex items-end justify-between"><div><h2 className="text-3xl font-black">Recommended launch stack</h2><p className="mt-2 text-slate-600">Replace placeholder URLs with your approved affiliate links.</p></div><ShieldCheck className="hidden text-cyanframe md:block"/></div><div className="grid gap-4 md:grid-cols-4">{stacks.map(s=><a key={s.name} href={s.url} target="_blank" className="rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><Star className="text-cyanframe"/><h3 className="mt-4 font-bold">{s.name}</h3><p className="mt-1 text-sm text-slate-500">{s.use}</p></a>)}</div></section>

    <section className="mx-auto max-w-3xl px-6 pb-16"><div className="rounded-[2rem] bg-ink p-8 text-center text-white"><h2 className="text-3xl font-black">Save your launch stack</h2><p className="mt-3 text-white/70">Add email capture later with ConvertKit, Beehiiv, Mailchimp, or your own backend.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="min-h-12 flex-1 rounded-xl border-0 px-4 text-ink"/><button className="rounded-xl bg-cyanframe px-6 py-3 font-bold">Save results</button></div></div></section>
    <Footer />
  </main>
}
