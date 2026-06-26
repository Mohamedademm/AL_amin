import { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Package,
  ShoppingBag,
  Truck,
  ClipboardCheck,
  Sparkles,
  Clock,
  Star,
  ChevronRight,
  Heart,
  TrendingUp,
  Quote,
  ShoppingCart,
  Store,
} from "lucide-react";
import { productApi, categoryApi } from "../../services/api";
import { ProductCard } from "../../components/common/ProductCard";
import { ProductCardSkeleton } from "../../components/ui/Skeleton";
import { Reveal } from "../../components/ui/Reveal";
import { effectivePrice } from "../../utils/format";

/* ─── Marquee animation ───────────────────────────────────── */
const promoItems = [
  "Free shipping on cleaning supplies over 100 TND",
  "New cleaning products added weekly",
  "Professional-grade detergents & tools",
  "2-day delivery to your doorstep",
  "Secure checkout guaranteed",
];

/* ─── Workflow steps ──────────────────────────────────────── */
const workflowSteps = [
  {
    icon: ShoppingBag,
    title: "Order",
    desc: "Browse our catalog and place your order.",
    color: "#972c83",
  },
  {
    icon: ClipboardCheck,
    title: "Confirm",
    desc: "Your order is reviewed and confirmed.",
    color: "#c035a8",
  },
  {
    icon: Truck,
    title: "Shipping",
    desc: "Your items are packed and shipped.",
    color: "#e066b0",
  },
  {
    icon: Package,
    title: "Delivery",
    desc: "Receive your order at your doorstep.",
    color: "#f58f8a",
  },
];

/* ─── Testimonials ────────────────────────────────────────── */
const testimonials = [
  {
    name: "Sarah M.",
    role: "Regular client",
    text: "My kitchen has never sparkled like this. The degreaser is a game changer!",
  },
  {
    name: "Ahmed K.",
    role: "Cleaning professional",
    text: "Bulk supplies at fair prices. Our team orders every month without fail.",
  },
  {
    name: "Leila R.",
    role: "Home owner",
    text: "Finally found a store with proper floor care products. Fast delivery too.",
  },
];

/* ─── Animated counter ────────────────────────────────────── */
function CountUp({
  to,
  suffix = "",
  className,
}: {
  to: number;
  suffix?: string;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (to === 0) return;
    const duration = 1500;
    const steps = 40;
    const increment = to / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= to) {
        setCount(to);
        clearInterval(timer);
      } else setCount(Math.round(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [to]);
  return (
    <span className={className}>
      {count}
      {suffix}
    </span>
  );
}

/* ─── Hero image grid item ─────────────────────────────────── */
function HeroGridItem({
  name,
  imageUrl,
  price,
  index,
}: {
  name: string;
  imageUrl?: string | null;
  price: number;
  index: number;
}) {
  return (
    <div
      className="group overflow-hidden rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-lg"
      style={{
        background: "rgba(151,44,131,0.08)",
        animation: `float ${4 + index * 0.5}s ease-in-out infinite`,
        animationDelay: `${index * 0.3}s`,
        border: "1px solid rgba(151,44,131,0.15)",
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="flex aspect-square items-center justify-center">
          <Package size={28} style={{ color: "#972c83", opacity: 0.4 }} />
        </div>
      )}
      <div className="p-2.5">
        <p className="truncate text-xs font-medium text-[#EBEBEB]">{name}</p>
        <p className="font-mono text-[10px] text-[#f58f8a]">
          {price.toFixed(2)} TND
        </p>
      </div>
    </div>
  );
}

/* ─── Main homepage ───────────────────────────────────────── */
export default function Home() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.list,
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.list,
  });

  const sortedByNewest = useMemo(
    () =>
      [...(products ?? [])].sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
      ),
    [products],
  );

  // Sort by discount descending for "trending" section
  const trending = useMemo(
    () =>
      [...(products ?? [])]
        .filter((p) => p.discountPercent)
        .sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0))
        .slice(0, 4),
    [products],
  );

  const newestProducts = sortedByNewest.slice(0, 4);
  const littleList = sortedByNewest.slice(4, 8);

  // Hero carousel index (cycles through promo text)
  const [promoIndex, setPromoIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setPromoIndex((i) => (i + 1) % promoItems.length),
      4000,
    );
    return () => clearInterval(t);
  }, []);

  // Category horizontal scroll
  const [catScroll, setCatScroll] = useState(0);
  const catRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (el) el.scrollLeft = catScroll;
    },
    [catScroll],
  );

  return (
    <div>
      {/* ── Floating promo marquee ──────────────────────────── */}
      <div
        className="relative overflow-hidden py-2.5 text-center text-xs font-medium"
        style={{
          background:
            "linear-gradient(90deg, #972c83, #c035a8, #e066b0, #f58f8a)",
          color: "#fff",
        }}
      >
        <div className="marquee-container">
          <div className="marquee-track">
            {[...Array(4)].map((_, i) => (
              <span
                key={i}
                className="mx-8 inline-flex items-center gap-2 whitespace-nowrap"
              >
                <Sparkles size={12} className="shrink-0" />
                {promoItems[promoIndex]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0a0a0b 0%, #1a0a18 50%, #0a0a0b 100%)",
        }}
      >
        {/* Animated gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full opacity-20 blur-[120px]"
            style={{ background: "#972c83", animationDuration: "6s" }}
          />
          <div
            className="absolute -bottom-32 -right-32 h-80 w-80 animate-pulse rounded-full opacity-20 blur-[100px]"
            style={{
              background: "#f58f8a",
              animationDuration: "8s",
              animationDelay: "1s",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-64 w-64 animate-pulse rounded-full opacity-10 blur-[80px]"
            style={{
              background: "#972c83",
              animationDuration: "10s",
              animationDelay: "2s",
            }}
          />
        </div>

        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-28">
          {/* Left: text */}
          <div className="animate-fade-up">
            <span
              className="inline-flex animate-pulse items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium"
              style={{
                background: "rgba(151,44,131,0.15)",
                color: "#f58f8a",
                border: "1px solid rgba(151,44,131,0.3)",
              }}
            >
              <Sparkles size={13} /> Professional Cleaning Supplies
            </span>
            <h1
              className="mt-6 text-5xl font-bold leading-[1.05] sm:text-6xl"
              style={{
                fontFamily: "Newsreader, Georgia, serif",
                letterSpacing: "-0.02em",
              }}
            >
              Clean smarter,
              <br />
              <span className="bg-gradient-to-r from-[#972c83] to-[#f58f8a] bg-clip-text text-transparent">
                live fresher
              </span>
            </h1>
            <p
              className="mt-6 max-w-lg text-lg leading-relaxed"
              style={{ color: "#a0a0a0" }}
            >
              Explore our curated range of cleaning essentials — from surface
              sprays to floor care, delivered with care.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/catalog"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-7 py-3.5 text-base font-medium text-white transition-all active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #972c83, #f58f8a)",
                }}
              >
                <span
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: "linear-gradient(135deg, #f58f8a, #972c83)",
                  }}
                />
                <span className="relative flex items-center gap-2">
                  Shop Cleaning{" "}
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </Link>
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center gap-2 rounded-xl border px-7 py-3.5 text-base font-medium transition-all duration-300 hover:scale-105 active:scale-[0.98]"
                style={{
                  borderColor: "rgba(245,143,138,0.3)",
                  color: "#f58f8a",
                }}
              >
                Browse All
              </Link>
            </div>

            {/* Hero stats */}
            <div className="mt-10 flex gap-8">
              {[
                {
                  value: products?.length ?? 0,
                  label: "Products",
                  icon: Package,
                },
                { value: 4, label: "Depots", icon: Store },
                { value: 2, label: "Day Delivery", icon: Truck },
              ].map((s) => (
                <div key={s.label} className="group/stat">
                  <p
                    className="flex items-center gap-1.5 text-2xl font-bold"
                    style={{
                      fontFamily: "Newsreader, Georgia, serif",
                      color: "#f58f8a",
                    }}
                  >
                    <s.icon
                      size={16}
                      className="opacity-0 transition-opacity duration-300 group-hover/stat:opacity-100"
                      style={{ color: "#972c83" }}
                    />
                    <CountUp to={s.value} />
                  </p>
                  <p className="text-xs" style={{ color: "#a0a0a0" }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: floating product grid */}
          <div className="relative animate-scale-in">
            <div
              className="absolute -inset-6 rounded-[2rem] blur-3xl"
              style={{ background: "rgba(151,44,131,0.2)" }}
            />
            <div
              className="relative overflow-hidden rounded-3xl border p-6"
              style={{
                borderColor: "rgba(151,44,131,0.2)",
                background: "rgba(19,19,22,0.8)",
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                {newestProducts.slice(0, 4).map((p, i) => (
                  <HeroGridItem
                    key={p.id}
                    name={p.name}
                    imageUrl={p.imageUrl}
                    price={effectivePrice(p)}
                    index={i}
                  />
                ))}
              </div>
              {/* Gloss overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  background:
                    "linear-gradient(135deg, transparent 40%, rgba(151,44,131,0.1) 50%, transparent 60%)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip (animated count-up) ─────────────────── */}
      <section
        className="border-y"
        style={{
          borderColor: "rgba(151,44,131,0.1)",
          background: "rgba(151,44,131,0.02)",
        }}
      >
        <div className="container-page grid grid-cols-2 gap-6 py-12 md:grid-cols-4">
          {[
            {
              value: products?.length ?? 0,
              label: "Products",
              color: "#972c83",
            },
            { value: 4, label: "Depots", color: "#c035a8" },
            { value: 2, label: "Days Delivery", color: "#e066b0" },
            {
              value: 100,
              label: "Happy Clients",
              suffix: "+",
              color: "#f58f8a",
            },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="text-center">
              <p
                className="font-serif text-3xl font-bold transition-all duration-500"
                style={{ color: s.color }}
              >
                <CountUp to={s.value} suffix={s.suffix ?? ""} />
              </p>
              <p className="mt-1 text-sm" style={{ color: "#a0a0a0" }}>
                {s.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Category quick-nav ──────────────────────────────── */}
      {categories && categories.length > 0 && (
        <section className="container-page py-16">
          <Reveal className="flex items-center justify-between">
            <div>
              <span
                className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em]"
                style={{ color: "#972c83" }}
              >
                <TrendingUp size={13} /> Browse by category
              </span>
              <h2
                className="mt-3 text-4xl font-bold"
                style={{ fontFamily: "Newsreader, Georgia, serif" }}
              >
                Shop by{" "}
                <span className="bg-gradient-to-r from-[#972c83] to-[#c035a8] bg-clip-text text-transparent">
                  category
                </span>
              </h2>
            </div>
          </Reveal>
          <div
            ref={catRef}
            className="mt-8 flex gap-3 overflow-x-auto pb-2 scrollbar-thin"
            style={{ scrollbarWidth: "thin" }}
            onScroll={(e) => setCatScroll(e.currentTarget.scrollLeft)}
          >
            <Link
              to="/catalog"
              className="group flex shrink-0 flex-col items-center gap-2 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ borderColor: "rgba(151,44,131,0.2)", minWidth: "120px" }}
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl transition-all duration-300 group-hover:scale-110"
                style={{
                  background: "linear-gradient(135deg, #972c83, #f58f8a)",
                  color: "#fff",
                }}
              >
                <Package size={22} />
              </span>
              <span className="text-sm font-medium text-[#EBEBEB]">All</span>
            </Link>
            {categories.map((c, i) => (
              <Link
                key={c.id}
                to={`/catalog?cat=${c.id}`}
                className="group flex shrink-0 flex-col items-center gap-2 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  borderColor: "rgba(151,44,131,0.2)",
                  minWidth: "120px",
                  animation: `float ${5 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-xl text-xl transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: "rgba(151,44,131,0.1)",
                    color: i % 2 === 0 ? "#972c83" : "#f58f8a",
                  }}
                >
                  {c.name[0]}
                </span>
                <span className="text-sm font-medium text-[#EBEBEB]">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Newest Products ─────────────────────────────────── */}
      <section className="container-page pb-16">
        <Reveal className="flex items-end justify-between">
          <div>
            <span
              className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em]"
              style={{ color: "#972c83" }}
            >
              <Clock size={13} /> Just arrived
            </span>
            <h2
              className="mt-3 text-4xl font-bold"
              style={{ fontFamily: "Newsreader, Georgia, serif" }}
            >
              Newest{" "}
              <span className="bg-gradient-to-r from-[#972c83] to-[#c035a8] bg-clip-text text-transparent">
                Supplies
              </span>
            </h2>
          </div>
          <Link
            to="/catalog"
            className="group hidden items-center gap-1 text-sm font-medium transition-all sm:flex"
            style={{ color: "#972c83" }}
          >
            View all{" "}
            <ChevronRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : newestProducts.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
        </div>
      </section>

      {/* ── Trending (discounted) ───────────────────────────── */}
      {trending.length > 0 && (
        <section
          className="py-16"
          style={{ background: "rgba(151,44,131,0.02)" }}
        >
          <div className="container-page">
            <Reveal className="flex items-end justify-between">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em]"
                  style={{ color: "#f58f8a" }}
                >
                  <TrendingUp size={13} /> Top deals
                </span>
                <h2
                  className="mt-3 text-4xl font-bold"
                  style={{ fontFamily: "Newsreader, Georgia, serif" }}
                >
                  Deals{" "}
                  <span className="bg-gradient-to-r from-[#c035a8] to-[#f58f8a] bg-clip-text text-transparent">
                    of the Week
                  </span>
                </h2>
              </div>
              <Link
                to="/catalog"
                className="group hidden items-center gap-1 text-sm font-medium transition-all sm:flex"
                style={{ color: "#f58f8a" }}
              >
                All deals{" "}
                <ChevronRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
              {trending.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <div className="group relative">
                    <span
                      className="absolute -right-2 -top-2 z-10 inline-flex animate-pulse items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold text-white shadow-lg"
                      style={{
                        background: "linear-gradient(135deg, #f58f8a, #972c83)",
                      }}
                    >
                      <Heart size={10} fill="#fff" /> {p.discountPercent}% OFF
                    </span>
                    <ProductCard product={p} />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Picks ──────────────────────────────────── */}
      {littleList.length > 0 && (
        <section className="container-page py-16">
          <Reveal className="flex items-end justify-between">
            <div>
              <span
                className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em]"
                style={{ color: "#972c83" }}
              >
                <Sparkles size={13} /> Also available
              </span>
              <h2
                className="mt-3 text-4xl font-bold"
                style={{ fontFamily: "Newsreader, Georgia, serif" }}
              >
                More{" "}
                <span className="bg-gradient-to-r from-[#972c83] to-[#f58f8a] bg-clip-text text-transparent">
                  Supplies
                </span>
              </h2>
            </div>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {littleList.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Workflow Steps ──────────────────────────────────── */}
      <section
        className="border-y py-20"
        style={{
          borderColor: "rgba(151,44,131,0.1)",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(151,44,131,0.03) 50%, transparent 100%)",
        }}
      >
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span
              className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em]"
              style={{ color: "#972c83" }}
            >
              How it works
            </span>
            <h2
              className="mt-3 text-4xl font-bold"
              style={{ fontFamily: "Newsreader, Georgia, serif" }}
            >
              From order to{" "}
              <span className="bg-gradient-to-r from-[#972c83] to-[#f58f8a] bg-clip-text text-transparent">
                doorstep
              </span>
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-8 md:grid-cols-4">
            {workflowSteps.map((step, i) => (
              <Reveal key={step.title} delay={i * 100}>
                <div className="group relative text-center">
                  {/* Connector line with animated pulse dot */}
                  {i < workflowSteps.length - 1 && (
                    <>
                      <div
                        className="absolute left-[60%] top-8 hidden h-0.5 w-[80%] md:block"
                        style={{
                          background: `linear-gradient(90deg, ${step.color}, ${workflowSteps[i + 1].color})`,
                        }}
                      />
                      <div
                        className="absolute left-[calc(60%+70%)] top-6 hidden h-5 w-5 animate-ping rounded-full md:block"
                        style={{
                          background: workflowSteps[i + 1].color,
                          opacity: 0.3,
                        }}
                      />
                    </>
                  )}
                  {/* Step circle */}
                  <div
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}, ${step.color}99)`,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    className="mt-4 block font-mono text-xs uppercase tracking-[0.18em]"
                    style={{ color: "#972c83" }}
                  >
                    Step {i + 1}
                  </span>
                  <h3
                    className="mt-1 text-xl font-semibold"
                    style={{ fontFamily: "Newsreader, Georgia, serif" }}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm" style={{ color: "#a0a0a0" }}>
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <section className="container-page py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em]"
            style={{ color: "#972c83" }}
          >
            <Quote size={13} /> What our clients say
          </span>
          <h2
            className="mt-3 text-4xl font-bold"
            style={{ fontFamily: "Newsreader, Georgia, serif" }}
          >
            Trusted by{" "}
            <span className="bg-gradient-to-r from-[#972c83] to-[#f58f8a] bg-clip-text text-transparent">
              many
            </span>
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div
                className="group relative overflow-hidden rounded-2xl border p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
                style={{ borderColor: "rgba(151,44,131,0.15)" }}
              >
                {/* Top gradient line */}
                <div
                  className="absolute inset-x-0 top-0 h-1 transition-all duration-500 group-hover:h-1.5"
                  style={{
                    background: `linear-gradient(90deg, #972c83, #f58f8a)`,
                  }}
                />
                <Quote
                  size={24}
                  className="mb-3 opacity-30"
                  style={{ color: "#972c83" }}
                />
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#a0a0a0" }}
                >
                  "{t.text}"
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #972c83, #f58f8a)",
                    }}
                  >
                    {t.name[0]}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#EBEBEB]">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-[#a0a0a0]">{t.role}</p>
                  </div>
                </div>
                {/* Stars */}
                <div className="absolute right-4 top-4 flex gap-0.5">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} size={11} fill="#f58f8a" color="#f58f8a" />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="container-page pb-24">
        <Reveal>
          <div
            className="group relative overflow-hidden rounded-3xl p-12 text-center sm:p-20"
            style={{
              background:
                "linear-gradient(135deg, rgba(151,44,131,0.12), rgba(245,143,138,0.08))",
              border: "1px solid rgba(151,44,131,0.2)",
            }}
          >
            {/* Animated gradient particles */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className="absolute -left-16 -top-16 h-40 w-40 animate-pulse rounded-full opacity-20 blur-[80px] transition-all duration-1000 group-hover:opacity-40"
                style={{ background: "#972c83", animationDuration: "7s" }}
              />
              <div
                className="absolute -bottom-16 -right-16 h-40 w-40 animate-pulse rounded-full opacity-20 blur-[80px] transition-all duration-1000 group-hover:opacity-40"
                style={{
                  background: "#f58f8a",
                  animationDuration: "9s",
                  animationDelay: "1s",
                }}
              />
            </div>

            <div className="relative">
              <span
                className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium"
                style={{
                  borderColor: "rgba(151,44,131,0.3)",
                  color: "#f58f8a",
                }}
              >
                <ShoppingCart size={13} /> Start cleaning
              </span>
              <h2
                className="mt-6 text-3xl font-bold sm:text-4xl"
                style={{ fontFamily: "Newsreader, Georgia, serif" }}
              >
                Ready to stock{" "}
                <span className="bg-gradient-to-r from-[#972c83] to-[#f58f8a] bg-clip-text text-transparent">
                  up
                </span>
                ?
              </h2>
              <p className="mx-auto mt-4 max-w-xl" style={{ color: "#a0a0a0" }}>
                Browse our full range of cleaning supplies and get them
                delivered to your doorstep.
              </p>
              <Link
                to="/catalog"
                className="group/btn relative mt-8 inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-8 py-4 text-base font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #972c83, #f58f8a)",
                }}
              >
                <span
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/btn:opacity-100"
                  style={{
                    background: "linear-gradient(135deg, #f58f8a, #972c83)",
                  }}
                />
                <span className="relative flex items-center gap-2">
                  Browse Supplies{" "}
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover/btn:translate-x-1"
                  />
                </span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
