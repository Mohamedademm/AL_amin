import { useState } from "react";
import { cn } from "../../lib/cn";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

// Product image with a graceful magenta-gradient fallback if the URL fails.
export function ProductImage({ src, alt, className }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-primary/15 via-surface-2 to-primary/5",
          className,
        )}
      >
        <span className="font-serif text-4xl font-bold text-primary/40">
          {alt?.[0]?.toUpperCase() || "A"}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

export default ProductImage;
