import { Link } from "react-router-dom";
import { Check, SprayCan as Spray } from "lucide-react";
import { useState } from "react";
import type { Product } from "../../types";
import { useCart } from "../../context/CartContext";
import { ProductImage } from "./ProductImage";
import { Badge } from "../ui/Badge";
import { formatPrice } from "../../utils/format";

// Storefront product tile with image, category, price and quick add-to-cart.
export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.category && (
          <span className="absolute left-3 top-3">
            <Badge tone="primary">{product.category.name}</Badge>
          </span>
        )}
        {!!product.discountPercent && (
          <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white shadow">
            −{product.discountPercent}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-medium text-content">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-semibold text-content">
              {formatPrice(product.discountedPrice ?? product.price)}
            </span>
            {!!product.discountPercent && (
              <span className="font-mono text-xs text-muted line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </span>
          <button
            onClick={handleAdd}
            aria-label="Add to cart"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:bg-primary hover:text-primary-contrast"
          >
            {added ? <Check size={17} /> : <Spray size={16} />}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
