import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Listing } from '../types/listing';
import { loadJson, saveJson } from '../storage/localStore';

const STORAGE_KEY = 'bivvy_cart_v1';

export type CartItem = {
  listingId: string;
  listing: Listing;
  addedAt: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (listing: Listing) => { ok: true } | { ok: false; error: string };
  removeItem: (listingId: string) => void;
  clear: () => void;
  hasItem: (listingId: string) => boolean;
  ready: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadJson<CartItem[]>(STORAGE_KEY, []);
      if (!cancelled) {
        setItems(Array.isArray(stored) ? stored : []);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void saveJson(STORAGE_KEY, items);
  }, [items, ready]);

  const addItem = useCallback((listing: Listing) => {
    if (listing.mode !== 'buy') {
      return { ok: false as const, error: 'Only buy listings can be added to the cart' };
    }
    if (listing.buyPrice == null || Number.isNaN(Number(listing.buyPrice))) {
      return { ok: false as const, error: 'Listing is missing a buy price' };
    }
    setItems((prev) => {
      if (prev.some((item) => item.listingId === listing.id)) return prev;
      return [
        ...prev,
        {
          listingId: listing.id,
          listing,
          addedAt: new Date().toISOString(),
        },
      ];
    });
    return { ok: true as const };
  }, []);

  const removeItem = useCallback((listingId: string) => {
    setItems((prev) => prev.filter((item) => item.listingId !== listingId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const hasItem = useCallback(
    (listingId: string) => items.some((item) => item.listingId === listingId),
    [items],
  );

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.listing.buyPrice) || 0), 0);
    return {
      items,
      count: items.length,
      subtotal,
      addItem,
      removeItem,
      clear,
      hasItem,
      ready,
    };
  }, [items, addItem, removeItem, clear, hasItem, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
