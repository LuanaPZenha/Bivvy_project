import { useMemo, useState } from 'react';
import { GearCategory, Listing, MOCK_LISTINGS } from '../types/listing';

export function useListings(initialCategory: GearCategory = 'all') {
  const [category, setCategory] = useState<GearCategory>(initialCategory);
  const [query, setQuery] = useState('');

  const listings = useMemo(() => {
    return MOCK_LISTINGS.filter((item: Listing) => {
      const catOk = category === 'all' || item.category === category;
      const q = query.trim().toLowerCase();
      const queryOk = !q || item.title.toLowerCase().includes(q);
      return catOk && queryOk;
    });
  }, [category, query]);

  return {
    category,
    setCategory,
    query,
    setQuery,
    listings,
    count: listings.length,
  };
}
