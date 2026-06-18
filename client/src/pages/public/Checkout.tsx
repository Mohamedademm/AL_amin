import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderApi, spotApi } from '../../services/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ProductImage } from '../../components/common/ProductImage';
import { formatPrice, effectivePrice } from '../../utils/format';

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: spots } = useQuery({ queryKey: ['spots'], queryFn: spotApi.list });
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [spotId, setSpotId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!address || !phone) {
      setError('Please provide a delivery address and phone number.');
      return;
    }
    setSubmitting(true);
    try {
      await orderApi.create({
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        address,
        phone,
        spotId: spotId || undefined,
      });
      clear();
      navigate('/orders?success=1');
    } catch {
      setError('Could not place the order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-3xl font-bold">Nothing to check out</h1>
        <Link to="/catalog" className="mt-4 inline-block text-primary hover:underline">Browse the catalog</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary">
        <ArrowLeft size={16} /> Back to cart
      </Link>
      <h1 className="mt-4 text-4xl font-bold">Checkout</h1>

      <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><MapPin size={18} className="text-primary" /> Delivery details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input label="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city" required />
              </div>
              <Input label="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+216 …" required />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-content">Preferred boutique</label>
                <select value={spotId} onChange={(e) => setSpotId(e.target.value)} className="input-base">
                  <option value="">Auto (smart routing)</option>
                  {spots?.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.location}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-semibold">Items</h2>
            <div className="mt-4 space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-lg bg-surface-2">
                    <ProductImage src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-content">{product.name}</p>
                    <p className="text-xs text-muted">Qty {quantity}</p>
                  </div>
                  <span className="font-mono text-sm">{formatPrice(effectivePrice(product) * quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold">Summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-content/80">Subtotal</span><span className="font-mono">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-content/80">Delivery</span><span className="text-muted">Free</span></div>
            <div className="flex justify-between border-t border-line pt-3"><span className="font-semibold">Total</span><span className="font-mono text-lg font-bold">{formatPrice(subtotal)}</span></div>
          </div>
          {error && <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
          <Button type="submit" size="lg" disabled={submitting} className="mt-6 w-full">
            {submitting ? 'Placing order…' : <><CheckCircle2 size={18} /> Place order</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
