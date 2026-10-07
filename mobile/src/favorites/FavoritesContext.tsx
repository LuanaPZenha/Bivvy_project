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

const STORAGE_KEY = 'bivvy_favorites_v1';

type FavoritesContextValue = {
  ids: string[];
  listings: Listing[];
  count: number;
  isFavorite: (listingId: string) => boolean;
  toggleFavorite: (listing: Listing) => void;
  removeFavorite: (listingId: string) => void;
  ready: boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadJson<Listing[]>(STORAGE_KEY, []);
      if (!cancelled) {
        setListings(Array.isArray(stored) ? stored : []);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void saveJson(STORAGE_KEY, listings);
  }, [listings, ready]);

  const isFavorite = useCallback(
    (listingId: string) => listings.some((item) => item.id === listingId),
    [listings],
  );

  const toggleFavorite = useCallback((listing: Listing) => {
    setListings((prev) => {
      if (prev.some((item) => item.id === listing.id)) {
        return prev.filter((item) => item.id !== listing.id);
      }
      return [...prev, listing];
    });
  }, []);

  const removeFavorite = useCallback((listingId: string) => {
    setListings((prev) => prev.filter((item) => item.id !== listingId));
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      ids: listings.map((item) => item.id),
      listings,
      count: listings.length,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      ready,
    }),
    [listings, isFavorite, toggleFavorite, removeFavorite, ready],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
