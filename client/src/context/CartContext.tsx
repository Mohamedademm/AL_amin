import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '../types';
import { effectivePrice } from '../utils/format';

interface CartContextValue {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// Load the persisted cart from localStorage (safe against bad JSON).
const loadCart = (): CartItem[] => {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
};

// Client-side shopping cart, persisted across reloads.
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const add = (product: Product, qty = 1) =>
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i));
      }
      return [...prev, { product, quantity: qty }];
    });

  const remove = (productId: string) => setItems((prev) => prev.filter((i) => i.product.id !== productId));

  const setQty = (productId: string, qty: number) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i)),
    );

  const clear = () => setItems([]);

  const { count, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, i) => {
        acc.count += i.quantity;
        acc.subtotal += effectivePrice(i.product) * i.quantity;
        return acc;
      },
      { count: 0, subtotal: 0 },
    );
  }, [items]);

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, clear, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook to access cart state and actions.
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
