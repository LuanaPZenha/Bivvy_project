import { useMemo, useState } from 'react';
import {
  GearCategory,
  Listing,
  MarketMode,
  MOCK_LISTINGS,
} from '../types/listing';

export function useListings(
  initialCategory: GearCategory = 'all',
  initialMode: MarketMode = 'rent',
) {
  const [category, setCategory] = useState<GearCategory>(initialCategory);
  const [mode, setMode] = useState<MarketMode>(initialMode);
  const [query, setQuery] = useState('');

  const listings = useMemo(() => {
    return MOCK_LISTINGS.filter((item: Listing) => {
      const modeOk = item.mode === mode;
      const catOk = category === 'all' || item.category === category;
      const q = query.trim().toLowerCase();
      const queryOk = !q || item.title.toLowerCase().includes(q);
      return modeOk && catOk && queryOk;
    });
  }, [category, mode, query]);

  return {
    category,
    setCategory,
    mode,
    setMode,
    query,
    setQuery,
    listings,
    count: listings.length,
  };
}
