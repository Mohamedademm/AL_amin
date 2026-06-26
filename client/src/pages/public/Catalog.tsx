import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, PackageOpen, SlidersHorizontal } from "lucide-react";
import { productApi, categoryApi } from "../../services/api";
import { ProductCard } from "../../components/common/ProductCard";
import { ProductCardSkeleton } from "../../components/ui/Skeleton";
import { Reveal } from "../../components/ui/Reveal";
import { cn } from "../../lib/cn";
import { effectivePrice } from "../../utils/format";

type SortKey = "featured" | "price-asc" | "price-desc" | "name" | "newest";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "name", label: "Name (A–Z)" },
  { key: "newest", label: "Newest" },
];

export default function Catalog() {
  const [params] = useSearchParams();
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.list,
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.list,
  });

  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>(
    params.get("cat") ?? "all",
  );

  // Sync URL param into active category when navigating from home.
  useEffect(() => {
    const cat = params.get("cat");
    if (cat) setActiveCat(cat);
  }, [params]);
  const [sort, setSort] = useState<SortKey>("featured");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Filter by search, category and price range (price uses the discounted value).
  const filtered = useMemo(() => {
    const min = minPrice ? parseFloat(minPrice) : -Infinity;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    return (products ?? []).filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCat === "all" || p.categoryId === activeCat;
      const price = effectivePrice(p);
      return matchesSearch && matchesCat && price >= min && price <= max;
    });
  }, [products, search, activeCat, minPrice, maxPrice]);

  // Apply the chosen sort order.
  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "price-asc":
        arr.sort((a, b) => effectivePrice(a) - effectivePrice(b));
        break;
      case "price-desc":
        arr.sort((a, b) => effectivePrice(b) - effectivePrice(a));
        break;
      case "name":
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        arr.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        );
        break;
    }
    return arr;
  }, [filtered, sort]);

  return (
    <div className="container-page py-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="label-mono">Cleaning supplies</span>
          <h1 className="mt-2 text-4xl font-bold">Cleaning Products</h1>
          <p className="mt-2 text-muted">
            Browse {products?.length ?? 0} cleaning products — detergents, tools
            & supplies.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cleaning products…"
            className="input-base pl-11"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="mt-8 flex flex-wrap gap-2">
        <CategoryChip
          active={activeCat === "all"}
          onClick={() => setActiveCat("all")}
        >
          All
        </CategoryChip>
        {categories?.map((c) => (
          <CategoryChip
            key={c.id}
            active={activeCat === c.id}
            onClick={() => setActiveCat(c.id)}
          >
            {c.name}
          </CategoryChip>
        ))}
      </div>

      {/* Sort + price range toolbar */}
      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-line bg-surface/50 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted">
          <SlidersHorizontal size={16} className="text-primary" />
          <span>
            {sorted.length} result{sorted.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              className="w-20 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-primary"
            />
            <span className="text-muted">–</span>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              className="w-20 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-primary"
            />
            <span className="text-xs text-muted">TND</span>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
          >
            {sortOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted">
          <PackageOpen size={40} className="opacity-50" />
          <p>No products match your filters.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {sorted.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 60}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

// Pill toggle for filtering by category.
function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
        active
          ? "border-primary bg-primary text-primary-contrast"
          : "border-line text-muted hover:border-primary/50 hover:text-content",
      )}
    >
      {children}
    </button>
  );
}
