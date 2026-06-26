import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { productApi } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { ProductImage } from "../../components/common/ProductImage";
import { ProductCard } from "../../components/common/ProductCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { PageLoader } from "../../components/ui/Spinner";
import { formatPrice } from "../../utils/format";
import { cn } from "../../lib/cn";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.get(id!),
    enabled: !!id,
  });
  const { data: all } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.list,
  });

  if (isLoading)
    return (
      <div className="container-page">
        <PageLoader />
      </div>
    );
  if (!product)
    return (
      <div className="container-page py-24 text-center text-muted">
        Product not found.
      </div>
    );

  // Collect all image sources: gallery images + legacy imageUrl fallback.
  const allImages = (
    product.images?.length ? product.images.map((img) => img.url) : []
  ).filter(Boolean) as string[];
  if (product.imageUrl && !allImages.includes(product.imageUrl))
    allImages.unshift(product.imageUrl);
  const currentImage = allImages[imgIdx] || product.imageUrl;

  const related = (all ?? [])
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const buyNow = () => {
    add(product, qty);
    navigate("/cart");
  };

  const prevImg = () =>
    setImgIdx((i) => (i - 1 + allImages.length) % allImages.length);
  const nextImg = () => setImgIdx((i) => (i + 1) % allImages.length);

  return (
    <div className="container-page py-10">
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} /> Back to catalog
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Image gallery */}
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-surface-2">
            <ProductImage
              src={currentImage}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
                <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs text-white backdrop-blur-sm">
                  {imgIdx + 1} / {allImages.length}
                </span>
              </>
            )}
          </div>
          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {allImages.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={cn(
                    "h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                    i === imgIdx
                      ? "border-primary"
                      : "border-line opacity-60 hover:opacity-100",
                  )}
                >
                  <ProductImage
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {product.category && (
            <Badge tone="primary" className="w-fit">
              {product.category.name}
            </Badge>
          )}
          <h1 className="mt-4 text-4xl font-bold">{product.name}</h1>
          <div className="mt-3 flex items-baseline gap-3">
            <p className="font-mono text-3xl font-semibold text-gradient">
              {formatPrice(product.discountedPrice ?? product.price)}
            </p>
            {!!product.discountPercent && (
              <>
                <span className="font-mono text-lg text-muted line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  −{product.discountPercent}%
                </span>
              </>
            )}
          </div>
          <p className="mt-6 leading-relaxed text-muted">
            {product.description}
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-xl border border-line">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="p-3 text-muted hover:text-primary"
                aria-label="Decrease"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="p-3 text-muted hover:text-primary"
                aria-label="Increase"
              >
                <Plus size={16} />
              </button>
            </div>
            <Button onClick={handleAdd} variant="outline" size="lg">
              {added ? (
                <>
                  <Check size={18} /> Added
                </>
              ) : (
                <>
                  <ShoppingCart size={18} /> Add to cart
                </>
              )}
            </Button>
          </div>

          <Button onClick={buyNow} size="lg" className="mt-3 w-full sm:w-auto">
            Buy now
          </Button>

          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-line pt-6 text-sm">
            <Info label="Surface" value="All-purpose safe" />
            <Info label="Scent" value="Fresh & clean" />
            <Info label="Volume" value="See product details" />
            <Info label="Delivery" value="Order tracking" />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold">Related products</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-0.5 text-content">{value}</p>
    </div>
  );
}
