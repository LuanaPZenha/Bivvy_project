import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_SEATTLE_ZIP } from '../data/seattleZips';
import type { SortOption } from '../components/FilterSheet';
import { fetchNearYou } from '../services/api';
import {
  GearCategory,
  Listing,
  MarketMode,
  filterMockListings,
} from '../types/listing';

const DEBOUNCE_MS = 300;

export function useListings(
  initialCategory: GearCategory = 'all',
  initialMode: MarketMode = 'rent',
) {
  const [category, setCategory] = useState<GearCategory>(initialCategory);
  const [mode, setMode] = useState<MarketMode>(initialMode);
  const [query, setQuery] = useState('');
  const [zipCode, setZipCode] = useState(DEFAULT_SEATTLE_ZIP);
  const [maxDistance, setMaxDistance] = useState(25);
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const requestIdRef = useRef(0);

  const reload = useCallback(() => {
    setReloadToken((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const requestId = ++requestIdRef.current;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const result = await fetchNearYou({
          category,
          mode,
          q: query,
          zip: zipCode,
          maxDistance,
          sort: sortBy,
        });
        if (cancelled || requestId !== requestIdRef.current) return;
        setListings(result.listings);
        setUsingFallback(false);
      } catch {
        if (cancelled || requestId !== requestIdRef.current) return;
        let fallback = filterMockListings({ category, mode, query });
        fallback = fallback.filter((item) => item.distanceMiles <= maxDistance);
        if (sortBy === 'price_asc') {
          fallback = [...fallback].sort(
            (a, b) =>
              (a.mode === 'buy' ? a.buyPrice || 0 : a.pricePerDay || 0) -
              (b.mode === 'buy' ? b.buyPrice || 0 : b.pricePerDay || 0),
          );
        } else if (sortBy === 'price_desc') {
          fallback = [...fallback].sort(
            (a, b) =>
              (b.mode === 'buy' ? b.buyPrice || 0 : b.pricePerDay || 0) -
              (a.mode === 'buy' ? a.buyPrice || 0 : a.pricePerDay || 0),
          );
        } else if (sortBy === 'rating') {
          fallback = [...fallback].sort((a, b) => b.rating - a.rating);
        } else {
          fallback = [...fallback].sort((a, b) => a.distanceMiles - b.distanceMiles);
        }
        setListings(fallback);
        setUsingFallback(true);
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [category, mode, query, zipCode, maxDistance, sortBy, reloadToken]);

  return {
    category,
    setCategory,
    mode,
    setMode,
    query,
    setQuery,
    zipCode,
    setZipCode,
    maxDistance,
    setMaxDistance,
    sortBy,
    setSortBy,
    listings,
    count: listings.length,
    isLoading,
    usingFallback,
    reload,
  };
}
