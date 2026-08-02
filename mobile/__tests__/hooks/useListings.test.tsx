import { renderHook, act } from '@testing-library/react-native';
import { useListings } from '../../src/hooks/useListings';

describe('useListings', () => {
  it('defaults to rent mode and filters by category', () => {
    const { result } = renderHook(() => useListings('all', 'rent'));
    expect(result.current.count).toBeGreaterThan(0);
    expect(result.current.listings.every((l) => l.mode === 'rent')).toBe(true);

    act(() => {
      result.current.setCategory('hiking');
    });

    expect(result.current.listings.every((l) => l.category === 'hiking')).toBe(true);
  });

  it('filters by market mode', () => {
    const { result } = renderHook(() => useListings());

    act(() => {
      result.current.setMode('buy');
    });

    expect(result.current.listings.length).toBeGreaterThan(0);
    expect(result.current.listings.every((l) => l.mode === 'buy')).toBe(true);
  });

  it('filters by search query', () => {
    const { result } = renderHook(() => useListings());

    act(() => {
      result.current.setQuery('Tent');
    });

    expect(result.current.listings.every((l) => l.title.includes('Tent'))).toBe(true);
  });
});
