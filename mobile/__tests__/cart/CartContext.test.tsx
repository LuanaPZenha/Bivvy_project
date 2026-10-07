import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { CartProvider, useCart } from '../../src/cart/CartContext';
import type { Listing } from '../../src/types/listing';

jest.mock('../../src/storage/localStore', () => ({
  loadJson: jest.fn(async (_key: string, fallback: unknown) => fallback),
  saveJson: jest.fn(async () => undefined),
}));

const buyListing: Listing = {
  id: 'lst_buy',
  title: 'Camp Stove',
  category: 'camping',
  mode: 'buy',
  buyPrice: 65,
  distanceMiles: 1,
  rating: 4.5,
  reviewCount: 10,
  ownerName: 'Ava',
  isPro: false,
  thumbnailTone: 'forest',
  description: 'Kit',
  images: [],
};

const rentListing: Listing = {
  ...buyListing,
  id: 'lst_rent',
  mode: 'rent',
  pricePerDay: 20,
  buyPrice: undefined,
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

describe('CartContext', () => {
  test('adds buy listings and rejects rent listings', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));

    act(() => {
      const ok = result.current.addItem(buyListing);
      expect(ok.ok).toBe(true);
    });
    expect(result.current.count).toBe(1);
    expect(result.current.subtotal).toBe(65);

    act(() => {
      const bad = result.current.addItem(rentListing);
      expect(bad.ok).toBe(false);
    });
    expect(result.current.count).toBe(1);

    act(() => {
      result.current.removeItem('lst_buy');
    });
    expect(result.current.count).toBe(0);
  });
});
