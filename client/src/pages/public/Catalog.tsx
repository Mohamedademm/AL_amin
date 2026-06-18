import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, PackageOpen } from 'lucide-react';
import { productApi, categoryApi } from '../../services/api';
import { ProductCard } from '../../components/common/ProductCard';
import { Reveal } from '../../components/ui/Reveal';
import { PageLoader } from '../../components/ui/Spinner';
import { cn } from '../../lib/cn';

export default function Catalog() {
  const { data: products, isLoading } = useQuery({ queryKey: ['products'], queryFn: productApi.list });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoryApi.list });

  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string>('all');

  const filtered = useMemo(() => {
    return (products ?? []).filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCat === 'all' || p.categoryId === activeCat;
      return matchesSearch && matchesCat;
    });
  }, [products, search, activeCat]);

  return (
    <div className="container-page py-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="label-mono">Storefront</span>
          <h1 className="mt-2 text-4xl font-bold">Product Catalog</h1>
          <p className="mt-2 text-muted">Browse {products?.length ?? 0} products across every boutique.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="input-base pl-11"
          />
        </div>
      </div>

      {/* Category filter chips */}
      <div className="mt-8 flex flex-wrap gap-2">
        <CategoryChip active={activeCat === 'all'} onClick={() => setActiveCat('all')}>All</CategoryChip>
        {categories?.map((c) => (
          <CategoryChip key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)}>
            {c.name}
          </CategoryChip>
        ))}
      </div>

      {isLoading ? (
        <PageLoader label="Loading catalog" />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted">
          <PackageOpen size={40} className="opacity-50" />
          <p>No products match your search.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {filtered.map((p, i) => (
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
function CategoryChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
        active
          ? 'border-primary bg-primary text-primary-contrast'
          : 'border-line text-muted hover:border-primary/50 hover:text-content',
      )}
    >
      {children}
    </button>
  );
}
