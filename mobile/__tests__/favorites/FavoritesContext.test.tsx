import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { FavoritesProvider, useFavorites } from '../../src/favorites/FavoritesContext';
import type { Listing } from '../../src/types/listing';

jest.mock('../../src/storage/localStore', () => ({
  loadJson: jest.fn(async (_key: string, fallback: unknown) => fallback),
  saveJson: jest.fn(async () => undefined),
}));

const listing: Listing = {
  id: 'lst_fav',
  title: 'Saved Tent',
  category: 'camping',
  mode: 'rent',
  pricePerDay: 28,
  distanceMiles: 1,
  rating: 4.9,
  reviewCount: 10,
  ownerName: 'Mara',
  isPro: false,
  thumbnailTone: 'forest',
  description: 'Tent',
  images: [],
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <FavoritesProvider>{children}</FavoritesProvider>;
}

describe('FavoritesContext', () => {
  it('toggles saved listings', async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));

    act(() => {
      result.current.toggleFavorite(listing);
    });
    expect(result.current.isFavorite('lst_fav')).toBe(true);
    expect(result.current.count).toBe(1);

    act(() => {
      result.current.toggleFavorite(listing);
    });
    expect(result.current.isFavorite('lst_fav')).toBe(false);
    expect(result.current.count).toBe(0);
  });
});
