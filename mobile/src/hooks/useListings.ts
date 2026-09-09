import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_SEATTLE_ZIP } from '../data/seattleZips';
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
        });
        if (cancelled || requestId !== requestIdRef.current) return;
        setListings(result.listings);
        setUsingFallback(false);
      } catch {
        if (cancelled || requestId !== requestIdRef.current) return;
        setListings(filterMockListings({ category, mode, query }));
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
  }, [category, mode, query, zipCode, reloadToken]);

  return {
    category,
    setCategory,
    mode,
    setMode,
    query,
    setQuery,
    zipCode,
    setZipCode,
    listings,
    count: listings.length,
    isLoading,
    usingFallback,
    reload,
  };
}
