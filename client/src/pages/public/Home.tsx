import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, Boxes, Route, Tag, ShieldCheck, Zap, Truck, Sparkles, Store,
} from 'lucide-react';
import { productApi } from '../../services/api';
import { ProductCard } from '../../components/common/ProductCard';
import { Reveal } from '../../components/ui/Reveal';
import { buttonClasses } from '../../components/ui/Button';
import heroImg from '../../assets/hero.png';

const stats = [
  { value: '16+', label: 'Products' },
  { value: '3', label: 'Boutiques' },
  { value: '2-day', label: 'Max delivery' },
  { value: '99.9%', label: 'Order accuracy' },
];

const features = [
  { icon: Boxes, title: 'Distributed Inventory', desc: 'A tiered stock system from the central warehouse down to every boutique, minimizing delivery times.' },
  { icon: Route, title: 'Smart Routing', desc: 'Local match means immediate delivery; remote match is fulfilled within an estimated two days.' },
  { icon: Tag, title: 'Dynamic Pricing', desc: 'Category discounts and stealth, urgency-driven constraints — all recorded in a full audit trail.' },
  { icon: ShieldCheck, title: 'Role-Based Control', desc: 'Admin, managers, workers and clients each operate within a precise permission boundary.' },
];

const steps = [
  { icon: Store, title: 'Browse the storefront', desc: 'Explore the catalog across categories with live stock per boutique.' },
  { icon: Zap, title: 'Place your order', desc: 'A strict pipeline verifies every order: pending → verifying → accepted.' },
  { icon: Truck, title: 'Smart fulfilment', desc: 'The nearest boutique ships your order, or the central warehouse steps in.' },
];

export default function Home() {
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: productApi.list });
  const featured = products?.slice(0, 8) ?? [];

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden spotlight">
        <div className="pointer-events-none absolute inset-0 bg-grid-light dark:bg-grid-dark [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="label-mono inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
              <Sparkles size={13} /> Distributed Commerce OS
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] sm:text-6xl">
              Operational control,<br />
              from warehouse to <span className="text-gradient">boutique</span>.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Al Amine blends a sophisticated storefront with a powerful internal suite — managing
              the full lifecycle of a product with flexible pricing and smart logistics.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/catalog" className={buttonClasses('primary', 'lg')}>
                Browse Catalog <ArrowRight size={18} />
              </Link>
              <Link to="/login" className={buttonClasses('outline', 'lg')}>
                Staff Login
              </Link>
            </div>
            <div className="mt-10 flex gap-8">
              {stats.slice(0, 3).map((s) => (
                <div key={s.label}>
                  <p className="font-serif text-2xl font-bold text-content">{s.value}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative animate-scale-in">
            <div className="absolute -inset-6 rounded-[2rem] bg-primary/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-line bg-surface-2 shadow-card-dark">
              <img
                src={heroImg}
                alt="Al Amine commerce platform"
                className="aspect-[5/4] w-full object-cover"
                onError={(e) => { (e.currentTarget.style.display = 'none'); }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            {/* Floating cards */}
            <div className="absolute -left-4 top-8 animate-float rounded-2xl border border-line bg-surface/90 p-3 shadow-card backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary"><Zap size={16} /></span>
                <div>
                  <p className="text-xs font-semibold text-content">Local Match</p>
                  <p className="text-[10px] text-muted">Immediate delivery</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 bottom-10 animate-float rounded-2xl border border-line bg-surface/90 p-3 shadow-card backdrop-blur-md" style={{ animationDelay: '1.5s' }}>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary"><Tag size={16} /></span>
                <div>
                  <p className="text-xs font-semibold text-content">Revenue control</p>
                  <p className="text-[10px] text-muted">Audited pricing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────────── */}
      <section className="border-y border-line bg-surface/40">
        <div className="container-page grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="text-center">
              <p className="font-serif text-3xl font-bold text-gradient">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="container-page py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="label-mono">Why Al Amine</span>
          <h2 className="mt-3 text-4xl font-bold">A platform built for precision</h2>
          <p className="mt-4 text-muted">Every layer is engineered for professional operational control.</p>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 90}>
              <div className="group h-full rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-contrast">
                  <f.icon size={22} />
                </span>
                <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Featured products ──────────────────────────────── */}
      {featured.length > 0 && (
        <section className="container-page py-12">
          <div className="flex items-end justify-between">
            <Reveal>
              <span className="label-mono">Fresh picks</span>
              <h2 className="mt-3 text-4xl font-bold">Best sellers</h2>
            </Reveal>
            <Link to="/catalog" className="hidden items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all sm:flex">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── How it works ───────────────────────────────────── */}
      <section className="container-page py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="label-mono">The flow</span>
          <h2 className="mt-3 text-4xl font-bold">How it works</h2>
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 110} className="relative text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                <s.icon size={26} />
              </span>
              <span className="mt-4 block font-mono text-xs text-muted">STEP {i + 1}</span>
              <h3 className="mt-1 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA band ───────────────────────────────────────── */}
      <section className="container-page pb-24">
        <Reveal className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-surface to-surface p-10 text-center sm:p-16">
          <div className="absolute inset-0 spotlight" />
          <div className="relative">
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to explore the catalog?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Discover products distributed across every boutique, with live stock and smart delivery.
            </p>
            <Link to="/catalog" className={buttonClasses('primary', 'lg', 'mt-8')}>
              Start shopping <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
