import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { ProductImage } from '../../components/common/ProductImage';
import { buttonClasses } from '../../components/ui/Button';
import { formatPrice } from '../../utils/format';

export default function Cart() {
  const { items, setQty, remove, subtotal, count } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center justify-center py-28 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <ShoppingBag size={34} />
        </span>
        <h1 className="mt-6 text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted">Browse the catalog and add some products.</p>
        <Link to="/catalog" className={buttonClasses('primary', 'lg', 'mt-8')}>
          Browse Catalog <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-4xl font-bold">Shopping Cart</h1>
      <p className="mt-2 text-muted">{count} item{count > 1 ? 's' : ''} in your cart</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-4 rounded-2xl border border-line bg-surface p-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                <ProductImage src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/product/${product.id}`} className="font-medium text-content hover:text-primary">{product.name}</Link>
                    {product.category && <p className="text-xs text-muted">{product.category.name}</p>}
                  </div>
                  <button onClick={() => remove(product.id)} className="text-muted transition-colors hover:text-red-500" aria-label="Remove">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-lg border border-line">
                    <button onClick={() => setQty(product.id, quantity - 1)} className="p-2 text-muted hover:text-primary" aria-label="Decrease"><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <button onClick={() => setQty(product.id, quantity + 1)} className="p-2 text-muted hover:text-primary" aria-label="Increase"><Plus size={14} /></button>
                  </div>
                  <span className="font-mono font-semibold text-content">{formatPrice(Number(product.price) * quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            <Row label="Delivery" value="Calculated at checkout" muted />
            <div className="border-t border-line pt-3">
              <Row label="Total" value={formatPrice(subtotal)} bold />
            </div>
          </div>
          <Link to="/checkout" className={buttonClasses('primary', 'lg', 'mt-6 w-full')}>
            Proceed to Checkout <ArrowRight size={18} />
          </Link>
          <Link to="/catalog" className="mt-3 block text-center text-sm text-muted hover:text-primary">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'text-muted' : 'text-content/80'}>{label}</span>
      <span className={bold ? 'font-mono text-lg font-bold text-content' : 'font-mono text-content'}>{value}</span>
    </div>
  );
}
