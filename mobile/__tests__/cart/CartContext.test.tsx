import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { CartProvider, useCart } from '../../src/cart/CartContext';
import type { Listing } from '../../src/types/listing';

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
  test('adds buy listings and rejects rent listings', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

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
